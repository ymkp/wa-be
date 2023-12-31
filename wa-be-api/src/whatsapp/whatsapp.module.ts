import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from 'src/shared/shared.module';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';
import { TypeOrmExModule } from 'src/shared/typeorm-ex.module';
import { UserRepository } from 'src/user/repositories/user.repository';
import { WhatsappClientController } from './controllers/whatsapp-client.controller';
import { WhatsappContactController } from './controllers/whatsapp-contact.controller';
import { WhatsappCOnversationController } from './controllers/whatsapp-conversation.controller';
import { WhatsappHookController } from './controllers/whatsapp-hook.controller';
import { WhatsappMessageController } from './controllers/whatsapp-message.controller';
import { WhatsappPublicUsageController } from './controllers/whatsapp-public-usage.controller';
import { WhatsappPublicController } from './controllers/whatsapp-public.controller';
import { WhatsappTestController } from './controllers/whatsapp-test.controller';
import { WhatsappClientRepository } from './repositories/whatsapp-client.repository';
import { WhatsappContactRepository } from './repositories/whatsapp-contact.repository';
import { WhatsappConversationMessageContentRepository } from './repositories/whatsapp-conversation-message-content.repository';
import { WhatsappConversationMessageRepository } from './repositories/whatsapp-conversation-message.repository';
import { WhatsappConversationRepository } from './repositories/whatsapp-conversation.repository';
import { WhatsappMessageContentRepository } from './repositories/whatsapp-message-content.repository';
import { WhatsappMessageRepository } from './repositories/whatsapp-message.entity';
import { WhatsappPublicTokenRepository } from './repositories/whatsapp-public-token.repository';
import { WhatsappPublicUsageRepository } from './repositories/whatsapp-public-usage.repository';
import { WhatsappCacheService } from './services/whatsapp-cache.service';
import { WhatsappCLientService } from './services/whatsapp-client.service';
import { WhatsappConversationService } from './services/whatsapp-conversation.service';
import { WhatsappHookService } from './services/whatsapp-hook.service';
import { WhatsappMessageService } from './services/whatsapp-message.service';
import { WhatsappPublicUsageService } from './services/whatsapp-public-usage.service';
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
      WhatsappConversationRepository,
      WhatsappConversationMessageRepository,
      WhatsappConversationMessageContentRepository,
      UserRepository,
      WhatsappPublicTokenRepository,
      WhatsappPublicUsageRepository,
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
    JwtSigningService,
    WhatsappHookService,
    WhatsappConversationService,
    WhatsappPublicUsageService,
  ],
  controllers: [
    WhatsappClientController,
    WhatsappContactController,
    WhatsappMessageController,
    WhatsappPublicController,
    WhatsappTestController,
    WhatsappHookController,
    WhatsappCOnversationController,
    WhatsappPublicUsageController,
  ],
})
export class WhatsappModule {}
