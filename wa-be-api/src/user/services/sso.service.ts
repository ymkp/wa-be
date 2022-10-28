import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserOutput } from '../dtos/user-output.dto';
import { User } from '../entities/user.entity';
import { SSOTokenRepository } from '../repositories/sso-token.repository';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class SSOService {
  constructor(
    private readonly ssoRepo: SSOTokenRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async saveSSOToken(
    ssoToken: string,
    userId: number,
    expiresIn: number,
  ): Promise<void> {
    const date = new Date(Date.now());
    date.setSeconds(date.getSeconds() + expiresIn);
    await this.ssoRepo.saveSSOToken(ssoToken, userId, date);
  }

  async useSSOToken(userId: number, ssoToken: string): Promise<UserOutput> {
    const sso = await this.ssoRepo.useSSOToken(userId, ssoToken);
    const user = await this.userRepo.getById(sso.userId);
    return plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }
}
