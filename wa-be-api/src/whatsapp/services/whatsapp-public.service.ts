import { Injectable } from '@nestjs/common';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { CreateWhatsappMessageInput } from '../dtos/whatsapp-message-input.dto';
import { WhatsappClientRepository } from '../repositories/whatsapp-client.repository';
import { WhatsappCLientService } from './whatsapp-client.service';
import { WhatsappMessageService } from './whatsapp-message.service';

@Injectable()
export class WhatsappPublicService {
  constructor(
    private readonly waClientService: WhatsappCLientService,
    private readonly waMessageService: WhatsappMessageService,
  ) {}
  public async sendMessage(
    ctx: RequestContext,
    body: CreateWhatsappMessageInput,
  ): Promise<void> {
    if (ctx.user.type === 'wa-client') {
      const c = await this.waClientService.getClientById(ctx.user.id);
    } else {
    }
  }
}
