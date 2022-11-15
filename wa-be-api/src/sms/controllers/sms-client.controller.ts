import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthTokenOutput } from 'src/auth/dtos/auth-token-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/guards/superadmin.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { SMSClientRegisterInput } from '../dtos/sms-client-input.dto';
import { SMSClient } from '../entities/sms-client.entity';
import { SMSLocalAuthGuard } from '../guards/sms-local-auth.guard';
import { SMSAuthService } from '../services/sms-auth.service';
import { SMSClientService } from '../services/sms-client.service';

@ApiTags('sms-client')
@Controller('sms-client')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SMSClientController {
  constructor(private readonly service: SMSClientService) {}

  @Get('me')
  @ApiOperation({
    summary: 'get sms client id based on bearer api?',
  })
  public async getMe(@ReqContext() ctx: RequestContext): Promise<SMSClient> {
    return await this.service.getMe(ctx);
  }
}
