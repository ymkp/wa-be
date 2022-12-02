import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import {
  WhatsappConversationMessageOutputDTO,
  WhatsappConversationOutputDTO,
} from '../dtos/whatsapp-conversation-output.dto';
import { WhatsappConversationFilterInput } from '../dtos/whatsapp-conversation.input.dto';
import { WhatsappConversationService } from '../services/whatsapp-conversation.service';

// @ApiTags('whatsapp-conversation')
// @UseGuards(JwtAuthGuard)
@Controller('whatsapp-conversation')
@ApiBearerAuth()
export class WhatsappCOnversationController {
  constructor(private readonly service: WhatsappConversationService) {}

  // @Get('/list')
  // @ApiOperation({
  //   summary: 'get conversation list',
  // })
  // public async getConversationList(
  //   @Query() paginationQ: PaginationParamsDto,
  //   @Query() filterQ: WhatsappConversationFilterInput,
  // ): Promise<BaseApiResponse<WhatsappConversationOutputDTO[]>> {
  //   return await this.service.getConversationList(paginationQ, filterQ);
  // }

  // @Get('/info/:conversationId')
  // @ApiOperation({
  //   summary: 'get conversation info',
  // })
  // public async getConversationInfo(
  //   @Param('conversationId') conversationId: number,
  // ): Promise<WhatsappConversationOutputDTO> {
  //   return await this.service.getCOnversationInfoById(conversationId);
  // }

  // @Get('/messages/:conversationId')
  // @ApiOperation({
  //   summary: 'get conversation messages',
  // })
  // public async getConversationMessages(
  //   @Param('conversationId') conversationId: number,
  //   @Query() paginationQ: PaginationParamsDto,
  // ): Promise<BaseApiResponse<WhatsappConversationMessageOutputDTO[]>> {
  //   return await this.service.getConversationMessagesByConversationId(
  //     conversationId,
  //     paginationQ,
  //   );
  // }
}
