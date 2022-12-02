import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicTokenGuard } from 'src/auth/guards/public-token.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  CreateWhatsappMessageInput,
  WhatsappMessageFilterInput,
} from '../dtos/whatsapp-message-input.dto';
import {
  WhatsappMessageOutputDTO,
  WhatsappMessageOutputDTOMini,
} from '../dtos/whatsapp-message-output.dto';
import { WhatsappPublicService } from '../services/whatsapp-public.service';

@ApiTags('whatsapp-public, dipakai oleh orang luar')
@Controller('whatsapp-public')
@UseGuards(PublicTokenGuard)
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

  @Get('/get/messages')
  @ApiOperation({
    summary: 'get list of WA messages registered on the system',
  })
  async getMessages(
    @ReqContext() ctx: RequestContext,
    @Query() paginationQ: PaginationParamsDto,
    @Query() filterQ: WhatsappMessageFilterInput,
  ): Promise<BaseApiResponse<WhatsappMessageOutputDTOMini[]>> {
    return await this.waPublicService.getTextMessage(ctx, paginationQ, filterQ);
  }
}
