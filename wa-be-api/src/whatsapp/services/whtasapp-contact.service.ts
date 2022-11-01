import { Injectable } from '@nestjs/common';
import { WhatsappContact } from '../entities/whatsapp-contact.entity';
import { WhatsappContactRepository } from '../repositories/whatsapp-contact.repository';

@Injectable()
export class WhatsappContactService {
  constructor(private readonly contactRepo: WhatsappContactRepository) {}

  public async getOrCreateContact(msisdn: string): Promise<WhatsappContact> {
    let contact = await this.contactRepo.findOne({ where: { msisdn } });
    if (!contact) {
      contact = await this.contactRepo.save({
        msisdn,
      });
    }
    return contact;
  }
}
