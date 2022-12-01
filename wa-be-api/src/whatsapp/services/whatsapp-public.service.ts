import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { UserRepository } from 'src/user/repositories/user.repository';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import {
  CreateWhatsappMessageInput,
  WhatsappMessageFilterInput,
} from '../dtos/whatsapp-message-input.dto';
import {
  WhatsappMessageOutputDTO,
  WhatsappMessageOutputDTOMini,
} from '../dtos/whatsapp-message-output.dto';
import { WhatsappMessage } from '../entities/whatsapp-message.entity';
import { WhatsappClientRepository } from '../repositories/whatsapp-client.repository';
import { WhatsappMessageRepository } from '../repositories/whatsapp-message.entity';
import { WhatsappPublicTokenRepository } from '../repositories/whatsapp-public-token.repository';
import { WhatsappPublicUsageRepository } from '../repositories/whatsapp-public-usage.repository';
import { WhatsappCacheService } from './whatsapp-cache.service';
import { WhatsappCLientService } from './whatsapp-client.service';
import { WhatsappMessageService } from './whatsapp-message.service';

@Injectable()
export class WhatsappPublicService {
  constructor(
    private readonly waClientService: WhatsappCLientService,
    private readonly waMessageService: WhatsappMessageService,
    private readonly waCache: WhatsappCacheService,
    private readonly waMessageRepo: WhatsappMessageRepository,
    private readonly userRepo: UserRepository,
    private readonly waPublicUsageRepo: WhatsappPublicUsageRepository,
    private readonly waPublicTokenRepo: WhatsappPublicTokenRepository,
  ) {}
  public async sendTextMessage(
    ctx: RequestContext,
    body: CreateWhatsappMessageInput,
  ): Promise<WhatsappMessageOutputDTO> {
    await this.validateTokenAndRecordUsage(ctx);
    body.clientId = await this.getClientIdSuitableFromContext(
      ctx,
      body.clientId,
    );
    try {
      return await this.waMessageService.addTextMessage(body, ctx.user.id);
    } catch (err) {
      console.log('send text message public failed : ', err);
    }
  }

  public async getTextMessage(
    ctx: RequestContext,
    paginationQ: PaginationParamsDto,
    filterQ: WhatsappMessageFilterInput,
  ): Promise<BaseApiResponse<WhatsappMessageOutputDTOMini[]>> {
    await this.validateTokenAndRecordUsage(ctx);

    const options: FindManyOptions<WhatsappMessage> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
      relations: ['client', 'contact', 'content', 'createdBy'],
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
        content: {
          content: true,
        },
        updatedAt: true,
        status: true,
      },
    };

    // ? IF SUPERADMIN see all
    const isSuperadmin: boolean = ctx.user.isSuperAdmin ?? false;
    const where: FindOptionsWhere<WhatsappMessage> = {};
    if (filterQ.clientId) where.clientId = filterQ.clientId;
    if (filterQ.status) where.status = filterQ.status;
    if (isSuperadmin) {
      if (filterQ.createdById) where.createdById = filterQ.createdById;
    } else {
      where.createdById = ctx.user.id;
    }
    options.where = where;
    const [res, count] = await this.waMessageRepo.findAndCount(options);
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(WhatsappMessageOutputDTOMini, res);
    return { data, meta };
  }

  public async validateTokenAndRecordUsage(
    ctx: RequestContext,
  ): Promise<boolean> {
    const token = await this.waPublicTokenRepo.findOne({
      where: {
        userId: ctx.user.id,
        secret: ctx.user.other as string,
      },
    });
    if (token) {
      await this.waPublicUsageRepo.save({
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
    if (!ctx.user.isSuperAdmin) {
      const user = await this.userRepo.findOne({
        where: { id: ctx.user.id },
        select: {
          id: true,
          permittedClients: { id: true },
        },
        relations: ['permittedClients'],
        loadEagerRelations: false,
      });
      clientIds = user.permittedClients.map((p) => p.id);
    }
    if (ctx.user.other && !ctx.user.isSuperAdmin) {
      throw new BadRequestException(
        'Anda tidak memiliki permission untuk client',
      );
    }
    if (!clientId) {
      console.log('tidak ada client id');
      if (ctx.user.isSuperAdmin) {
        const cs = await this.waCache.getClients();
        console.log('client di cache : ', cs);
        const csss = cs[Math.floor(Math.random() * cs.length)];
        console.log('client random : ', csss);
        return csss;
      } else {
        return clientIds[Math.floor(Math.random() * ctx.user.other.length)];
      }
    } else {
      if (!clientIds.includes(clientId)) {
        throw new BadRequestException(
          'Anda tidak memiliki permission untuk client',
        );
      } else {
        return clientId;
      }
    }
  }
}
