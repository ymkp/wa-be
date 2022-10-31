import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappMessage } from '../entities/whatsapp-message.entity';

@CustomRepository(WhatsappMessage)
export class WhatsappMessageRepository extends Repository<WhatsappMessage> {
  async getById(id: number): Promise<WhatsappMessage> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
