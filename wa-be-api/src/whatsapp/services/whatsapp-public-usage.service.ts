import { Injectable } from '@nestjs/common';
import { WhatsappPublicUsageRepository } from '../repositories/whatsapp-public-usage.repository';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import {
  WHatsappPublicUsageFilterQ,
  WhatsappPublicUsageGetterQ,
} from '../dtos/whatsapp-public-usage.input.dto';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { WhatsappPublicUsageOutputDTO } from '../dtos/whatsapp-public-usage-output.dto';
import { FindManyOptions } from 'typeorm';
import { WhatsappPublicUsage } from '../entities/whatsapp-public-usage.entity';

@Injectable()
export class WhatsappTestService {
  constructor(private readonly usageRepo: WhatsappPublicUsageRepository) {}

  // TODO : IMPLEMENT THIS
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
      select: {
        id: true,
        host: getterQ.isHost,
        url: getterQ.isURL,
        ip: getterQ.isIP,
        referer: getterQ.isReferer,
        userAgent: getterQ.isUserAgent,
      },
    };
    return { data: [] };
  }
}
