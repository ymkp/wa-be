import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { FindManyOptions, FindOptionsWhere, Like } from 'typeorm';
import { WHATSAPP_CONVERSATION_TYPE } from '../constants/whatsapp-conversation-type.constant';
import {
  WhatsappConversationMessageOutputDTO,
  WhatsappConversationOutputDTO,
} from '../dtos/whatsapp-conversation-output.dto';
import { WhatsappConversationFilterInput } from '../dtos/whatsapp-conversation.input.dto';
import { HookReceivedMessageDTO } from '../dtos/whatsapp-hook-input.dto';
import { WhatsappClient } from '../entities/whatsapp-client.entity';
import { WhatsappContact } from '../entities/whatsapp-contact.entity';
import { WhatsappConversationMessage } from '../entities/whatsapp-conversation-message.entity';
import { WhatsappConversation } from '../entities/whatsapp-conversation.entity';
import { WhatsappContactRepository } from '../repositories/whatsapp-contact.repository';
import { WhatsappConversationMessageContentRepository } from '../repositories/whatsapp-conversation-message-content.repository';
import { WhatsappConversationMessageRepository } from '../repositories/whatsapp-conversation-message.repository';
import { WhatsappConversationRepository } from '../repositories/whatsapp-conversation.repository';
import { WhatsappCLientService } from './whatsapp-client.service';
import { WhatsappContactService } from './whtasapp-contact.service';

@Injectable()
export class WhatsappConversationService {
  constructor(
    private readonly contactService: WhatsappContactService,
    private readonly clientService: WhatsappCLientService,
    private readonly conversationRepo: WhatsappConversationRepository,
    private readonly convoMessageRepo: WhatsappConversationMessageRepository,
    private readonly convoMessageContentRepo: WhatsappConversationMessageContentRepository,
  ) {}

  public async getConversationList(
    paginationQ: PaginationParamsDto,
    filterQ: WhatsappConversationFilterInput,
  ): Promise<BaseApiResponse<WhatsappConversationOutputDTO[]>> {
    const options: FindManyOptions<WhatsappConversation> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { updatedAt: 'DESC' },
      select: {
        id: true,
        updatedAt: true,
        client: {
          id: true,
          msisdn: true,
        },
        contact: {
          id: true,
          msisdn: true,
        },
      },
      relations: ['client', 'contact'],
    };
    const where: FindOptionsWhere<WhatsappConversation> = {};
    const whereClient: FindOptionsWhere<WhatsappClient> = {};
    const whereContact: FindOptionsWhere<WhatsappContact> = {};
    if (filterQ.clientMsisdn) {
      whereClient.msisdn = Like(`%${filterQ.clientMsisdn}%`);
      where.client = whereClient;
    }
    if (filterQ.contactMsisdn) {
      whereContact.msisdn = Like(`%${filterQ.contactMsisdn}%`);
      where.contact = whereContact;
    }
    options.where = where;
    const [res, count] = await this.conversationRepo.findAndCount(options);
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(WhatsappConversationOutputDTO, res);
    return { data, meta };
  }

  public async getCOnversationInfoById(
    id: number,
  ): Promise<WhatsappConversationOutputDTO> {
    return await this.conversationRepo.findOneOrFail({
      where: { id },
      select: {
        id: true,
        updatedAt: true,
        client: {
          id: true,
          msisdn: true,
        },
        contact: {
          id: true,
          msisdn: true,
        },
      },
      relations: ['client', 'contact'],
    });
  }

  public async getConversationMessagesByConversationId(
    conversationId: number,
    paginationQ: PaginationParamsDto,
  ): Promise<BaseApiResponse<WhatsappConversationMessageOutputDTO[]>> {
    const [res, count] = await this.convoMessageRepo.findAndCount({
      where: { conversationId },
      select: {
        id: true,
        waId: true,
        type: true,
        mediaType: true,
        createdAt: true,
        contact: { id: true, msisdn: true },
        content: { id: true, text: true, fileName: true, fileDir: true },
      },
      relations: ['contact'],
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
    });
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(WhatsappConversationMessageOutputDTO, res);
    return { data, meta };
  }

  public async createConversationMessage(
    input: HookReceivedMessageDTO,
  ): Promise<WhatsappConversationMessage> {
    if (input.isFromGroup) {
      // ? get client
      const client = await this.clientService.getClientByPORT(
        parseInt(input.port, 10),
      );

      // ? get or create contact
      const contact = await this.contactService.getOrCreateContact(
        input.contact,
      );

      // ? get convo
      const conversation = await this.createOrGetConversation(
        client.id,
        contact.id,
      );
      // ? add message
      const content = await this.convoMessageContentRepo.save({
        text: input.message,
      });
      const msgType: WHATSAPP_CONVERSATION_TYPE = input.isFromMe
        ? WHATSAPP_CONVERSATION_TYPE.SENT
        : WHATSAPP_CONVERSATION_TYPE.RECEIVED;
      const message = await this.convoMessageRepo.save({
        contact,
        content,
        conversation,
        waId: input.id,
        type: msgType,
      });
      await this.conversationRepo.update(conversation, {
        updatedAt: new Date(Date.now()),
      });
      return message;
    }
    // TODO : group implementation
  }

  // ? ------------------- PRIVATES
  private async createOrGetConversation(clientId: number, contactId: number) {
    let convo = await this.conversationRepo.findOne({
      where: { clientId, contactId },
    });
    if (!convo) {
      convo = await this.conversationRepo.save({
        clientId,
        contactId,
      });
    }
    return convo;
  }
}
