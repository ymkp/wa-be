import { Injectable } from '@nestjs/common';
import { WHATSAPP_CONVERSATION_TYPE } from '../constants/whatsapp-conversation-type.constant';
import { HookReceivedMessageDTO } from '../dtos/whatsapp-hook-input.dto';
import { WhatsappConversationMessage } from '../entities/whatsapp-conversation-message.entity';
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

  public async getConversationList() {}

  public async getConversationMessages() {}

  public async createConversationMessage(
    input: HookReceivedMessageDTO,
  ): Promise<WhatsappConversationMessage> {
    // ? get client
    const client = await this.clientService.getClientByPORT(
      parseInt(input.port, 10),
    );

    // ? get or create contact
    const contact = await this.contactService.getOrCreateContact(input.contact);

    // ? get convo
    const conversation = await this.createOrGetConversation(
      client.id,
      contact.id,
    );
    // ? add message
    const content = await this.convoMessageContentRepo.save({
      text: input.message,
    });
    const msgType: WHATSAPP_CONVERSATION_TYPE =
      input.type === 'me'
        ? WHATSAPP_CONVERSATION_TYPE.SENT
        : WHATSAPP_CONVERSATION_TYPE.RECEIVED;
    const message = await this.convoMessageRepo.save({
      contact,
      content,
      conversation,
      waId: input.id,
      type: msgType,
    });
    return message;
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
