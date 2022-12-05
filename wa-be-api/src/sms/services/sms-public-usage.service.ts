import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { Between, FindManyOptions, FindOptionsWhere } from 'typeorm';
import {
  SMSPublicUsageFilterQ,
  SMSPublicUsageGetterQ,
} from '../dtos/sms-public-usage-input.dto';
import { SMSPublicUsageOutputDTO } from '../dtos/sms-public-usage-output.dto';
import { SMSPublicUsage } from '../entities/sms-public-usage.entity';
import { SMSPublicUsageRepository } from '../repositories/sms-public-usage.repository';

@Injectable()
export class SMSPublicUsageService {
  constructor(private readonly usageRepo: SMSPublicUsageRepository) {}

  public async getUsages(
    paginationQ: PaginationParamsDto,
    filterQ: SMSPublicUsageFilterQ,
    getterQ: SMSPublicUsageGetterQ,
  ): Promise<BaseApiResponse<SMSPublicUsageOutputDTO[]>> {
    const options: FindManyOptions<SMSPublicUsage> = {
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
      },
    };
    const where: FindOptionsWhere<SMSPublicUsage> = {};
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
    const data = plainToInstance(SMSPublicUsageOutputDTO, res);
    return { data, meta };
  }
}
