import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappConversationMessage } from '../entities/whatsapp-conversation-message.entity';

@CustomRepository(WhatsappConversationMessage)
export class WhatsappConversationMessageRepository extends Repository<WhatsappConversationMessage> {
  async getById(id: number): Promise<WhatsappConversationMessage> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
