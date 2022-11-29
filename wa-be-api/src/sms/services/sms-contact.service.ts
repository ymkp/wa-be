import { Injectable } from '@nestjs/common';
import { SMSContact } from '../entities/sms-contact.entity';
import { SMSContactRepository } from '../repositories/sms-contact.repository';

@Injectable()
export class SMSContactService {
  constructor(private readonly contactRepo: SMSContactRepository) {}

  public async getOrCreateContact(msisdn: string): Promise<SMSContact> {
    let contact = await this.contactRepo.findOne({ where: { msisdn } });
    if (!contact) {
      contact = await this.contactRepo.save({
        msisdn,
      });
    }
    return contact;
  }
}
