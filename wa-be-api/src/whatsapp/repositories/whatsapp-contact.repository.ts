import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappContact } from '../entities/whatsapp-contact.entity';

@CustomRepository(WhatsappContact)
export class WhatsappContactRepository extends Repository<WhatsappContact> {
  async getById(id: number): Promise<WhatsappContact> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
