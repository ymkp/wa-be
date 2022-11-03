import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { WHATSAPP_CLIENT_STATUS } from '../constants/whatsapp-client-status.constants';
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
    await this.cacheManager.set(`id-${msisdn}`, clientId, 0);
    await this.cacheManager.set(
      `c-${clientId}`,
      {
        clientId,
        msisdn,
        token,
        fullUrl: `${this.workerURL}:${port}`,
        status: WHATSAPP_CLIENT_STATUS.ACTIVE,
      },
      0,
    );
  }

  public async getTokenForMSISDN(msisdn: string): Promise<WhatsappCacheInfo> {
    const id = await this.cacheManager.get<number>(`id-${msisdn}`);
    if (!id) throw new NotFoundException('MSISDN tidak terdaftar di cache');
    return await this.getTokenFromClientId(id);
  }

  public async getTokenFromClientInput(
    input: WhatsappClientEntityInput,
  ): Promise<WhatsappCacheInfo> {
    let msisdn = input.msisdn;
    // if (!msisdn) {
    //   console.log('msisdn not found in input, getting from DB');
    //   const client = await this.clientRepo.getById(input.id);
    //   msisdn = client.msisdn;
    // }
    // return await this.getTokenForMSISDN(msisdn);
    return await this.getTokenFromClientId(input.id);
  }

  public async getTokenFromClientId(id: number): Promise<WhatsappCacheInfo> {
    const cache = await this.cacheManager.get<WhatsappCacheInfo>(`c-${id}`);
    const status = await this.cacheManager.get<WHATSAPP_CLIENT_STATUS>(
      `status-${id}`,
    );
    cache.status = status;
    return cache;
  }

  public async updateClientStatus(id: number, status: WHATSAPP_CLIENT_STATUS) {
    await this.cacheManager.set(`status-${id}`, status, 0);
  }

  public async setNewClient(id: number) {
    const clientIds = await this.getClients();
    clientIds.push(id);
    const ids = [...new Set(clientIds)];
    await this.cacheManager.set('clients', ids);
  }

  public async getClients(): Promise<number[]> {
    return (await this.cacheManager.get<number[]>('clients')) ?? [];
  }
}
