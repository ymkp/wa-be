import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { SMSClientSendMessageDTO } from '../dtos/sms-client-output.dto';
import { SMSClient } from '../entities/sms-client.entity';
import { SMSClientService } from '../services/sms-client.service';
import { SMSMessageService } from '../services/sms-message.service';

@ApiTags('sms-message')
@Controller('sms-message')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SMSMessageController {
  constructor(private readonly service: SMSMessageService) {}

  @Post('send-sms')
  @ApiOperation({
    summary: 'send sms message',
  })
  public async sendMessage(
    @ReqContext() ctx: RequestContext,
    @Body() body: SMSClientSendMessageDTO,
  ): Promise<void> {
    await this.service.sendMessage(body);
  }
}
