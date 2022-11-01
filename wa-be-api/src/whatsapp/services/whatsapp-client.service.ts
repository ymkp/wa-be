import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
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
import { plainToInstance } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import { WhatsappClient } from '../entities/whatsapp-client.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WA_WORKER_AUTH } from '../constants/whatsapp-client-url.constants';
const execAsync = util.promisify(require('child_process').exec);

@Injectable()
export class WhatsappCLientService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
    private readonly waClientRepo: WhatsappClientRepository,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    // TODO : implementation
    // ? 1 . load all clients
    // ? 1.1 - build all client with new credential
    // ? 1.2 - login all client with new credential
  }

  private async onDestroy() {
    console.log('WAClient Service onDestroy called');
    // TODO : iplementation
    // ? 1. stop all pm2 with prefix 'waworker'
    // ? 2. delete ${worker_dir}/cmd/!main/ (dirs other than main dir)
    // ? ok
  }

  public async getClientById(id: number): Promise<WhatsappClient> {
    return await this.waClientRepo.getById(id);
  }

  public async createWAClient(
    body: WhatsappClientInputRegister,
  ): Promise<void> {
    const secret = this.configService.get('authBasicPassword');
    const last = await this.waClientRepo.find({
      order: { id: 'DESC' },
      take: 1,
    });

    const client = await this.waClientRepo.save({
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

  public async loginWAWorker(body: WhatsappClientEntityInput): Promise<void> {
    const c = await this.waClientRepo.getById(body.id);
    console.log(c.msisdn);
    const url = `${this.workerURL}:${c.port}`;
    console.log(`${url}${WA_WORKER_AUTH}`);

    const res = await firstValueFrom(
      this.httpService.get(`${url}${WA_WORKER_AUTH}`, {
        auth: { username: c.msisdn, password: c.secret },
      }),
    );
    console.log(res.data);
  }

  // public async testCopy() {
  //   await this.buildWAClientFromWorker({
  //     authBasicUsername: '6281381782310',
  //     authBasicPassword: '83e4060e-78e1-4fe5-9977-aeeccd46a2b8',
  //     serverPort: 3000,
  //   });
  // }

  public async generateToken(
    input: WhatsappClientEntityInput,
  ): Promise<AuthTokenOutput> {
    const client = await this.waClientRepo.findOneOrFail({
      where: { id: input.id },
    });
    return this.generateTokenWorker({
      id: client.id,
      msisdn: client.msisdn,
      secret: client.secret,
    });
  }

  public async testCopy2() {
    const workerDir = this.configService.get('waWorkerDir');

    const pm2JsonContent = this.buildPM2Json({
      authBasicUsername: '6281381782310',
      authBasicPassword: '83e4060e-78e1-4fe5-9977-aeeccd46a2b8',
      serverPort: 3000,
    });
    await execAsync(
      `echo "${pm2JsonContent}" > ${workerDir}/cmd/6281381782310/run.json`,
    );
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
