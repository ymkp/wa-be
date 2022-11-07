import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappConversationMessageContent } from '../entities/whatsapp-conversation-message-content.entity';

@CustomRepository(WhatsappConversationMessageContent)
export class WhatsappConversationMessageContentRepository extends Repository<WhatsappConversationMessageContent> {
  async getById(id: number): Promise<WhatsappConversationMessageContent> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
