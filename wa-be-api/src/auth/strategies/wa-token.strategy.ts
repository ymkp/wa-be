import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { WhatsappPublicTokenRepository } from 'src/whatsapp/repositories/whatsapp-public-token.repository';
import { WhatsappPublicUsageRepository } from 'src/whatsapp/repositories/whatsapp-public-usage.repository';

import { createRequestContext } from '../../shared/request-context/util';
import {
  STRATEGY_LOCAL,
  STRATEGY_WA_TOKEN,
} from '../constants/strategy.constant';
import { UserAccessTokenClaims } from '../dtos/auth-token-output.dto';
import { AuthService } from '../services/auth.service';

@Injectable()
export class WAClientTokenStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_WA_TOKEN,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly waTokenRepo: WhatsappPublicTokenRepository,
    private readonly waUsageRepo: WhatsappPublicUsageRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.publicKey'),
      algorithms: ['RS256'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async validate(payload: any): Promise<UserAccessTokenClaims> {
    // Passport automatically creates a user object, based on the value we return from the validate() method,
    // and assigns it to the Request object as req.user
    if (payload.other && payload.type) {
      const token = await this.waTokenRepo.findOne({
        where: { secret: payload.other },
      });
      if (!token) throw new BadRequestException('Token sudah tidak aktif');
      return {
        id: payload.sub,
        username: payload.username,
        other: payload.other,
        type: payload.type,
        isSuperAdmin: payload.isSuperAdmin,
      };
    } else {
      throw new BadRequestException('Token tidak valid');
    }
  }
}
