import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { WhatsappContactFilterInput } from '../dtos/whatsapp-contact-input.dto';
import { WhatsappContactOutputDTO } from '../dtos/whatsapp-contact-output.dto';
import { WhatsappContactService } from '../services/whtasapp-contact.service';

@ApiTags('whatsapp-contact')
@Controller('whatsapp-contact')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsappContactController {
  constructor(private readonly contactService: WhatsappContactService) {}

  @Get('/get')
  @ApiOperation({
    summary: 'get list of WA contacts registered on the system',
  })
  async getContacts(
    @Param() paginationQ: PaginationParamsDto,
    @Param() filterQ: WhatsappContactFilterInput,
  ): Promise<BaseApiResponse<WhatsappContactOutputDTO[]>> {
    return await this.contactService.getContactsWithPagination(
      paginationQ,
      filterQ,
    );
  }

  @Get('/detail/:id')
  @ApiOperation({
    summary: 'get WA contact detail',
  })
  async getContactDetail(@Param('id') id: number) {
    return await this.contactService.getContactDetail(id);
  }
}
