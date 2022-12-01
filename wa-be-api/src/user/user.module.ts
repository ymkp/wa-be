import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { TypeOrmExModule } from 'src/shared/typeorm-ex.module';
import { SSOTokenRepository } from './repositories/sso-token.repository';
import { SSOService } from './services/sso.service';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';
import { WhatsappClientRepository } from 'src/whatsapp/repositories/whatsapp-client.repository';
import { WhatsappPublicTokenRepository } from 'src/whatsapp/repositories/whatsapp-public-token.repository';

@Module({
  imports: [
    SharedModule,
    TypeOrmExModule.forCustomRepository([
      UserRepository,
      SSOTokenRepository,
      WhatsappClientRepository,
      WhatsappPublicTokenRepository,
    ]),
  ],
  providers: [UserService, JwtAuthStrategy, SSOService, JwtSigningService],
  controllers: [UserController],
  exports: [UserService, SSOService],
})
export class UserModule {}
