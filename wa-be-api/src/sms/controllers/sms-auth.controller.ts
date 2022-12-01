import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthTokenOutput } from 'src/auth/dtos/auth-token-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { SMSClientRegisterInput } from '../dtos/sms-client-input.dto';
import { SMSAuthService } from '../services/sms-auth.service';

@ApiTags('sms-auth')
@Controller('sms-auth')
export class SMSAuthController {
  constructor(private readonly authService: SMSAuthService) {}

  @Post('test-message')
  @ApiOperation({
    summary: 'test message broadcast',
  })
  public async testMessage(
    @Body() input: SMSClientRegisterInput,
  ): Promise<BaseApiResponse<string>> {
    const s = await this.authService.testMessage(input.msisdn);
    return {
      data: s,
      meta: {},
    };
  }

  @Post('test-decrypt-message')
  @ApiOperation({
    summary: 'test decrypt message broadcast',
  })
  public async decryptMessage(
    @Body() input: SMSClientRegisterInput,
  ): Promise<BaseApiResponse<string>> {
    const s = await this.authService.decryptMsg(input.msisdn);
    return {
      data: s,
      meta: {},
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'sms client login ',
  })
  // @UseGuards(SMSLocalAuthGuard)
  public async login(
    @Body() credential: SMSClientRegisterInput,
    @ReqContext() ctx: RequestContext,
  ): Promise<AuthTokenOutput> {
    console.log('login sms-auth : ', credential);
    return await this.authService.login(ctx, credential);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'refressh access token',
  })
  refreshToken() {
    this.authService.refreshToken();
  }
}
