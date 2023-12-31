import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { WHATSAPP_MESSAGE_CONTENT_TYPE } from '../constants/whatsapp-message-content-type.constant';
import { WHATSAPP_MESSAGE_QUEUE_STATUS } from '../constants/whatsapp-message-queue-status.constant';
import { WhatsappClientOutputDTO } from '../dtos/whatsapp-client-output.dto';
import {
  CreateWhatsappMessageInput,
  WhatsappMessageFilterInput,
} from '../dtos/whatsapp-message-input.dto';
import {
  WhatsappMessageOutputDTO,
  WhatsappMessageOutputDTOMini,
} from '../dtos/whatsapp-message-output.dto';
import { WhatsappMessage } from '../entities/whatsapp-message.entity';
import { WhatsappMessageContentRepository } from '../repositories/whatsapp-message-content.repository';
import { WhatsappMessageRepository } from '../repositories/whatsapp-message.entity';
import { WhatsappCLientService } from './whatsapp-client.service';
import { WHatsappSchedulerService } from './whatsapp-scheduler.service';
import { WhatsappContactService } from './whtasapp-contact.service';

@Injectable()
export class WhatsappMessageService {
  constructor(
    private readonly messageRepo: WhatsappMessageRepository,
    private readonly contentRepo: WhatsappMessageContentRepository,
    private readonly contactService: WhatsappContactService,
    private readonly clientService: WhatsappCLientService,
    private readonly schedulerService: WHatsappSchedulerService,
  ) {}

  onQueueMsg: WhatsappMessage[] = [];
  onProgressMsg: WhatsappMessage[] = [];
  failedMsgs: WhatsappMessage[] = [];

  public async addTextMessage(
    input: CreateWhatsappMessageInput,
    userId: number,
  ): Promise<WhatsappMessageOutputDTO> {
    // ? 1. get it on the queue
    if (input.clientId) {
      const client = await this.clientService.getClientById(input.clientId);
      if (!client.isActive)
        throw new BadRequestException('Client sedang tidak aktif');
    }
    const contact = await this.contactService.getOrCreateContact(
      input.contactMsisdn,
    );
    const content = await this.contentRepo.save({
      content: input.content,
      type: WHATSAPP_MESSAGE_CONTENT_TYPE.TEXT,
    });
    const m = await this.messageRepo.save({
      clientId: input.clientId,
      contact,
      content,
      createdById: userId,
    });
    this.schedulerService.addQueue(m);
    return plainToInstance(WhatsappMessageOutputDTO, m);
  }

  public async retryMessage(
    id: number,
    waMessage?: WhatsappMessage,
  ): Promise<WhatsappMessageOutputDTO> {
    let message: WhatsappMessage;
    if (waMessage) {
      message = waMessage;
    } else {
      message = await this.messageRepo.findOne({
        where: { id, status: WHATSAPP_MESSAGE_QUEUE_STATUS.FAILED },
        relations: ['client', 'contact', 'content'],
        loadEagerRelations: false,
      });
      if (!message) throw new NotFoundException('Pesan tidak ditemukan');
    }
    message.status = WHATSAPP_MESSAGE_QUEUE_STATUS.RETRYING;
    await this.messageRepo.save(message);
    this.schedulerService.addQueue(message);
    return plainToInstance(WhatsappMessageOutputDTO, message);
  }

  public async getMessageWithPagination(
    ctx: RequestContext,
    paginationQ: PaginationParamsDto,
    filterQ: WhatsappMessageFilterInput,
  ): Promise<BaseApiResponse<WhatsappMessageOutputDTOMini[]>> {
    const options: FindManyOptions<WhatsappMessage> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
      relations: ['client', 'contact', 'content', 'createdBy'],
      loadEagerRelations: false,
      select: {
        id: true,
        client: {
          id: true,
          name: true,
          msisdn: true,
        },
        createdBy: {
          id: true,
          name: true,
          identificationNo: true,
        },
        content: {
          content: true,
        },
        updatedAt: true,
        status: true,
      },
    };

    // ? IF SUPERADMIN see all
    const isSuperadmin: boolean = ctx.user.isSuperAdmin ?? false;
    const where: FindOptionsWhere<WhatsappMessage> = {};
    if (filterQ.clientId) where.clientId = filterQ.clientId;
    if (filterQ.status) where.status = filterQ.status;
    if (isSuperadmin) {
      if (filterQ.createdById) where.createdById = filterQ.createdById;
    } else {
      where.createdById = ctx.user.id;
    }
    options.where = where;
    const [res, count] = await this.messageRepo.findAndCount(options);
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(WhatsappMessageOutputDTOMini, res);
    return { data, meta };
  }

  public async getOnQueueMessages(): Promise<WhatsappMessageOutputDTOMini[]> {
    const res = await this.schedulerService.getOnQueueMessages();
    return plainToInstance(WhatsappMessageOutputDTOMini, res);
  }

  public async getOnProgressMessages(): Promise<
    WhatsappMessageOutputDTOMini[]
  > {
    const res = await this.schedulerService.getOnProgressMessages();
    return plainToInstance(WhatsappMessageOutputDTOMini, res);
  }

  public async getMessageDetail(id: number): Promise<WhatsappMessageOutputDTO> {
    const m = await this.messageRepo.getById(id);
    return plainToInstance(WhatsappMessageOutputDTO, m);
  }
}
