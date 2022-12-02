import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SharedModule } from 'src/shared/shared.module';
import { EncryptService } from 'src/shared/signing/encrypt.service';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';
import { TypeOrmExModule } from 'src/shared/typeorm-ex.module';
import { UserRepository } from 'src/user/repositories/user.repository';
import { SMSAuthController } from './controllers/sms-auth.controller';
import { SMSClientController } from './controllers/sms-client.controller';
import { SMSMessageController } from './controllers/sms-message.controller';
import { SMSPublicController } from './controllers/sms-public.controller';
import { SMSWorkerController } from './controllers/sms-worker.controller';
import { SMSEventsGateway } from './gateways/sms-events.gateway';
import { SMSClientRepository } from './repositories/sms-client.repository';
import { SMSContactRepository } from './repositories/sms-contact.repository';
import { SMSMessageRepository } from './repositories/sms-message.repository';
import { SMSPublicTokenRepository } from './repositories/sms-public-token.repository';
import { SMSPublicUsageRepository } from './repositories/sms-public-usage.repository';
import { SMSAuthService } from './services/sms-auth.service';
import { SMSClientService } from './services/sms-client.service';
import { SMSContactService } from './services/sms-contact.service';
import { SMSMessageService } from './services/sms-message.service';
import { SMSPublicService } from './services/sms-public.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmExModule.forCustomRepository([
      SMSClientRepository,
      SMSContactRepository,
      SMSMessageRepository,
      SMSPublicTokenRepository,
      SMSPublicUsageRepository,
      UserRepository,
    ]),
  ],
  providers: [
    SMSEventsGateway,
    SMSAuthService,
    SMSClientService,
    JwtSigningService,
    ConfigService,
    EncryptService,
    SMSMessageService,
    SMSContactService,
    SMSPublicService,
  ],
  controllers: [
    SMSAuthController,
    SMSClientController,
    SMSMessageController,
    SMSWorkerController,
    SMSPublicController,
  ],
})
export class SmsModule {}
