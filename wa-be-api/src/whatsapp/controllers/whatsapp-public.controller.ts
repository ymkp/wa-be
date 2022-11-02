import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WATokenGuard } from 'src/auth/guards/wa-token.guard';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { CreateWhatsappMessageInput } from '../dtos/whatsapp-message-input.dto';
import { WhatsappPublicService } from '../services/whatsapp-public.service';

@ApiTags('whatsapp-public')
@Controller('whatsapp-public')
@UseGuards(WATokenGuard)
@ApiBearerAuth()
export class WhatsappPublicController {
  constructor(private readonly waPublicService: WhatsappPublicService) {}

  @Post('/send')
  @ApiOperation({
    summary: 'NOT-YET-IMPLEMENTED send a message with public header',
  })
  public async sendMessage(
    @ReqContext() ctx: RequestContext,
    @Body() body: CreateWhatsappMessageInput,
  ) {
    await this.waPublicService.sendMessage(ctx, body);
  }
}
