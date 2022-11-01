import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from 'src/shared/shared.module';
import { TypeOrmExModule } from 'src/shared/typeorm-ex.module';
import { WhatsappClientController } from './controllers/whatsapp-client.controller';
import { WhatsappContactController } from './controllers/whatsapp-contact.controller';
import { WhatsappMessageController } from './controllers/whatsapp-message.controller';
import { WhatsappPublicController } from './controllers/whatsapp-public.controller';
import { WhatsappClientRepository } from './repositories/whatsapp-client.repository';
import { WhatsappContactRepository } from './repositories/whatsapp-contact.repository';
import { WhatsappMessageContentRepository } from './repositories/whatsapp-message-content.repository';
import { WhatsappMessageRepository } from './repositories/whatsapp-message.entity';
import { WhatsappCacheService } from './services/whatsapp-cache.service';
import { WhatsappCLientService } from './services/whatsapp-client.service';
import { WhatsappMessageService } from './services/whatsapp-message.service';
import { WhatsappPublicService } from './services/whatsapp-public.service';
import { WHatsappSchedulerService } from './services/whatsapp-scheduler.service';
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
    ]),
  ],
  providers: [
    JwtService,
    WhatsappCLientService,
    WhatsappContactService,
    WhatsappMessageService,
    WhatsappPublicService,
    WhatsappCacheService,
    WHatsappSchedulerService,
  ],
  controllers: [
    WhatsappClientController,
    WhatsappContactController,
    WhatsappMessageController,
    WhatsappPublicController,
  ],
})
export class WhatsappModule {}
