import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  WhatsappClientChangeNameInput,
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
import { BaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
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
    const clients = await this.clientRepo.find({ where: { isActive: true } });
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
      console.log('there is no active clients');
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
      if (client.status != WHATSAPP_CLIENT_STATUS.ACTIVE) {
        client.status = WHATSAPP_CLIENT_STATUS.ACTIVE;
        await this.clientRepo.save(client);
      }
      return res.data;
    } catch (err) {
      try {
        if (err.response.data.code === 404) {
          client.status = WHATSAPP_CLIENT_STATUS.LOGGEDOUT;
        } else {
          client.status = WHATSAPP_CLIENT_STATUS.ERROR;
        }
        await this.cacheService.updateClientStatus(client.id, client.status);
        await this.clientRepo.save(client);
      } catch (err) {}
    }
  }

  public async freezeAClient(id: number): Promise<WhatsappClientOutputDTO> {
    const client = await this.clientRepo.getById(id);
    client.isActive = false;
    client.status = WHATSAPP_CLIENT_STATUS.STOPPED;
    await this.clientRepo.save(client);
    await this.stopAndDeleteAWorker(client);
    await this.cacheService.deactiveAClient(id);
    return plainToInstance(WhatsappClientOutputDTO, client);
  }

  public async restoreAClient(id: number): Promise<WhatsappClientOutputDTO> {
    const client = await this.clientRepo.getById(id);
    client.isActive = true;
    await this.clientRepo.save(client);
    await this.buildWAClientFromWorker({
      authBasicPassword: client.secret,
      authBasicUsername: client.msisdn,
      serverPort: client.port,
    });
    return plainToInstance(WhatsappClientOutputDTO, client);
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
      where: { isActive: true },
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

  public async getClientDetail(id: number): Promise<WhatsappClientOutputDTO> {
    const c = await this.clientRepo.findOne({
      where: { id },
      relations: ['permittedUsers'],
    });
    return plainToInstance(WhatsappClientOutputDTO, c);
  }

  public async getClientById(id: number): Promise<WhatsappClient> {
    return await this.clientRepo.getById(id);
  }

  public async createWAClient(
    body: WhatsappClientInputRegister,
  ): Promise<WhatsappClientOutputDTO> {
    // ? check ada yg pernah dihapus?
    const checkClient = await this.clientRepo.findOne({
      where: {
        msisdn: body.msisdn,
      },
    });

    if (checkClient) throw new BadRequestException('nomor sudah terpakai');

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
    await this.buildWAClientFromWorker({
      authBasicPassword: client.secret,
      authBasicUsername: client.msisdn,
      serverPort: client.port,
    });
    return plainToInstance(WhatsappClientOutputDTO, client);
  }

  public async editWaClientName(
    input: WhatsappClientChangeNameInput,
  ): Promise<WhatsappClientOutputDTO> {
    const c = await this.clientRepo.findOne({
      where: { id: input.id },
    });
    if (c) {
      c.name = input.name;
      await this.clientRepo.save(c);
      return plainToInstance(WhatsappClientOutputDTO, c);
    } else {
      throw new NotFoundException('Client tidak ditemukan');
    }
  }

  public async loginWAWorkerPublic(body: WhatsappClientIdInput): Promise<void> {
    const c = await this.clientRepo.getById(body.id);
    if (c.isActive) {
      await this.loginAWorkerPrivate(c);
    } else {
      // TODO : what to do?
    }
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

  private async stopAndDeleteAWorker(client: WhatsappClient): Promise<void> {
    try {
      const workerDir = this.configService.get('waWorkerDir');
      console.log('get worker dir : ', workerDir);
      await execAsync(`pm2 stop waworker-${client.port}`);
      console.log('exec : ', `pm2 stop waworker-${client.port}`);
      await execAsync(`pm2 delete waworker-${client.port}`);
      console.log('exec : ', `pm2 delete waworker-${client.port}`);
      await execAsync(`rm -rf ${workerDir}/cmd/${client.msisdn}`);
      console.log('exec : ', `rm -rf ${workerDir}/cmd/${client.msisdn}`);
    } catch (err) {
      console.error('failed to exec stopAndDeleteAWorker : ', err);
    }
  }

  private async loginAWorkerPrivate(client: WhatsappClient): Promise<void> {
    const url = `${this.configService.get('waWorkerUrl')}:${client.port}`;
    try {
      const token = await this.workerAPI.loginAWorker(
        url,
        client.msisdn,
        client.secret,
      );
      if (token) {
        await this.clientRepo.update(client.id, {
          status: WHATSAPP_CLIENT_STATUS.NEEDQR,
        });
      } else {
        console.log(url, 'token tidak ada?');
      }
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
      console.log('get workerDir', workerDir);
      // ? copy main
      await fs.promises.cp(
        `${workerDir}/cmd/main`,
        `${workerDir}/cmd/${input.authBasicUsername}`,
        { recursive: true },
      );
      console.log(
        'exec copy : ',
        `${workerDir}/cmd/main`,
        `${workerDir}/cmd/${input.authBasicUsername}`,
      );

      const envContent = this.buildEnv(input);
      await execAsync(
        `echo "${envContent}" > ${workerDir}/cmd/${input.authBasicUsername}/.env`,
      );
      console.log(
        'exec echo : ',
        `echo "${envContent}" > ${workerDir}/cmd/${input.authBasicUsername}/.env`,
      );
      const pm2JsonContent = this.buildPM2Json(input);
      await execAsync(
        `echo '${pm2JsonContent}' > ${workerDir}/cmd/${input.authBasicUsername}/run.json`,
      );
      console.log(
        'exec echo : ',
        `echo '${pm2JsonContent}' > ${workerDir}/cmd/${input.authBasicUsername}/run.json`,
      );
      console.log('build .go');
      await execAsync(
        `cd ${workerDir}/cmd/${input.authBasicUsername} && go build && pm2 start run.json`,
      );
      console.log(
        'exec  : ',
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
      // ':' +
      // this.configService.get('port') +
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
