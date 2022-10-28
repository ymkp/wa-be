import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CustomRepository } from 'src/shared/decorators/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { SSOToken } from '../entities/sso-token.entity';
import { hash, compare } from 'bcrypt';

@CustomRepository(SSOToken)
export class SSOTokenRepository extends Repository<SSOToken> {
  public async saveSSOToken(
    ssoToken: string,
    userId: number,
    expiresIn: Date,
  ): Promise<void> {
    await this.save({
      expiresIn,
      userId,
      ssoToken,
    });
  }
  public async useSSOToken(userId: number, token: string): Promise<SSOToken> {
    const ssoToken = await hash(token, 10);
    const sso = await this.findOne({
      where: {
        userId,
      },
    });
    const match = await compare(token, sso.ssoToken);
    if (!sso) throw new NotFoundException('SSO tidak cocok');
    if (!match) throw new UnauthorizedException();
    sso.hasBeenUsed = true;
    await this.save(sso);
    return sso;
  }
}
