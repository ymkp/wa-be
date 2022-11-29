import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtSMSAuthGuard } from 'src/auth/guards/sms-client.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';

import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { SMSClientOutputDTO } from '../dtos/sms-client-output.dto';
import { SMSMessageFilterForWorkerQ } from '../dtos/sms-message-input.dto';
import { SMSMessageMiniDTO } from '../dtos/sms-message-output.dto';
import { SMSClientService } from '../services/sms-client.service';
import { SMSMessageService } from '../services/sms-message.service';

@ApiTags('sms-worker')
@Controller('sms-worker')
@UseGuards(JwtSMSAuthGuard)
@ApiBearerAuth()
export class SMSWorkerController {
  constructor(
    private readonly clientService: SMSClientService,
    private readonly messageService: SMSMessageService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'get sms client id based on bearer api?',
  })
  public async getMe(
    @ReqContext() ctx: RequestContext,
  ): Promise<SMSClientOutputDTO> {
    return await this.clientService.getMe(ctx);
  }

  @Get('sms')
  @ApiOperation({
    summary: 'get sms sent from this user?',
  })
  public async getSMS(
    @ReqContext() ctx: RequestContext,
    @Query() pageQ: PaginationParamsDto,
    @Query() filterQ: SMSMessageFilterForWorkerQ,
  ): Promise<BaseApiResponse<SMSMessageMiniDTO[]>> {
    return await this.messageService.getMessagesForWorker(ctx, pageQ, filterQ);
  }
}
