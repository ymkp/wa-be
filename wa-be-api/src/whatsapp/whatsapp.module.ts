import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { TypeOrmExModule } from 'src/shared/typeorm-ex.module';
import { WhatsappClientController } from './controllers/whatsapp-client.controller';
import { WhatsappContactController } from './controllers/whatsapp-contact.controller';
import { WhatsappMessageController } from './controllers/whatsapp-message.controller';
import { WhatsappClientRepository } from './repositories/whatsapp-client.repository';
import { WhatsappContactRepository } from './repositories/whatsapp-contact.entity';
import { WhatsappMessageContentRepository } from './repositories/whatsapp-message-content.repository';
import { WhatsappMessageRepository } from './repositories/whatsapp-message.entity';
import { WhatsappCLientService } from './services/whatsapp-client.service';
import { WhatsappMessageService } from './services/whatsapp-message.service';
import { WhatsappContactService } from './services/whtasapp-contact.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmExModule.forCustomRepository([
      WhatsappClientRepository,
      WhatsappMessageRepository,
      WhatsappMessageContentRepository,
      WhatsappContactRepository,
    ]),
  ],
  providers: [
    WhatsappCLientService,
    WhatsappContactService,
    WhatsappMessageService,
  ],
  controllers: [
    WhatsappClientController,
    WhatsappContactController,
    WhatsappMessageController,
  ],
})
export class WhatsappModule {}
