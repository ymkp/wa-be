import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { FindManyOptions, FindOptionsWhere, Like } from 'typeorm';
import { WhatsappContactFilterInput } from '../dtos/whatsapp-contact-input.dto';
import { WhatsappContactOutputDTO } from '../dtos/whatsapp-contact-output.dto';
import { WhatsappContact } from '../entities/whatsapp-contact.entity';

import { WhatsappContactRepository } from '../repositories/whatsapp-contact.repository';

@Injectable()
export class WhatsappContactService {
  constructor(private readonly contactRepo: WhatsappContactRepository) {}

  public async getOrCreateContact(msisdn: string): Promise<WhatsappContact> {
    let contact = await this.contactRepo.findOne({ where: { msisdn } });
    if (!contact) {
      contact = await this.contactRepo.save({
        msisdn,
      });
    }
    return contact;
  }

  public async getContactsWithPagination(
    paginationQ: PaginationParamsDto,
    filterQ: WhatsappContactFilterInput,
  ): Promise<BaseApiResponse<WhatsappContactOutputDTO[]>> {
    const options: FindManyOptions<WhatsappContact> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
    };
    const where: FindOptionsWhere<WhatsappContact> = {};
    if (filterQ.name) where.name = Like(`%${filterQ.name}%`);
    if (filterQ.msisdn) where.msisdn = filterQ.msisdn;
    options.where = where;
    const [res, count] = await this.contactRepo.findAndCount(options);
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(WhatsappContactOutputDTO, res);
    return { data, meta };
  }

  public async getContactDetail(id: number): Promise<WhatsappContactOutputDTO> {
    const res = await this.contactRepo.getById(id);
    return plainToInstance(WhatsappContactOutputDTO, res);
  }
}
