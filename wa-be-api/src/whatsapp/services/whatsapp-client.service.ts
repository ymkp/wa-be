import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  WhatsappClientEntityInput,
  WhatsappClientEntityInterface,
  WhatsappClientIdInput,
  WhatsappClientInputRegister,
  WhatsappClientQRGenerateInput,
  WhatsappWorkerCreateParameter,
} from '../dtos/whatsapp-client-input.dto';
import { WhatsappClientRepository } from '../repositories/whatsapp-client.repository';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as util from 'util';
import { WhatsappClient } from '../entities/whatsapp-client.entity';
import { WhatsappCacheService } from './whatsapp-cache.service';
import { WHATSAPP_CLIENT_STATUS } from '../constants/whatsapp-client-status.constant';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { FindManyOptions } from 'typeorm';
import { PaginationResponseDto } from 'src/shared/dtos/pagination-response.dto';
import { WhatsappClientOutputDTO } from '../dtos/whatsapp-client-output.dto';
import { plainToInstance } from 'class-transformer';
import { WhatsappWorkerService } from './whatsapp-worker.service';
const execAsync = util.promisify(require('child_process').exec);

@Injectable()
export class WhatsappCLientService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly clientRepo: WhatsappClientRepository,
    private readonly configService: ConfigService,
    private readonly cacheService: WhatsappCacheService,
    private readonly workerAPI: WhatsappWorkerService,
  ) {}

  onModuleInit() {
    this.onInit();
  }

  onModuleDestroy() {
    this.onDestroy();
  }

  private async onInit() {
    console.log('WAClient Service onInit called');
    const clients = await this.clientRepo.find();
    if (clients.length > 0) {
      for (let i = 0; i < clients.length; i++) {
        console.log('init : ', clients[i].msisdn);
        await this.buildWAClientFromWorker({
          authBasicPassword: clients[i].secret,
          authBasicUsername: clients[i].msisdn,
          serverPort: clients[i].port,
        });
      }
    } else {
      console.log('there is no registered clients');
    }
  }

  async workerInitFromHook(port: number): Promise<void> {
    console.log('check worker init port : ', port);
    const client = await this.getClientByPORT(port);
    await this.loginAWorkerPrivate(client);
  }

  public async getClientByPORT(port: number): Promise<WhatsappClient> {
    return await this.clientRepo.findOneOrFail({ where: { port } });
  }

  public async checkClientStatus(
    id: number,
    client?: WhatsappClient,
  ): Promise<void> {
    if (!client) {
      client = await this.clientRepo.findOneOrFail({
        where: { id },
        select: ['id', 'msisdn'],
      });
    }
    const c = await this.cacheService.getTokenFromClientId(id);
    try {
      const res = await this.workerAPI.checkClientStatus(c);
      console.log(res.data);
      if (client.status != WHATSAPP_CLIENT_STATUS.ACTIVE) {
        client.status = WHATSAPP_CLIENT_STATUS.ACTIVE;
        await this.clientRepo.save(client);
      }
      return res.data;
    } catch (err) {
      console.log('failed to check client : ', err.response.data);
      if (err.response.data.code === 404) {
        client.status = WHATSAPP_CLIENT_STATUS.LOGGEDOUT;
      } else {
        client.status = WHATSAPP_CLIENT_STATUS.ERROR;
      }
      await this.cacheService.updateClientStatus(client.id, client.status);
      await this.clientRepo.save(client);
    }
  }

  public async getClientsWithPagination(paginationQ: PaginationParamsDto) {
    const options: FindManyOptions<WhatsappClient> = {
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
    const data = plainToInstance(WhatsappClientOutputDTO, res);
    return { data, meta };
  }

  public async checkAndUpdateAllClientStatus() {
    const clients = await this.clientRepo.find({
      select: ['id', 'msisdn'],
    });
    for (let i = 0; i < clients.length; i++) {
      await this.checkClientStatus(clients[i].id, clients[i]);
    }
  }

  private async onDestroy() {
    console.log('WAClient Service onDestroy called');
    // TODO : iplementation
    // ? 1. stop all pm2 with prefix 'waworker'
    // ? 2. delete ${worker_dir}/cmd/!main/ (dirs other than main dir)
    // ? ok
  }

  public async getClientById(id: number): Promise<WhatsappClient> {
    return await this.clientRepo.getById(id);
  }

  public async createWAClient(
    body: WhatsappClientInputRegister,
  ): Promise<void> {
    const secret = this.configService.get('authBasicPassword');
    const last = await this.clientRepo.find({
      order: { id: 'DESC' },
      take: 1,
    });

    const client = await this.clientRepo.save({
      msisdn: body.msisdn,
      name: body.name,
      secret,
      port: last.length > 0 ? last[0].port + 1 : 3010,
    });
    this.buildWAClientFromWorker({
      authBasicPassword: client.secret,
      authBasicUsername: client.msisdn,
      serverPort: client.port,
    });
  }

  public async loginWAWorkerPublic(body: WhatsappClientIdInput): Promise<void> {
    const c = await this.clientRepo.getById(body.id);
    await this.loginAWorkerPrivate(c);
  }

  public async generateQRLogin(
    input: WhatsappClientQRGenerateInput,
  ): Promise<any> {
    const c = await this.cacheService.getTokenFromClientId(input.id);
    try {
      return await this.workerAPI.generateQRLogin(c, input.other);
    } catch (err) {
      console.log('failed to get QR login : ', err.response.data);
      return '';
    }
  }

  // ? ----------------------------PRIVATES

  private async loginAWorkerPrivate(client: WhatsappClient): Promise<void> {
    const url = `${this.configService.get('waWorkerUrl')}:${client.port}`;
    try {
      const token = await this.workerAPI.loginAWorker(
        url,
        client.msisdn,
        client.secret,
      );
      try {
        await this.cacheService.saveTokenForMSISDN(
          client.id,
          client.msisdn,
          token,
          client.port,
        );
        this.cacheService.setNewClient(client.id);
      } catch (err) {
        console.log(
          'failed to save to cache : token-',
          client.msisdn,
          ' : ',
          err,
        );
      }
    } catch (err) {
      console.log('failed to login : ', err);
    }
  }

  private async buildWAClientFromWorker(input: WhatsappWorkerCreateParameter) {
    try {
      const workerDir = this.configService.get('waWorkerDir');
      // ? copy main
      await fs.promises.cp(
        `${workerDir}/cmd/main`,
        `${workerDir}/cmd/${input.authBasicUsername}`,
        { recursive: true },
      );
      const envContent = this.buildEnv(input);
      await execAsync(
        `echo "${envContent}" > ${workerDir}/cmd/${input.authBasicUsername}/.env`,
      );
      const pm2JsonContent = this.buildPM2Json(input);
      await execAsync(
        `echo '${pm2JsonContent}' > ${workerDir}/cmd/${input.authBasicUsername}/run.json`,
      );
      console.log('build .go');
      await execAsync(
        `cd ${workerDir}/cmd/${input.authBasicUsername} && go build && pm2 start run.json`,
      );
      console.log('success');
    } catch (err) {
      console.log(err);
    }
  }

  private buildEnv(input: WhatsappWorkerCreateParameter): string {
    const beApiHookURL =
      this.configService.get('url') +
      ':' +
      this.configService.get('port') +
      this.configService.get('prefix') +
      '/whatsapp-hook';
    return `
    SERVER_PORT=${input.serverPort}
    AUTH_BASIC_USERNAME=${input.authBasicUsername}
    AUTH_BASIC_PASSWORD=${input.authBasicPassword}
    AUTH_JWT_SECRET=9e4eb4cf-be25-4a29-bba3-fefb5a30f6ab
    AUTH_JWT_EXPIRED_HOUR=0
    WHATSAPP_DATASTORE_TYPE=sqlite
    WHATSAPP_DATASTORE_URI=file:dbs/wa.db?_foreign_keys=on
    WHATSAPP_MEDIA_IMAGE_COMPRESSION=true
    WHATSAPP_MEDIA_IMAGE_CONVERT_WEBP=true
    LIBWEBP_VERSION=0.6.1
    BE_API_HOOK_URL=${beApiHookURL}
    WHATSAPP_PROP_TITLE=${this.configService.get('waWorkerTitle')}
    `;
  }

  private buildPM2Json(input: WhatsappWorkerCreateParameter): string {
    return `{\"name\": \"waworker-${input.serverPort}\",\"script\": \"./${input.authBasicUsername}\"}`;
  }
}
