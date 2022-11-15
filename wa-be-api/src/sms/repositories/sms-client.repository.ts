import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { SMSClient } from '../entities/sms-client.entity';

@CustomRepository(SMSClient)
export class SMSClientRepository extends Repository<SMSClient> {
  async getById(id: number): Promise<SMSClient> {
    const d = await this.findOne({ where: { id } });
    if (!d) {
      throw new NotFoundException();
    }
    return d;
  }
}
