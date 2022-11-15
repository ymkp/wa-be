import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthTokenOutput } from 'src/auth/dtos/auth-token-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { SMSClientRegisterInput } from '../dtos/sms-client-input.dto';
import { SMSLocalAuthGuard } from '../guards/sms-local-auth.guard';
import { SMSAuthService } from '../services/sms-auth.service';

@ApiTags('sms-auth')
@Controller('sms-auth')
export class SMSAuthController {
  constructor(private readonly authService: SMSAuthService) {}

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

  @Post('register')
  @ApiOperation({
    summary: 'sms client register',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async register(
    @ReqContext() ctx: RequestContext,
    @Body() body: SMSClientRegisterInput,
  ) {
    await this.authService.register(body);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'refressh access token',
  })
  refreshToken() {
    this.authService.refreshToken();
  }
}
