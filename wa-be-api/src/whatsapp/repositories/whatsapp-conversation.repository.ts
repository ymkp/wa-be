import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappConversation } from '../entities/whatsapp-conversation.entity';

@CustomRepository(WhatsappConversation)
export class WhatsappConversationRepository extends Repository<WhatsappConversation> {
  async getById(id: number): Promise<WhatsappConversation> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
