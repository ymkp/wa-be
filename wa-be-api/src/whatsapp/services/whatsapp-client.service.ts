import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  WhatsappClientEntityInput,
  WhatsappClientEntityInterface,
  WhatsappClientInputRegister,
  WhatsappWorkerCreateParameter,
} from '../dtos/whatsapp-client-input.dto';
import { WhatsappClientRepository } from '../repositories/whatsapp-client.repository';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as util from 'util';
import { AuthTokenOutput } from 'src/auth/dtos/auth-token-output.dto';
import { JwtService } from '@nestjs/jwt';
import { WhatsappClient } from '../entities/whatsapp-client.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  WA_WORKER_AUTH,
  WA_WORKER_LOGIN,
} from '../constants/whatsapp-client-url.constants';
import { WhatsappWorkerResponseDTO } from '../dtos/whatsapp-worker.dto';
import { WhatsappCacheService } from './whatsapp-cache.service';
const execAsync = util.promisify(require('child_process').exec);

@Injectable()
export class WhatsappCLientService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
    private readonly clientRepo: WhatsappClientRepository,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly cacheService: WhatsappCacheService,
  ) {
    this.workerURL = this.configService.get('waWorkerUrl');
  }

  onModuleInit() {
    this.onInit();
  }

  onModuleDestroy() {
    this.onDestroy();
  }

  private workerURL: string;

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
      console.log('wait 9 secs');
      await new Promise((r) => setTimeout(r, 9000));
      for (let i = 0; i < clients.length; i++) {
        await this.loginAWorkerPrivate(clients[i]);
      }
    } else {
      console.log('there is no registered clients');
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

  public async loginWAWorkerPublic(
    body: WhatsappClientEntityInput,
  ): Promise<void> {
    const c = await this.clientRepo.getById(body.id);
    await this.loginAWorkerPrivate(c);
  }

  public async generateToken(
    input: WhatsappClientEntityInput,
  ): Promise<AuthTokenOutput> {
    const client = await this.clientRepo.findOneOrFail({
      where: { id: input.id },
    });
    return this.generateTokenWorker({
      id: client.id,
      msisdn: client.msisdn,
      secret: client.secret,
    });
  }

  public async generateQRLogin(input: WhatsappClientEntityInput): Promise<any> {
    const c = await this.cacheService.getTokenFromClientInput(input);
    const url = `${this.workerURL}:${c.port}`;

    try {
      const res = await firstValueFrom(
        this.httpService.post<any>(
          `${url}${WA_WORKER_LOGIN}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${c.token}`,
            },
          },
        ),
      );
      return res.data;
    } catch (err) {
      console.log('failed to get QR login : ');
      return '';
    }
  }

  // ? ----------------------------PRIVATES

  private async loginAWorkerPrivate(client: WhatsappClient): Promise<void> {
    const url = `${this.workerURL}:${client.port}`;
    try {
      console.log(`try : ${url}${WA_WORKER_AUTH}`);
      const res = await firstValueFrom(
        this.httpService.get<WhatsappWorkerResponseDTO<{ token: string }>>(
          `${url}${WA_WORKER_AUTH}`,
          {
            auth: { username: client.msisdn, password: client.secret },
          },
        ),
      );
      try {
        await this.cacheService.saveTokenForMSISDN(
          client.msisdn,
          res.data.data.token,
          client.port,
        );
      } catch (err) {
        console.log(
          'failed to save to cache : token-',
          client.msisdn,
          ' : ',
          err,
        );
      }
    } catch (err) {
      console.log('failed to login : ');
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
    `;
  }

  private buildPM2Json(input: WhatsappWorkerCreateParameter): string {
    return `{\"name\": \"waworker-${input.serverPort}\",\"script\": \"./${input.authBasicUsername}\"}`;
  }

  private generateTokenWorker(
    input: WhatsappClientEntityInterface,
  ): AuthTokenOutput {
    const subject = { sub: input.id };
    const payload = {
      username: input.msisdn,
      sub: input.id,
      other: input.secret,
      type: 'wa-client',
    };
    const authToken = {
      refreshToken: this.jwtService.sign(subject, {
        expiresIn: this.configService.get('jwt.refreshTokenExpiresInSec'),
      }),
      accessToken: this.jwtService.sign(
        { ...payload, ...subject },
        {
          expiresIn: this.configService.get('jwt.accessTokenExpiresInSec'),
        },
      ),
    };
    return authToken;
  }
}
