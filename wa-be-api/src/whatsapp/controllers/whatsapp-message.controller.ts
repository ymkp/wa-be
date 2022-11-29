import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthService } from 'src/auth/services/auth.service';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { UserService } from 'src/user/services/user.service';
import {
  CreateWhatsappMessageInput,
  WhatsappMessageFilterInput,
} from '../dtos/whatsapp-message-input.dto';
import {
  WhatsappMessageOutputDTO,
  WhatsappMessageOutputDTOMini,
} from '../dtos/whatsapp-message-output.dto';
import { WhatsappMessageService } from '../services/whatsapp-message.service';

@ApiTags('whatsapp-message')
@Controller('whatsapp-message')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsappMessageController {
  constructor(private readonly service: WhatsappMessageService) {}

  @Get('/get')
  @ApiOperation({
    summary: 'get list of WA messages registered on the system',
  })
  async getMessages(
    @ReqContext() ctx: RequestContext,
    @Query() paginationQ: PaginationParamsDto,
    @Query() filterQ: WhatsappMessageFilterInput,
  ): Promise<BaseApiResponse<WhatsappMessageOutputDTOMini[]>> {
    return await this.service.getMessageWithPagination(
      ctx,
      paginationQ,
      filterQ,
    );
  }

  @Post('/new/text')
  @ApiOperation({
    summary: 'create a new text WA message, sends it to queue',
  })
  async sendsAMessage(
    @ReqContext() ctx: RequestContext,
    @Body() body: CreateWhatsappMessageInput,
  ): Promise<WhatsappMessageOutputDTO> {
    return await this.service.addTextMessage(body, ctx.user.id);
  }

  @Get('/onqueue')
  @ApiOperation({
    summary: 'get list of WA messages still on queues',
  })
  async getOnQueuedMessages(): Promise<WhatsappMessageOutputDTOMini[]> {
    return await this.service.getOnQueueMessages();
  }

  @Get('/onprogress')
  @ApiOperation({
    summary: 'get list of WA messages still on progress',
  })
  async getOnProgressMessages(): Promise<WhatsappMessageOutputDTOMini[]> {
    return await this.service.getOnProgressMessages();
  }

  @Get('/detail/:id')
  @ApiOperation({
    summary: 'get WA message detail',
  })
  async getMessageDetail(
    @Param('id') id: number,
  ): Promise<WhatsappMessageOutputDTO> {
    return await this.service.getMessageDetail(id);
  }
}
