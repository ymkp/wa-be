import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { compare, hash } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { FindManyOptions, In } from 'typeorm';
import { SMS_CLIENT_STATUS } from '../constants/sms-client-status.const';
import {
  SMSClientEditNameInput,
  SMSClientRegisterInput,
} from '../dtos/sms-client-input.dto';
import {
  SMSClientOutputDetailDTO,
  SMSClientOutputDTO,
} from '../dtos/sms-client-output.dto';
import { SMSClient } from '../entities/sms-client.entity';
import { SMSEventsGateway } from '../gateways/sms-events.gateway';
import { SMSClientRepository } from '../repositories/sms-client.repository';

@Injectable()
export class SMSClientService {
  constructor(
    private readonly clientRepo: SMSClientRepository,
    private readonly smsGW: SMSEventsGateway,
  ) {}

  private availablePhoneIDS: number[] = [0];

  async validateMSISDNPassword(
    msisdn: string,
    password: string,
  ): Promise<SMSClientOutputDTO> {
    console.log('validateMSISDNPassword', msisdn, password);
    const client = await this.clientRepo.findOne({
      where: { msisdn },
    });
    if (!client) throw new UnauthorizedException();
    console.log(client);
    const match = await compare(password, client.password);
    if (!match) throw new UnauthorizedException();
    return plainToInstance(SMSClientOutputDTO, client);
  }

  async createSMSClient(
    input: SMSClientRegisterInput,
  ): Promise<SMSClientOutputDTO> {
    const client = plainToInstance(SMSClient, input);
    client.password = await hash(input.password, 10);
    await this.clientRepo.save(client);
    return plainToInstance(SMSClientOutputDTO, client);
  }

  async editSMSClient(
    input: SMSClientEditNameInput,
  ): Promise<SMSClientOutputDTO> {
    const c = await this.clientRepo.getById(input.id);
    c.name = input.name;
    await this.clientRepo.save(c);
    return plainToInstance(SMSClientOutputDTO, c);
  }

  async getMe(ctx: RequestContext): Promise<SMSClientOutputDTO> {
    const c = await this.clientRepo.findOne({
      where: { id: ctx.user.id },
      select: ['id', 'name', 'msisdn'],
    });
    return c;
  }

  public async getClientDetail(id: number): Promise<SMSClientOutputDetailDTO> {
    const c = await this.clientRepo.findOne({
      where: { id },
      relations: ['permittedUsers'],
    });
    return plainToInstance(SMSClientOutputDetailDTO, c);
  }

  public async getClient(id?: number): Promise<SMSClient> {
    let client: SMSClient;
    if (id) {
      if (this.availablePhoneIDS.includes(id)) {
        client = await this.clientRepo.getById(id);
      } else {
        throw new BadRequestException('Client sedang tidak bisa dipakai');
      }
    } else {
      const tmpId =
        this.availablePhoneIDS[
          Math.floor(Math.random() * this.availablePhoneIDS.length)
        ];
      client = await this.clientRepo.getById(tmpId);
    }
    return client;
  }

  public async getClientsWithPagination(
    paginationQ: PaginationParamsDto,
  ): Promise<BaseApiResponse<SMSClientOutputDTO[]>> {
    const options: FindManyOptions<SMSClient> = {
      take: paginationQ.limit,
      skip: (paginationQ.page - 1) * paginationQ.limit,
      order: { id: 'DESC' },
    };
    const [res, count] = await this.clientRepo.findAndCount(options);
    const meta: PaginationResponseDto = {
      count,
      page: paginationQ.page,
      maxPage: Math.ceil(count / paginationQ.limit),
    };
    const data = plainToInstance(SMSClientOutputDTO, res);
    return { data, meta };
  }

  public async getAvailableClients(): Promise<SMSClientOutputDTO[]> {
    // const ids = this.smsGW.getAvailableCLients();
    const clients = await this.clientRepo.find({
      where: { id: In(this.availablePhoneIDS) },
    });
    return plainToInstance(SMSClientOutputDTO, clients);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async checkAndUpdateClientStatus() {
    const ids = this.smsGW.getAvailableCLients();
    if (
      ids.length === this.availablePhoneIDS.length &&
      ids.every((value, index) => value === this.availablePhoneIDS[index])
    ) {
      console.log('sms client cache check : equal');
    } else {
      console.log('sms client cache check : NOT EQUAL');
      const clients = await this.clientRepo.find();
      if (clients.length > 0) {
        clients.forEach((c) => {
          if (ids.includes(c.id)) {
            c.status = SMS_CLIENT_STATUS.ONLINE;
            c.isActive = true;
          } else {
            c.status = SMS_CLIENT_STATUS.OFFLINE;
            c.isActive = false;
          }
        });
        await this.clientRepo.save(clients);
      }
      this.availablePhoneIDS = ids;
    }
  }
}
