import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HookReceivedMessageDTO,
  HookWorkerInitDTO,
} from '../dtos/whatsapp-hook-input.dto';
import { WhatsappHookService } from '../services/whatsapp-hook.service';

@ApiTags('whatsapp-hook')
@Controller('whatsapp-hook')
// TODO : implement jwt
export class WhatsappHookController {
  constructor(private readonly hookService: WhatsappHookService) {}

  @Post('/worker/init')
  @ApiOperation({
    summary: 'hook - after worker successfully built',
  })
  async workerInit(@Body() body: HookWorkerInitDTO): Promise<void> {
    console.log('hook - after worker successfully built');
    await this.hookService.workerInit(body);
  }

  @Post('/message/receive')
  @ApiOperation({
    summary: 'hook - receive message?',
  })
  async receiveMessage(@Body() body: HookReceivedMessageDTO): Promise<void> {
    await this.hookService.receiveMessage(body);
  }
}
