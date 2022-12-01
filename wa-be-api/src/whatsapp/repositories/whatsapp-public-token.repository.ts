import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappPublicToken } from '../entities/whatsapp-public-token.entity';

@CustomRepository(WhatsappPublicToken)
export class WhatsappPublicTokenRepository extends Repository<WhatsappPublicToken> {
  async getById(id: number): Promise<WhatsappPublicToken> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
