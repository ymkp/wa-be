import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { WhatsappPublicUsage } from '../entities/whatsapp-public-usage.entity';

@CustomRepository(WhatsappPublicUsage)
export class WhatsappPublicUsageRepository extends Repository<WhatsappPublicUsage> {
  async getById(id: number): Promise<WhatsappPublicUsage> {
    const data = await this.findOne({ where: { id } });
    if (!data) throw new NotFoundException();
    return data;
  }
}
