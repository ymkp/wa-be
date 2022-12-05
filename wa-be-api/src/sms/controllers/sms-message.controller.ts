import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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
    @Body() body: SMSMessageCreateInputDTO,
  ): Promise<SMSMessageDetailDTO> {
    return await this.service.sendMessage(ctx, body);
  }

  @Patch('retry-sms/:id')
  @ApiOperation({
    summary: 'send sms message',
  })
  public async retrySMS(
    @ReqContext() ctx: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SMSMessageDetailDTO> {
    return await this.service.retryMessage(id);
  }

  @Get('sms')
  @ApiOperation({
    summary: 'get sms message',
  })
  public async getMessagesWithPagination(
    @Query() pageQ: PaginationParamsDto,
    @Query() filterQ: SMSMessageFilterQ,
  ): Promise<BaseApiResponse<SMSMessageMiniDTO[]>> {
    return await this.service.getMessagesWithPagination(pageQ, filterQ);
  }
}
