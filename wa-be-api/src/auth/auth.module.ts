import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';

import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { STRATEGY_JWT_AUTH } from './constants/strategy.constant';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JWTSMSAuthStrategy } from './strategies/jwt-sms-auth.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PublicClientTokenStrategy } from './strategies/public-token.strategy';

@Module({
  imports: [
    SharedModule,
    PassportModule.register({ defaultStrategy: STRATEGY_JWT_AUTH }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtAuthStrategy,
    JwtRefreshStrategy,
    JWTSMSAuthStrategy,
    PublicClientTokenStrategy,
    JwtSigningService,
  ],
})
export class AuthModule {}
