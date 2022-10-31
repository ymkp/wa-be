import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappMessageContent } from '../entities/whatsapp-message-content.entity';

@CustomRepository(WhatsappMessageContent)
export class WhatsappMessageContentRepository extends Repository<WhatsappMessageContent> {
  async getById(id: number): Promise<WhatsappMessageContent> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
