import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { CreateWhatsappMessageInput } from '../dtos/whatsapp-message-input.dto';
import { WhatsappMessageOutputDTO } from '../dtos/whatsapp-message-output.dto';
import { WhatsappClientRepository } from '../repositories/whatsapp-client.repository';
import { WhatsappCacheService } from './whatsapp-cache.service';
import { WhatsappCLientService } from './whatsapp-client.service';
import { WhatsappMessageService } from './whatsapp-message.service';

@Injectable()
export class WhatsappPublicService {
  constructor(
    private readonly waClientService: WhatsappCLientService,
    private readonly waMessageService: WhatsappMessageService,
    private readonly waCache: WhatsappCacheService,
  ) {}
  public async sendTextMessage(
    ctx: RequestContext,
    body: CreateWhatsappMessageInput,
  ): Promise<WhatsappMessageOutputDTO> {
    body.clientId = await this.checkContext(ctx, body.clientId);

    try {
      return await this.waMessageService.addTextMessage(body, ctx.user.id);
    } catch (err) {
      console.log('send text message public failed : ', err);
    }
  }

  // ? -------------------privates
  private async checkContext(
    ctx: RequestContext,
    clientId?: number,
  ): Promise<number> {
    // console.log('ctx content : ', ctx);
    if (ctx.user.other.length === 0 && !ctx.user.isSuperAdmin) {
      throw new BadRequestException(
        'Anda tidak memiliki permission untuk client',
      );
    }
    if (!clientId) {
      console.log('tidak ada client id');
      if (ctx.user.isSuperAdmin) {
        const cs = await this.waCache.getClients();
        console.log('client di cache : ', cs);
        const csss = cs[Math.floor(Math.random() * cs.length)];
        console.log('client random : ', csss);
        return csss;
      } else {
        return (ctx.user.other as number[])[
          Math.floor(Math.random() * ctx.user.other.length)
        ];
      }
    } else {
      if (!(ctx.user.other as number[]).includes(clientId)) {
        throw new BadRequestException(
          'Anda tidak memiliki permission untuk client',
        );
      } else {
        return clientId;
      }
    }
  }
}
