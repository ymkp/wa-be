import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokenOutput } from 'src/auth/dtos/auth-token-output.dto';
import { SuperAdminGuard } from 'src/auth/guards/superadmin.guard';
import { MultipleIdsToSingleEntityInput } from 'src/shared/dtos/id-value-input.dto';
import { IdValNumberDTO } from 'src/shared/dtos/id-value-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';

import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  UserEditBody,
  UserEditPasswordBody,
  UserFilterInput,
} from '../dtos/user-input.dto';
import {
  UserOutput,
  UserOutputDetailDTO,
  UserOutputMini,
} from '../dtos/user-output.dto';
import { UserService } from '../services/user.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  @ApiOperation({
    summary: 'Get user me API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getMyProfile(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<UserOutput>> {
    const user = await this.userService.findById(ctx, ctx.user.id);
    return { data: user, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get users as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([UserOutput]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getUsers(
    @ReqContext() ctx: RequestContext,
    @Query() query: PaginationParamsDto,
  ): Promise<BaseApiResponse<UserOutput[]>> {
    const { users, count } = await this.userService.getUsers(ctx, query.limit);

    return { data: users, meta: { count } };
  }

  @Get('count/user')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({
    summary: 'get users count',
  })
  async getUsersCount(): Promise<IdValNumberDTO> {
    const value = await this.userService.countUser();
    return { id: 0, value };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({
    summary: 'Get user by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutputDetailDTO),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async getUser(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<UserOutputDetailDTO> {
    const user = await this.userService.getUserById(ctx, id);
    return user;
  }

  // NOTE : This can be made a admin only endpoint. For normal users they can use PATCH /me
  @Patch('edit')
  @ApiOperation({
    summary: 'Update user API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async updateUser(
    @ReqContext() ctx: RequestContext,
    @Body() input: UserEditBody,
  ): Promise<BaseApiResponse<UserOutput>> {
    const user = await this.userService.updateUser(ctx, input);
    return { data: user, meta: {} };
  }

  @Post('whatsapp-client-permission')
  @ApiOperation({
    summary: 'set whatsapp clients for user',
  })
  @UseGuards(SuperAdminGuard)
  async setWhatsappClients(
    @Body() body: MultipleIdsToSingleEntityInput,
  ): Promise<BaseApiResponse<string>> {
    await this.userService.setWhatsappClient(body);
    return { data: 'ok' };
  }

  @Post('sms-client-permission')
  @ApiOperation({
    summary: 'set sms clients for user',
  })
  @UseGuards(SuperAdminGuard)
  async setSMSClient(
    @Body() body: MultipleIdsToSingleEntityInput,
  ): Promise<BaseApiResponse<string>> {
    await this.userService.setSMSClient(body);
    return { data: 'ok' };
  }

  @Patch('edit/password')
  @ApiOperation({
    summary: 'Update user password',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async editPassword(
    @ReqContext() ctx: RequestContext,
    @Body() input: UserEditPasswordBody,
  ): Promise<void> {
    await this.userService.editPassword(ctx, input);
  }

  @Get('token/generate-wa-for-me')
  @ApiOperation({ summary: 'generate wa token for logged in user' })
  async generateWATokenForSelf(
    @ReqContext() ctx: RequestContext,
  ): Promise<AuthTokenOutput> {
    return await this.userService.generateWATokenForUser(ctx.user.id);
  }

  @Get('token/generate-sms-for-me')
  @ApiOperation({ summary: 'generate sms token for logged in user' })
  async generateSMSTokenForSelf(
    @ReqContext() ctx: RequestContext,
  ): Promise<AuthTokenOutput> {
    return await this.userService.generateSMSTokenForUser(ctx.user.id);
  }

  @Get('token/generate-wa-for-other/:userId')
  @ApiOperation({
    summary:
      'generate wa token for other user. Only superadmin can do this operation',
  })
  @UseGuards(SuperAdminGuard)
  async generateWATokenForOtherUser(
    @Param('userId') userId: number,
  ): Promise<AuthTokenOutput> {
    return await this.userService.generateWATokenForUser(userId);
  }

  @Get('token/generate-sms-for-other/:userId')
  @ApiOperation({
    summary:
      'generate sms token for other user. Only superadmin can do this operation',
  })
  @UseGuards(SuperAdminGuard)
  async generateSMSTokenForOtherUser(
    @Param('userId') userId: number,
  ): Promise<AuthTokenOutput> {
    return await this.userService.generateSMSTokenForUser(userId);
  }
}
