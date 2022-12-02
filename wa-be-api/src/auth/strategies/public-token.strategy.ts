import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { STRATEGY_PUBLIC_TOKEN } from '../constants/strategy.constant';
import { UserAccessTokenClaims } from '../dtos/auth-token-output.dto';

@Injectable()
export class PublicClientTokenStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_PUBLIC_TOKEN,
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
    if (payload.other && payload.type) {
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
