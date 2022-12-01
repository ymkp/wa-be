import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MultipleIdsToSingleEntityInput } from 'src/shared/dtos/id-value-input.dto';

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  EmailConfirmationBody,
  EmailInput,
  LoginInput,
} from '../dtos/auth-login-input.dto';
import { RefreshTokenInput } from '../dtos/auth-refresh-token-input.dto';
import {
  RegisterInput,
  SSORequestInput,
  SSOUseInput,
} from '../dtos/auth-register-input.dto';
import { RegisterOutput } from '../dtos/auth-register-output.dto';
import { AuthTokenOutput } from '../dtos/auth-token-output.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ModeratorGuard } from '../guards/moderator.guard';
import { SuperAdminGuard } from '../guards/superadmin.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  login(
    @ReqContext() ctx: RequestContext,
    @Body() credential: LoginInput,
  ): BaseApiResponse<AuthTokenOutput> {
    const authToken = this.authService.login(ctx);
    return { data: authToken, meta: {} };
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(RegisterOutput),
  })
  @UseGuards(JwtAuthGuard, ModeratorGuard)
  @ApiBearerAuth()
  async registerLocal(
    @ReqContext() ctx: RequestContext,
    @Body() input: RegisterInput,
  ): Promise<BaseApiResponse<RegisterOutput>> {
    const registeredUser = await this.authService.register(ctx, input);
    return { data: registeredUser, meta: {} };
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: RefreshTokenInput,
  ): Promise<BaseApiResponse<AuthTokenOutput>> {
    const authToken = await this.authService.refreshToken(ctx);
    return { data: authToken, meta: {} };
  }

  @Post('grant-super-admin')
  @ApiOperation({
    summary: 'grant superadmin to a user',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  public async grantSuperAdmin(
    @ReqContext() ctx: RequestContext,
    @Body() body: MultipleIdsToSingleEntityInput,
  ): Promise<BaseApiResponse<string>> {
    await this.authService.grantSuperAdminToUser(ctx, body.ids);
    return { data: 'ok' };
  }

  @Post('revoke-super-admin')
  @ApiOperation({
    summary: 'revoke superadmin from a user',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  public async revokeSuperAdmin(
    @ReqContext() ctx: RequestContext,
    @Body() body: MultipleIdsToSingleEntityInput,
  ): Promise<BaseApiResponse<string>> {
    await this.authService.revokeSuperAdminFromUser(ctx, body.ids);
    return { data: 'ok' };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'logout',
  })
  public async logout(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<string>> {
    await this.authService.logout(ctx);
    return { data: 'ok' };
  }

  @Post('get-sso-token')
  @ApiOperation({
    summary: 'get sso token v 0.0.0.0.0.0',
  })
  public async generateSSOToken(
    @Body() input: SSORequestInput,
  ): Promise<{ data: string; url: string }> {
    return await this.authService.generateSSOToken(input.identificationNo);
  }

  @Post('use-sso-token')
  @ApiOperation({
    summary: 'use sso token v 0.0.0.0.0.0.0',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  public async useSSOTOken(
    @ReqContext() ctx: RequestContext,
    @Body() input: SSOUseInput,
  ): Promise<AuthTokenOutput> {
    return await this.authService.useSSOToken(ctx, input.ssoToken);
  }

  @Post('change-forgotten-password')
  @ApiOperation({
    summary: 'change password from token from email',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse('ok'),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async changeForgottenPassword(
    @Body() confirmationData: EmailConfirmationBody,
  ): Promise<BaseApiResponse<string>> {
    const email = await this.authService.decodeConfirmationToken(
      confirmationData.token,
    );
    await this.authService.changeForgottenPassword(
      email,
      confirmationData.password,
    );
    return { data: 'ok' };
  }

  @Post('request-forget-password')
  @ApiOperation({
    summary: 'request password',
  })
  async requestForgetPassword(
    @Body() input: EmailInput,
  ): Promise<BaseApiResponse<string>> {
    await this.authService.requestForgetPassword(input.email);
    return { data: 'ok' };
  }
}
