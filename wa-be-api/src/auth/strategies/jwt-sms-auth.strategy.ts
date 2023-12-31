import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { STRATEGY_JWT_SMS_AUTH } from '../constants/strategy.constant';
import { UserAccessTokenClaims } from '../dtos/auth-token-output.dto';

@Injectable()
export class JWTSMSAuthStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_JWT_SMS_AUTH,
) {
  constructor(private readonly configService: ConfigService) {
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
    if (payload.type || payload.other || payload.sub > 0)
      throw new BadRequestException('Token tidak valid');
    return {
      id: payload.clientId,
    };
  }
}
