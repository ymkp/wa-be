import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappClient } from '../entities/whatsapp-client.entity';

@CustomRepository(WhatsappClient)
export class WhatsappClientRepository extends Repository<WhatsappClient> {
  async getById(id: number): Promise<WhatsappClient> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
