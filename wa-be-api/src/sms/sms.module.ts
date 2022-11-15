import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SharedModule } from 'src/shared/shared.module';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';
import { TypeOrmExModule } from 'src/shared/typeorm-ex.module';
import { SMSAuthController } from './controllers/sms-auth.controller';
import { SMSClientController } from './controllers/sms-client.controller';
import { SMSEventsGateway } from './gateways/sms-events.gateway';
import { SMSClientRepository } from './repositories/sms-client.repository';
import { SMSAuthService } from './services/sms-auth.service';
import { SMSClientService } from './services/sms-client.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmExModule.forCustomRepository([SMSClientRepository]),
  ],
  providers: [
    SMSEventsGateway,
    SMSAuthService,
    SMSClientService,
    JwtSigningService,
    ConfigService,
  ],
  controllers: [SMSAuthController, SMSClientController],
})
export class SmsModule {}
