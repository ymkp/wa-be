import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('whatsapp-contact')
@Controller('whatsapp-contact')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsappContactController {
  constructor() {}

  @Get('')
  @ApiOperation({
    summary: 'get list of WA contacts registered on the system',
  })
  async getContacts() {
    // TODO : implementation
  }

  @Get('/detail/:id')
  @ApiOperation({
    summary: 'get WA contact detail',
  })
  async getContactDetail(@Param('id') id: number) {
    // TODO : implementation
  }
}
