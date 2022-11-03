import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/guards/superadmin.guard';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { WhatsappTestMessageTextInput } from '../dtos/whatsapp-message-input.dto';
import { WhatsappTestService } from '../services/whatsapp-test.service';

@ApiTags('whatsapp-test')
@Controller('whatsapp-test')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class WhatsappTestController {
  constructor(private readonly test: WhatsappTestService) {}

  @Post('/send/text')
  @ApiOperation({
    summary: 'send a message with public token',
  })
  public sendMessage(
    @ReqContext() ctx: RequestContext,
    @Body() body: WhatsappTestMessageTextInput,
  ) {
    this.test.sendTextMessage(ctx, body);
  }
}
