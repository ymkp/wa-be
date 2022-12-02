import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { UserRepository } from 'src/user/repositories/user.repository';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import {
  SMSMessageCreateInputDTO,
  SMSMessageFilterQ,
} from '../dtos/sms-message-input.dto';
import { SMSMessageMiniDTO } from '../dtos/sms-message-output.dto';
import { SMSMessage } from '../entities/sms-message.entity';
import { SMSEventsGateway } from '../gateways/sms-events.gateway';
import { SMSMessageRepository } from '../repositories/sms-message.repository';
import { SMSPublicTokenRepository } from '../repositories/sms-public-token.repository';
import { SMSPublicUsageRepository } from '../repositories/sms-public-usage.repository';
import { SMSMessageService } from './sms-message.service';

@Injectable()
export class SMSPublicService {
  constructor(
    private readonly smsPublicUsageRepo: SMSPublicUsageRepository,
    private readonly smsPublicTokenRepo: SMSPublicTokenRepository,
    private readonly smsMessageRepo: SMSMessageRepository,
    private readonly smsGW: SMSEventsGateway,
    private readonly userRepo: UserRepository,

    private readonly smsMessageService: SMSMessageService,
  ) {}

  public async sendSMS(ctx: RequestContext, body: SMSMessageCreateInputDTO) {
    await this.validateTokenAndRecordUsage(ctx);
    body.clientId = await this.getClientIdSuitableFromContext(
      ctx,
      body.clientId,
    );
    return await this.smsMessageService.sendMessage(ctx, body);
  }

  public async getSMSs(
    ctx: RequestContext,
    paginationQ: PaginationParamsDto,
    filterQ: SMSMessageFilterQ,
  ): Promise<BaseApiResponse<SMSMessageMiniDTO[]>> {
    await this.validateTokenAndRecordUsage(ctx);

    const options: FindManyOptions<SMSMessage> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
      relations: ['client', 'contact', 'createdBy'],
      loadEagerRelations: false,
      select: {
        id: true,
        client: {
          id: true,
          name: true,
          msisdn: true,
        },
        createdBy: {
          id: true,
          name: true,
          identificationNo: true,
        },
        contact: {
          id: true,
          name: true,
          msisdn: true,
        },
        message: true,
        updatedAt: true,
        status: true,
      },
    };

    // ? IF SUPERADMIN see all
    const isSuperadmin: boolean = ctx.user.isSuperAdmin ?? false;
    const where: FindOptionsWhere<SMSMessage> = {};
    if (filterQ.clientId) where.clientId = filterQ.clientId;
    if (filterQ.status) where.status = filterQ.status;
    if (isSuperadmin) {
      if (filterQ.createdById) where.createdById = filterQ.createdById;
    } else {
      where.createdById = ctx.user.id;
    }
    options.where = where;
    const [res, count] = await this.smsMessageRepo.findAndCount(options);
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(SMSMessageMiniDTO, res);
    return { data, meta };
  }

  public async validateTokenAndRecordUsage(
    ctx: RequestContext,
  ): Promise<boolean> {
    const token = await this.smsPublicTokenRepo.findOne({
      where: {
        userId: ctx.user.id,
        secret: ctx.user.other as string,
      },
    });
    if (token) {
      await this.smsPublicUsageRepo.save({
        tokenId: token.id,
        userAgent: ctx.userAgent,
        referer: ctx.referer,
        ip: ctx.ip,
        host: ctx.host,
      });
      return true;
    } else {
      throw new BadRequestException('Token tidak valid atau sudah tidak aktif');
    }
  }

  // ? -------------------privates

  private async getClientIdSuitableFromContext(
    ctx: RequestContext,
    clientId?: number,
  ): Promise<number> {
    let clientIds: number[] = [];
    const cs = this.smsGW.getAvailableCLients();

    if (ctx.user.isSuperAdmin) {
      if (clientId) {
        if (cs.includes(clientId)) {
          return clientId;
        } else {
          throw new BadRequestException(
            `Client ${clientId} sedang tidak aktif`,
          );
        }
      } else {
        console.log('client di cache : ', cs);
        const csss = cs[Math.floor(Math.random() * cs.length)];
        console.log('client random : ', csss);
        return csss;
      }
    } else {
      const user = await this.userRepo.findOne({
        where: { id: ctx.user.id },
        select: {
          id: true,
          permittedSMSs: { id: true },
        },
        relations: ['permittedSMSs'],
        loadEagerRelations: false,
      });
      clientIds = user.permittedSMSs.map((p) => p.id);
      if (clientId) {
        if (!clientIds.includes(clientId))
          throw new UnauthorizedException(
            `client dengan id : ${clientId} tidak boleh dipakai`,
          );
        return clientId;
      } else {
        let availableIds: number[] = [];
        cs.forEach((i) => {
          if (clientIds.includes(i)) availableIds.push(i);
        });
        const csss =
          availableIds[Math.floor(Math.random() * availableIds.length)];
        return csss;
      }
    }
  }
}
