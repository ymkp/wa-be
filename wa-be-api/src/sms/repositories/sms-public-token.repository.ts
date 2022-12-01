import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { SMSPublicToken } from '../entities/sms-public-token.entity';

@CustomRepository(SMSPublicToken)
export class SMSPublicTokenRepository extends Repository<SMSPublicToken> {
  async getById(id: number): Promise<SMSPublicToken> {
    const d = await this.findOne({ where: { id } });
    if (!d) {
      throw new NotFoundException();
    }
    return d;
  }
}
