import { Injectable } from '@nestjs/common';
import { CreateWhatsappMessageInput } from '../dtos/whatsapp-message-input.dto';
import { WhatsappMessageRepository } from '../repositories/whatsapp-message.entity';
import { WhatsappContactService } from './whtasapp-contact.service';

@Injectable()
export class WhatsappMessageService {
  constructor(
    private readonly messageRepo: WhatsappMessageRepository,
    private readonly contactService: WhatsappContactService,
  ) {}

  public async sendMessage(input: CreateWhatsappMessageInput) {
    // ? 1. get it on the queue
    const contact = await this.contactService.getOrCreateContact(
      input.contactMsisdn,
    );
    const m = await this.messageRepo.save({
      clientId: input.clientId,
      contact,
    });
  }
}
