import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WATokenGuard } from 'src/auth/guards/wa-token.guard';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { CreateWhatsappMessageInput } from '../dtos/whatsapp-message-input.dto';
import { WhatsappMessageOutputDTO } from '../dtos/whatsapp-message-output.dto';
import { WhatsappPublicService } from '../services/whatsapp-public.service';

@ApiTags('whatsapp-public')
@Controller('whatsapp-public')
@UseGuards(WATokenGuard)
@ApiBearerAuth()
export class WhatsappPublicController {
  constructor(private readonly waPublicService: WhatsappPublicService) {}

  @Post('/send/text')
  @ApiOperation({
    summary: 'send a message with public token',
  })
  public async sendMessage(
    @ReqContext() ctx: RequestContext,
    @Body() body: CreateWhatsappMessageInput,
  ): Promise<WhatsappMessageOutputDTO> {
    return await this.waPublicService.sendTextMessage(ctx, body);
  }
}
