import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { SMSPublicUsage } from '../entities/sms-public-usage.entity';

@CustomRepository(SMSPublicUsage)
export class SMSPublicUsageRepository extends Repository<SMSPublicUsage> {
  async getById(id: number): Promise<SMSPublicUsage> {
    const d = await this.findOne({ where: { id } });
    if (!d) {
      throw new NotFoundException();
    }
    return d;
  }
}
