import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { SMSContact } from '../entities/sms-contact.entity';

@CustomRepository(SMSContact)
export class SMSContactRepository extends Repository<SMSContact> {
  async getById(id: number): Promise<SMSContact> {
    const d = await this.findOne({ where: { id } });
    if (!d) {
      throw new NotFoundException();
    }
    return d;
  }
}
