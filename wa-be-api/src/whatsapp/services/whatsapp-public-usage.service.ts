import { Injectable } from '@nestjs/common';
import { WhatsappPublicUsageRepository } from '../repositories/whatsapp-public-usage.repository';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import {
  WHatsappPublicUsageFilterQ,
  WhatsappPublicUsageGetterQ,
} from '../dtos/whatsapp-public-usage.input.dto';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { WhatsappPublicUsageOutputDTO } from '../dtos/whatsapp-public-usage-output.dto';
import { Between, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { WhatsappPublicUsage } from '../entities/whatsapp-public-usage.entity';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WhatsappPublicUsageService {
  constructor(private readonly usageRepo: WhatsappPublicUsageRepository) {}

  public async getUsages(
    paginationQ: PaginationParamsDto,
    filterQ: WHatsappPublicUsageFilterQ,
    getterQ: WhatsappPublicUsageGetterQ,
  ): Promise<BaseApiResponse<WhatsappPublicUsageOutputDTO[]>> {
    const options: FindManyOptions<WhatsappPublicUsage> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
      relations: ['token', 'token.user'],
      loadEagerRelations: false,
      withDeleted: true,
      select: {
        id: true,
        host: getterQ.isHost,
        url: getterQ.isURL,
        ip: getterQ.isIP,
        referer: getterQ.isReferer,
        userAgent: getterQ.isUserAgent,
        token: getterQ.isUser
          ? {
              id: true,
              user: {
                id: true,
                identificationNo: true,
                name: true,
              },
            }
          : {},
      },
    };
    const where: FindOptionsWhere<WhatsappPublicUsage> = {};
    if (filterQ.userId) where.token = { userId: filterQ.userId };
    if (filterQ.lastDate || filterQ.startDate) {
      const lastDate = filterQ.lastDate
        ? new Date(filterQ.lastDate)
        : new Date(Date.now());
      const firstDate = filterQ.startDate
        ? new Date(filterQ.startDate)
        : new Date(0);
      where.createdAt = Between(firstDate, lastDate);
    }
    options.where = where;
    const [res, count] = await this.usageRepo.findAndCount(options);
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(WhatsappPublicUsageOutputDTO, res);
    return { data, meta };
  }
}
