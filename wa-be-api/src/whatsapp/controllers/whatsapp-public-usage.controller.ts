import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/guards/superadmin.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { WhatsappPublicUsageOutputDTO } from '../dtos/whatsapp-public-usage-output.dto';
import {
  WHatsappPublicUsageFilterQ,
  WhatsappPublicUsageGetterQ,
} from '../dtos/whatsapp-public-usage.input.dto';
import { WhatsappPublicUsageService } from '../services/whatsapp-public-usage.service';

@ApiTags('whatsapp-public-usage')
@Controller('whatsapp-public-usage')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class WhatsappPublicUsageController {
  constructor(private readonly service: WhatsappPublicUsageService) {}

  @Get('')
  @ApiOperation({
    summary: 'get whatsapp public usage history',
  })
  public async getUsages(
    @Query() paginationQ: PaginationParamsDto,
    @Query() filterQ: WHatsappPublicUsageFilterQ,
    @Query() getterQ: WhatsappPublicUsageGetterQ,
  ): Promise<BaseApiResponse<WhatsappPublicUsageOutputDTO[]>> {
    return await this.service.getUsages(paginationQ, filterQ, getterQ);
  }
}
