import { Injectable } from '@nestjs/common';
import {
  HookReceivedMessageDTO,
  HookWorkerInitDTO,
} from '../dtos/whatsapp-hook-input.dto';
import { WhatsappCLientService } from './whatsapp-client.service';
import { WhatsappConversationService } from './whatsapp-conversation.service';

@Injectable()
export class WhatsappHookService {
  constructor(
    private readonly clientService: WhatsappCLientService,
    private readonly conversationService: WhatsappConversationService,
  ) {}

  public async workerInit(body: HookWorkerInitDTO): Promise<void> {
    await this.clientService.workerInitFromHook(parseInt(body.port, 10));
  }
  public async receiveMessage(body: HookReceivedMessageDTO): Promise<void> {
    // console.log('receive a message : ', body);
    const msg = await this.conversationService.createConversationMessage(body);
  }
}
