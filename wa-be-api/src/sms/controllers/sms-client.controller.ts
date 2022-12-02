import {
  Body,
  Controller,
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
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  SMSClientEditNameInput,
  SMSClientRegisterInput,
} from '../dtos/sms-client-input.dto';
import {
  SMSClientOutputDetailDTO,
  SMSClientOutputDTO,
} from '../dtos/sms-client-output.dto';
import { SMSClientService } from '../services/sms-client.service';

@ApiTags('sms-client')
@Controller('sms-client')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SMSClientController {
  constructor(private readonly service: SMSClientService) {}

  @Post('create')
  @ApiOperation({
    summary: 'sms client register',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async register(
    @ReqContext() ctx: RequestContext,
    @Body() body: SMSClientRegisterInput,
  ): Promise<SMSClientOutputDTO> {
    return await this.service.createSMSClient(body);
  }

  @Patch('edit-name')
  @ApiOperation({
    summary: 'edit sms client name',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async editName(
    @ReqContext() ctx: RequestContext,
    @Body() body: SMSClientEditNameInput,
  ): Promise<SMSClientOutputDTO> {
    return await this.service.editSMSClient(body);
  }

  @Get('get-all')
  @ApiOperation({
    summary: 'get all clients with paginations',
  })
  public async getClientsWithPagination(
    @Query() paginationQ: PaginationParamsDto,
  ): Promise<BaseApiResponse<SMSClientOutputDTO[]>> {
    return await this.service.getClientsWithPagination(paginationQ);
  }

  @Get('detail/:id')
  @ApiOperation({
    summary: 'get client detail',
  })
  public async getClientDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SMSClientOutputDetailDTO> {
    return await this.service.getClientDetail(id);
  }
}
