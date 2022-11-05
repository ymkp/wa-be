import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { WHATSAPP_MESSAGE_CONTENT_TYPE } from '../constants/whatsapp-message-content-type.constants';
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
import { WHatsappSchedulerService } from './whatsapp-scheduler.service';
import { WhatsappContactService } from './whtasapp-contact.service';

@Injectable()
export class WhatsappMessageService {
  constructor(
    private readonly messageRepo: WhatsappMessageRepository,
    private readonly contentRepo: WhatsappMessageContentRepository,
    private readonly contactService: WhatsappContactService,
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

  public async getMessageWithPagination(
    paginationQ: PaginationParamsDto,
    filterQ: WhatsappMessageFilterInput,
  ): Promise<BaseApiResponse<WhatsappMessageOutputDTOMini[]>> {
    const options: FindManyOptions<WhatsappMessage> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
    };
    const where: FindOptionsWhere<WhatsappMessage> = {};
    if (filterQ.clientId) where.clientId = filterQ.clientId;
    if (filterQ.status) where.status = filterQ.status;
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
