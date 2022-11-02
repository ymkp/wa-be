import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { WA_WORKER_SEND_TEXT } from '../constants/whatsapp-client-url.constants';
import { WHATSAPP_MESSAGE_CONTENT_TYPE } from '../constants/whatsapp-message-content-type.constants';
import { WHATSAPP_MESSAGE_QUEUE_STATUS } from '../constants/whatsapp-message-queue-status.constants';
import { WhatsappWorkerResponseDTO } from '../dtos/whatsapp-worker.dto';
import { WhatsappMessage } from '../entities/whatsapp-message.entity';
import { WhatsappMessageRepository } from '../repositories/whatsapp-message.entity';
import { WhatsappCacheService } from './whatsapp-cache.service';
import { WhatsappCLientService } from './whatsapp-client.service';
var FormData = require('form-data');

@Injectable()
export class WHatsappSchedulerService {
  constructor(
    private readonly messageRepo: WhatsappMessageRepository,
    private readonly httpService: HttpService,
    private readonly cacheService: WhatsappCacheService,
    private readonly clientService: WhatsappCLientService,
  ) {}

  onQueueMsg: WhatsappMessage[] = [];
  onProgressMsg: WhatsappMessage[] = [];
  failedMsgs: WhatsappMessage[] = [];

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

  public async getQueueMessage(): Promise<WhatsappMessage[]> {
    return this.onQueueMsg;
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
        await this.sendMessage(this.onProgressMsg[i]);
      } catch (err) {
        console.log('processOnQueue failed : ', this.onProgressMsg[i].id, err);
        await this.processFailedMessage(this.onProgressMsg[i]);
      }
    }
    this.onProgressMsg = [];
  }

  private async sendMessage(msg: WhatsappMessage): Promise<void> {
    if (msg.content.type === WHATSAPP_MESSAGE_CONTENT_TYPE.TEXT) {
      const msgid = await this.sendTextMessage(
        msg.clientId,
        msg.content.content,
        msg.contact.msisdn,
      );
      msg.status = WHATSAPP_MESSAGE_QUEUE_STATUS.SENT;
      msg.messageId = msgid;
      await this.messageRepo.save(msg);
    } else {
      throw new BadRequestException();
    }
  }

  private async sendTextMessage(
    clientId: number,
    text: string,
    recipient: string,
  ): Promise<string> {
    console.log('try to send message to : ', recipient);
    const c = await this.cacheService.getTokenFromClientId(clientId);
    const url = `${c.fullUrl}${WA_WORKER_SEND_TEXT}`;
    const bodyFormData = new FormData();
    bodyFormData.append('msisdn', recipient);
    bodyFormData.append('message', text);
    const res = await firstValueFrom(
      this.httpService.post<WhatsappWorkerResponseDTO<{ msgid: string }>>(
        url,
        bodyFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${c.token}`,
          },
        },
      ),
    );
    return res.data.data.msgid;
  }

  private async processFailedMessage(msg: WhatsappMessage): Promise<void> {
    msg.status = WHATSAPP_MESSAGE_QUEUE_STATUS.FAILED;
    await this.messageRepo.save(msg);
  }
}
