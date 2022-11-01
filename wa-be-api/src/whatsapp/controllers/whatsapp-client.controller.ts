import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  WhatsappClientEntityInput,
  WhatsappClientInputRegister,
} from '../dtos/whatsapp-client-input.dto';
import { WhatsappCLientService } from '../services/whatsapp-client.service';

@ApiTags('whatsapp-client')
@Controller('whatsapp-client')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class WhatsappClientController {
  constructor(private readonly waClientService: WhatsappCLientService) {}

  // @Get('tessttt')
  // @ApiOperation({
  //   summary: 'test',
  // })
  // async testsss(): Promise<void> {
  //   await this.waClientService.testCopy();
  // }

  @Get('')
  @ApiOperation({
    summary: 'get list of WA clients registered on the system',
  })
  async getClients() {
    // TODO : implementation
  }

  @Post('')
  @ApiOperation({
    summary: 'create a new WA client',
  })
  async createAClient(
    @Body() body: WhatsappClientInputRegister,
  ): Promise<void> {
    await this.waClientService.createWAClient(body);
  }

  @Patch('')
  @ApiOperation({ summary: 'edit a WA client' })
  async editAClient(@Body() body: WhatsappClientEntityInput) {
    // TODO : implementation
  }

  @Post('worker/login')
  @ApiOperation({
    summary: 'login to client',
  })
  async loginWorker(@Body() body: WhatsappClientEntityInput): Promise<void> {
    await this.waClientService.loginWAWorker(body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'soft delete a WA client' })
  async freezeAClient() {
    // TODO : implementation
  }

  @Get('/detail/:id')
  @ApiOperation({
    summary: 'get WA client detail',
  })
  async getClientDetail(@Param('id') id: number) {
    // TODO : implementation
  }

  @Post('/qrcode/request')
  @ApiOperation({ summary: 'request qr code for auth' })
  async qrCodeRequest(@Body() body: WhatsappClientEntityInput) {
    // TODO : implementation
  }

  @Post('/token/generate')
  @ApiOperation({ summary: 'generate token for client' })
  async tokenGenerate(@Body() body: WhatsappClientEntityInput) {
    // TODO : implementation
  }

  @Post('/status')
  @ApiOperation({ summary: 'check client status' })
  async clientStatus(@Body() body: WhatsappClientEntityInput) {
    // TODO : implementation
  }
}
