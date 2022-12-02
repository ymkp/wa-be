import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicTokenGuard } from 'src/auth/guards/public-token.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  SMSMessageCreateInputDTO,
  SMSMessageFilterQ,
} from '../dtos/sms-message-input.dto';
import {
  SMSMessageDetailDTO,
  SMSMessageMiniDTO,
} from '../dtos/sms-message-output.dto';

import { SMSPublicService } from '../services/sms-public.service';

@ApiTags('sms-public, dipakai oleh orang luar')
@Controller('sms-public')
@UseGuards(PublicTokenGuard)
@ApiBearerAuth()
export class SMSPublicController {
  constructor(private readonly smsPublicService: SMSPublicService) {}

  @Post('/send/text')
  @ApiOperation({
    summary: 'send a message with public token',
  })
  public async sendMessage(
    @ReqContext() ctx: RequestContext,
    @Body() body: SMSMessageCreateInputDTO,
  ): Promise<SMSMessageDetailDTO> {
    return await this.smsPublicService.sendSMS(ctx, body);
  }

  @Get('/get/messages')
  @ApiOperation({
    summary: 'get list of WA messages registered on the system',
  })
  async getMessages(
    @ReqContext() ctx: RequestContext,
    @Query() paginationQ: PaginationParamsDto,
    @Query() filterQ: SMSMessageFilterQ,
  ): Promise<BaseApiResponse<SMSMessageMiniDTO[]>> {
    return await this.smsPublicService.getSMSs(ctx, paginationQ, filterQ);
  }
}
