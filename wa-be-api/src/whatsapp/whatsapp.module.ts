import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from 'src/shared/shared.module';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';
import { TypeOrmExModule } from 'src/shared/typeorm-ex.module';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UserService } from 'src/user/services/user.service';
import { WhatsappClientController } from './controllers/whatsapp-client.controller';
import { WhatsappContactController } from './controllers/whatsapp-contact.controller';
import { WhatsappMessageController } from './controllers/whatsapp-message.controller';
import { WhatsappPublicController } from './controllers/whatsapp-public.controller';
import { WhatsappTestController } from './controllers/whatsapp-test.controller';
import { WhatsappClientRepository } from './repositories/whatsapp-client.repository';
import { WhatsappContactRepository } from './repositories/whatsapp-contact.repository';
import { WhatsappMessageContentRepository } from './repositories/whatsapp-message-content.repository';
import { WhatsappMessageRepository } from './repositories/whatsapp-message.entity';
import { WhatsappCacheService } from './services/whatsapp-cache.service';
import { WhatsappCLientService } from './services/whatsapp-client.service';
import { WhatsappMessageService } from './services/whatsapp-message.service';
import { WhatsappPublicService } from './services/whatsapp-public.service';
import { WHatsappSchedulerService } from './services/whatsapp-scheduler.service';
import { WhatsappTestService } from './services/whatsapp-test.service';
import { WhatsappWorkerService } from './services/whatsapp-worker.service';
import { WhatsappContactService } from './services/whtasapp-contact.service';

@Module({
  imports: [
    HttpModule,
    SharedModule,
    ScheduleModule.forRoot(),
    TypeOrmExModule.forCustomRepository([
      WhatsappClientRepository,
      WhatsappMessageRepository,
      WhatsappMessageContentRepository,
      WhatsappContactRepository,
      UserRepository,
    ]),
  ],
  providers: [
    WhatsappCLientService,
    WhatsappContactService,
    WhatsappMessageService,
    WhatsappPublicService,
    WhatsappCacheService,
    WHatsappSchedulerService,
    WhatsappWorkerService,
    WhatsappTestService,
    UserService,
    JwtSigningService,
  ],
  controllers: [
    WhatsappClientController,
    WhatsappContactController,
    WhatsappMessageController,
    WhatsappPublicController,
    WhatsappTestController,
  ],
})
export class WhatsappModule {}
