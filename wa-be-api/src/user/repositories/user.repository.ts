import { NotFoundException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@CustomRepository(User)
export class UserRepository extends Repository<User> {
  async getById(id: number): Promise<User> {
    const user = await this.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
