import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhatsappConversationService } from '../services/whatsapp-conversation.service';

@ApiTags('whatsapp-conversation')
@Controller('whatsapp-conversation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsappContactController {
  constructor(private readonly service: WhatsappConversationService) {}

  createMessage() {}

  getConversationList() {}

  getConversationMessages() {}
}
