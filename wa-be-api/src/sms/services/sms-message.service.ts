import { Injectable } from '@nestjs/common';
import { EncryptService } from 'src/shared/signing/encrypt.service';
import { SMSClientSendMessageDTO } from '../dtos/sms-client-output.dto';
import { SMSEventsGateway } from '../gateways/sms-events.gateway';

@Injectable()
export class SMSMessageService {
  constructor(
    private readonly gw: SMSEventsGateway,
    private readonly enc: EncryptService,
  ) {}

  public async sendMessage(input: SMSClientSendMessageDTO) {
    const enc = await this.enc.encryptString(JSON.stringify(input));
    this.gw.broadcastMessage(enc);
  }
}
