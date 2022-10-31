import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateWhatsappMessageInput } from '../dtos/whatsapp-message-input.dto';

@ApiTags('whatsapp-message')
@Controller('whatsapp-message')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsappMessageController {
  constructor() {}

  @Get('')
  @ApiOperation({
    summary: 'get list of WA messages registered on the system',
  })
  async getMessages() {
    // TODO : implementation
  }

  @Post('/new')
  @ApiOperation({
    summary: 'create a new WA message, sends it to queue',
  })
  async sendsAMessage(@Body() body: CreateWhatsappMessageInput) {
    // TODO : implementation
  }

  @Get('/queue')
  @ApiOperation({
    summary: 'get list of WA messages still on queues',
  })
  async getQueuedMessages() {
    // TODO : implementation
  }

  @Get('/client/:id')
  @ApiOperation({
    summary: 'get WA messages by client id',
  })
  async getMessagesByClientId() {
    // TODO : implementation
  }

  @Get('/detail/:id')
  @ApiOperation({
    summary: 'get WA message detail',
  })
  async getMessageDetail(@Param('id') id: number) {
    // TODO : implementation
  }
}
