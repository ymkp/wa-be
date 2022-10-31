import { Injectable } from '@nestjs/common';
import {
  WhatsappClientInputRegister,
  WhatsappWorkerCreateParameter,
} from '../dtos/whatsapp-client-input.dto';
import { WhatsappClientRepository } from '../repositories/whatsapp-client.repository';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as util from 'util';
const execAsync = util.promisify(require('child_process').exec);

@Injectable()
export class WhatsappCLientService {
  constructor(
    private readonly configService: ConfigService,
    private readonly waClientRepo: WhatsappClientRepository,
  ) {}

  public async createWAClient(
    body: WhatsappClientInputRegister,
  ): Promise<void> {
    const secret = this.configService.get('authBasicPassword');
    const last = await this.waClientRepo.findOne({ order: { id: 'DESC' } });

    const client = await this.waClientRepo.save({
      msisdn: body.msisdn,
      name: body.name,
      secret,
      port: last ? last.port + 1 : 3010,
    });
    // this.buildWAClientFromWorker({
    //   authBasicPassword: client.secret,
    //   authBasicUsername: client.msisdn,
    //   serverPort: client.port,
    // });
  }

  public async testCopy() {
    await this.buildWAClientFromWorker({
      authBasicUsername: '6281381782310',
      authBasicPassword: '83e4060e-78e1-4fe5-9977-aeeccd46a2b8',
      serverPort: 3000,
    });
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
        `echo "${pm2JsonContent}" > ${workerDir}/cmd/${input.authBasicUsername}/run.json`,
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
}
