import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/guards/superadmin.guard';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';

import {
  SMSPublicUsageFilterQ,
  SMSPublicUsageGetterQ,
} from '../dtos/sms-public-usage-input.dto';
import { SMSPublicUsageService } from '../services/sms-public-usage.service';

@ApiTags('whatsapp-public-usage')
@Controller('whatsapp-public-usage')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class WhatsappPublicUsageController {
  constructor(private readonly service: SMSPublicUsageService) {}

  @Get('')
  @ApiOperation({
    summary: 'get whatsapp public usage history',
  })
  public async getUsages(
    @Query() paginationQ: PaginationParamsDto,
    @Query() filterQ: SMSPublicUsageFilterQ,
    @Query() getterQ: SMSPublicUsageGetterQ,
  ) {
    return await this.service.getUsages(paginationQ, filterQ, getterQ);
  }
}
