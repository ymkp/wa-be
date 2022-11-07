import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from 'src/user/repositories/user.repository';
import { WHATSAPP_CLIENT_STATUS } from '../constants/whatsapp-client-status.constant';
import { WA_WORKER_SEND_TEXT } from '../constants/whatsapp-client-url.constant';
import { WHATSAPP_MESSAGE_CONTENT_TYPE } from '../constants/whatsapp-message-content-type.constant';
import { WHATSAPP_MESSAGE_QUEUE_STATUS } from '../constants/whatsapp-message-queue-status.constant';
import { WhatsappWorkerResponseDTO } from '../dtos/whatsapp-worker.dto';
import { WhatsappMessage } from '../entities/whatsapp-message.entity';
import { WhatsappMessageRepository } from '../repositories/whatsapp-message.entity';
import { WhatsappCacheService } from './whatsapp-cache.service';
import { WhatsappCLientService } from './whatsapp-client.service';
import { WhatsappWorkerService } from './whatsapp-worker.service';

@Injectable()
export class WHatsappSchedulerService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly messageRepo: WhatsappMessageRepository,
    private readonly workerAPI: WhatsappWorkerService,
    private readonly cacheService: WhatsappCacheService,
    private readonly clientService: WhatsappCLientService,
    private readonly userRepo: UserRepository,
  ) {}

  onQueueMsg: WhatsappMessage[] = [];
  onProgressMsg: WhatsappMessage[] = [];
  failedMsgs: WhatsappMessage[] = [];

  onModuleInit() {
    this.onInit();
  }

  onModuleDestroy() {
    this.onDestroy();
  }

  onInit() {
    this.loadQueueMessage();
  }

  onDestroy() {}

  private async loadQueueMessage() {
    console.log('start load queue msgs');
    const messages = await this.messageRepo.find({
      where: {
        status: WHATSAPP_MESSAGE_QUEUE_STATUS.ONQUEUE,
      },
    });
    console.log('start load queue msgs : ', messages.length);
    messages.forEach((m) => {
      this.onQueueMsg.push(m);
    });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async checkWorkerStatusCRON() {
    this.checkAllWorkerStatus();
  }

  @Cron(CronExpression.EVERY_30_SECONDS, {
    name: 'cron-check-queue',
  })
  private async cronQueue() {
    console.log('start cron-check-queue');
    this.checkQueue();
  }

  public addQueue(msg: WhatsappMessage): void {
    this.onQueueMsg.push(msg);
  }

  public async getOnQueueMessages(): Promise<WhatsappMessage[]> {
    return this.onQueueMsg;
  }

  public async getOnProgressMessages(): Promise<WhatsappMessage[]> {
    return this.onProgressMsg;
  }

  public checkQueue() {
    if (this.onProgressMsg.length === 0) {
      this.processOnQueue();
    } else {
      console.log('there is still process ongoing');
    }
  }

  private async checkAllWorkerStatus(): Promise<void> {
    this.clientService.checkAndUpdateAllClientStatus();
  }

  private async transferFirst40OnQueueMsgs() {
    if (this.onQueueMsg.length > 0) {
      const len = this.onQueueMsg.length > 40 ? 40 : this.onQueueMsg.length;
      this.onProgressMsg = this.onQueueMsg.splice(0, len);
    } else {
      console.log('on queue is empty');
    }
  }

  private async processOnQueue() {
    this.transferFirst40OnQueueMsgs();
    for (let i = 0; i < this.onProgressMsg.length; i++) {
      try {
        await this.sendMessageWithKnownClientID(this.onProgressMsg[i]);
      } catch (err) {
        console.log('processOnQueue failed : ', this.onProgressMsg[i].id, err);
        await this.processFailedMessage(this.onProgressMsg[i]);
      }
    }
    this.onProgressMsg = [];
  }

  // TODO : implement this
  private async sendMessageWithoutClientId(msg: WhatsappMessage) {
    // FIXME : please use caching on this one
    const user = await this.userRepo.findOneOrFail({
      where: { id: msg.id },
      select: ['id', 'permittedClients'],
      relations: ['permittedClients'],
    });
  }
  private async sendMessageWithKnownClientID(
    msg: WhatsappMessage,
  ): Promise<void> {
    const c = await this.cacheService.getTokenFromClientId(msg.clientId);
    //  FIXME : caching status client
    // if (c.status && c.status === WHATSAPP_CLIENT_STATUS.ACTIVE) {
    if (msg.content.type === WHATSAPP_MESSAGE_CONTENT_TYPE.TEXT) {
      const msgid = await this.workerAPI.sendTextMessage(
        msg.clientId,
        msg.content.content,
        msg.contact.msisdn,
        c.fullUrl,
        c.token,
      );
      msg.status = WHATSAPP_MESSAGE_QUEUE_STATUS.SENT;
      msg.messageId = msgid;
      await this.messageRepo.save(msg);
    } else {
      throw new BadRequestException();
    }
    // } else {
    //   console.log('cache : ', c);
    //   throw new BadRequestException('client tidak siap untuk mengirim pesan');
    // }
  }

  private async processFailedMessage(msg: WhatsappMessage): Promise<void> {
    msg.status = WHATSAPP_MESSAGE_QUEUE_STATUS.FAILED;
    await this.messageRepo.save(msg);
  }
}
