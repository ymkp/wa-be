import {
  Body,
  Controller,
  Delete,
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
import { SuperAdminGuard } from 'src/auth/guards/superadmin.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import {
  WhatsappClientEntityInput,
  WhatsappClientIdInput,
  WhatsappClientInputRegister,
  WhatsappClientQRGenerateInput,
} from '../dtos/whatsapp-client-input.dto';
import { WhatsappClientOutputDTO } from '../dtos/whatsapp-client-output.dto';
import { WhatsappCLientService } from '../services/whatsapp-client.service';

@ApiTags('whatsapp-client')
@Controller('whatsapp-client')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsappClientController {
  constructor(private readonly waClientService: WhatsappCLientService) {}

  @Get('')
  @ApiOperation({
    summary: 'get list of WA clients registered on the system',
  })
  async getClients(
    @Query() paginationQ: PaginationParamsDto,
  ): Promise<BaseApiResponse<WhatsappClientOutputDTO[]>> {
    return await this.waClientService.getClientsWithPagination(paginationQ);
  }

  @Post('')
  @ApiOperation({
    summary: 'create a new WA client',
  })
  async createAClient(
    @Body() body: WhatsappClientInputRegister,
  ): Promise<WhatsappClientOutputDTO> {
    return await this.waClientService.createWAClient(body);
  }

  @Patch('')
  @ApiOperation({ summary: 'NOT-YET-IMPLEMENTED edit a WA client' })
  async editAClient(@Body() body: WhatsappClientEntityInput) {
    // TODO : implementation
  }

  @Post('worker/login')
  @ApiOperation({
    summary: 'login to client',
  })
  async loginWorker(@Body() body: WhatsappClientIdInput): Promise<void> {
    await this.waClientService.loginWAWorkerPublic(body);
  }

  @Patch('deactivate/:id')
  @ApiOperation({ summary: 'deactive a WA client' })
  @UseGuards(SuperAdminGuard)
  async freezeAClient(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WhatsappClientOutputDTO> {
    return await this.waClientService.freezeAClient(id);
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'restore a WA client' })
  @UseGuards(SuperAdminGuard)
  async restoreAClient(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WhatsappClientOutputDTO> {
    return await this.waClientService.restoreAClient(id);
  }

  @Get('/detail/:id')
  @ApiOperation({
    summary: 'get WA client detail',
  })
  async getClientDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WhatsappClientOutputDTO> {
    return await this.waClientService.getClientDetail(id);
  }

  @Post('/qrcode/request')
  @ApiOperation({
    summary:
      'request qr code for auth.  fill "other" with "json" or "html"(default : html)',
  })
  async qrCodeRequest(
    @Body() body: WhatsappClientQRGenerateInput,
  ): Promise<any> {
    return await this.waClientService.generateQRLogin(body);
  }

  @Post('/token/generate')
  @ApiOperation({ summary: 'NOT-YET-IMPLEMENTED generate token for client' })
  async tokenGenerate(@Body() body: WhatsappClientEntityInput) {
    // TODO : implementation
  }

  @Post('/status')
  @ApiOperation({ summary: 'NOT-YET-IMPLEMENTED check client status' })
  async clientStatus(@Body() body: WhatsappClientEntityInput): Promise<any> {
    return await this.waClientService.checkClientStatus(body.id);
  }
}
