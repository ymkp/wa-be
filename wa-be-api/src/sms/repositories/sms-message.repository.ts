import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { SMSMessage } from '../entities/sms-message.entity';

@CustomRepository(SMSMessage)
export class SMSMessageRepository extends Repository<SMSMessage> {
  async getById(id: number): Promise<SMSMessage> {
    const d = await this.findOne({ where: { id } });
    if (!d) {
      throw new NotFoundException();
    }
    return d;
  }
}
