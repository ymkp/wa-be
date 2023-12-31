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
import { EncryptService } from 'src/shared/signing/encrypt.service';
import { UserRepository } from 'src/user/repositories/user.repository';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { SMS_DELIVERY_STATUS } from '../constants/sms-message-status.const';
import {
  SMSMessageCreateInputDTO,
  SMSMessageFilterForWorkerQ,
  SMSMessageFilterQ,
} from '../dtos/sms-message-input.dto';
import {
  SMSMessageDetailDTO,
  SMSMessageMiniDTO,
  SMSMessageToClientDTO,
} from '../dtos/sms-message-output.dto';
import { SMSMessage } from '../entities/sms-message.entity';

import { SMSEventsGateway } from '../gateways/sms-events.gateway';
import { SMSClientRepository } from '../repositories/sms-client.repository';
import { SMSContactRepository } from '../repositories/sms-contact.repository';
import { SMSMessageRepository } from '../repositories/sms-message.repository';
import { SMSClientService } from './sms-client.service';
import { SMSContactService } from './sms-contact.service';

@Injectable()
export class SMSMessageService {
  constructor(
    private readonly gw: SMSEventsGateway,
    private readonly enc: EncryptService,
    private readonly contact: SMSContactService,
    private readonly client: SMSClientService,
    private readonly userRepo: UserRepository,
    private readonly messageRepo: SMSMessageRepository,
    private readonly clientRepo: SMSClientRepository,
    private readonly contactRepo: SMSContactRepository,
  ) {}

  public async sendMessage(
    ctx: RequestContext,
    input: SMSMessageCreateInputDTO,
  ): Promise<SMSMessageDetailDTO> {
    const contact = await this.contact.getOrCreateContact(input.to);
    const availableIds = this.gw.getAvailableCLients();
    if (!availableIds.includes(input.clientId)) {
      throw new BadRequestException('Client tidak tersedia');
    }
    const client = await this.client.getClient(input.clientId);
    const createdBy = await this.userRepo.getById(ctx.user.id);
    const sms = await this.messageRepo.save({
      client,
      contact,
      message: input.message,
      createdBy,
    });
    const toSend: SMSMessageToClientDTO = {
      id: sms.id,
      message: sms.message,
      msisdn: client.msisdn,
      to: contact.msisdn,
    };
    const enc = await this.enc.encryptString(JSON.stringify(toSend));
    this.gw.broadcastMessage(enc);
    return plainToInstance(SMSMessageDetailDTO, sms);
  }

  public async retryMessage(
    id: number,
    sms?: SMSMessage,
  ): Promise<SMSMessageDetailDTO> {
    let message: SMSMessage;
    if (sms) {
      message = sms;
    } else {
      message = await this.messageRepo.findOne({
        where: {
          id,
          status: SMS_DELIVERY_STATUS.ONQUEUE,
        },
        relations: ['client', 'contact'],
      });
      if (!message) throw new NotFoundException('Pesan tidak ditemukan');
    }

    message.status = SMS_DELIVERY_STATUS.RETRYING;
    await this.messageRepo.save(message);
    const toSend: SMSMessageToClientDTO = {
      id: message.id,
      message: message.message,
      msisdn: message.client.msisdn,
      to: message.contact.msisdn,
    };
    const enc = await this.enc.encryptString(JSON.stringify(toSend));
    this.gw.broadcastMessage(enc);
    return plainToInstance(SMSMessageDetailDTO, message);
  }

  public async updateMessageStatus(id: number, status: SMS_DELIVERY_STATUS) {
    await this.messageRepo.update(id, {
      status,
    });
  }

  public async getMessagesWithPagination(
    paginationQ: PaginationParamsDto,
    filterQ: SMSMessageFilterQ,
  ): Promise<BaseApiResponse<SMSMessageMiniDTO[]>> {
    const options: FindManyOptions<SMSMessage> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
      relations: ['client', 'contact', 'createdBy'],
      select: {
        id: true,
        client: {
          id: true,
          msisdn: true,
          name: true,
        },
        contact: { id: true, msisdn: true },
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          id: true,
          name: true,
          identificationNo: true,
        },
      },
    };
    const where: FindOptionsWhere<SMSMessage> = {};
    if (filterQ.clientId) where.clientId = filterQ.clientId;
    if (filterQ.contactId) where.contactId = filterQ.contactId;
    if (filterQ.createdById) where.createdById = filterQ.createdById;
    if (filterQ.status) where.status = filterQ.status;
    options.where = where;
    const [res, count] = await this.messageRepo.findAndCount(options);
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(SMSMessageMiniDTO, res);
    return { data, meta };
  }

  public async getMessagesForWorker(
    ctx: RequestContext,
    paginationQ: PaginationParamsDto,
    filterQ: SMSMessageFilterForWorkerQ,
  ): Promise<BaseApiResponse<SMSMessageMiniDTO[]>> {
    const filter: SMSMessageFilterQ = {
      clientId: ctx.user.id,
      contactId: null,
      createdById: null,
      status: filterQ.status,
    };
    return await this.getMessagesWithPagination(paginationQ, filter);
  }
}
