import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { WhatsappCacheInfo } from '../dtos/whatsapp-cache.interface';
import { WhatsappClientEntityInput } from '../dtos/whatsapp-client-input.dto';
import { WhatsappClientRepository } from '../repositories/whatsapp-client.repository';

@Injectable()
export class WhatsappCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly clientRepo: WhatsappClientRepository,
  ) {
    this.workerURL = this.configService.get('waWorkerUrl');
  }

  workerURL = '';

  public async saveTokenForMSISDN(
    clientId: number,
    msisdn: string,
    token: string,
    port: number,
  ) {
    await this.cacheManager.set(`msisdn-${clientId}`, msisdn, 0);
    await this.cacheManager.set(`token-${msisdn}`, token);
    await this.cacheManager.set(`port-${msisdn}`, port, 0);
  }

  public async getTokenForMSISDN(msisdn: string): Promise<WhatsappCacheInfo> {
    const token = await this.cacheManager.get<string>(`token-${msisdn}`);
    const port = await this.cacheManager.get<number>(`port-${msisdn}`);
    const fullUrl = `${this.workerURL}:${port}`;
    return { token, port, url: this.workerURL, fullUrl };
  }

  public async getTokenFromClientInput(
    input: WhatsappClientEntityInput,
  ): Promise<WhatsappCacheInfo> {
    let msisdn = input.msisdn;
    if (!msisdn) {
      console.log('msisdn not found in input, getting from DB');
      const client = await this.clientRepo.getById(input.id);
      msisdn = client.msisdn;
    }
    return await this.getTokenForMSISDN(msisdn);
  }

  public async getTokenFromClientId(id: number): Promise<WhatsappCacheInfo> {
    const msisdn = await this.cacheManager.get<string>(`msisdn-${id}`);
    return await this.getTokenForMSISDN(msisdn);
  }
}
