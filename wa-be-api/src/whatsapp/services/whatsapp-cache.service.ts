import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { WhatsappClientEntityInput } from '../dtos/whatsapp-client-input.dto';
import { WhatsappClientRepository } from '../repositories/whatsapp-client.repository';

@Injectable()
export class WhatsappCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly clientRepo: WhatsappClientRepository,
  ) {}

  public async saveTokenForMSISDN(msisdn: string, token: string, port: number) {
    await this.cacheManager.set(`token-${msisdn}`, token);
    await this.cacheManager.set(`port-${msisdn}`, port, 0);
  }

  public async getTokenForMSISDN(msisdn: string): Promise<{
    token: string;
    port: number;
  }> {
    const token = await this.cacheManager.get<string>(`token-${msisdn}`);
    const port = await this.cacheManager.get<number>(`port-${msisdn}`);
    return { token, port };
  }

  public async getTokenFromClientInput(
    input: WhatsappClientEntityInput,
  ): Promise<{
    token: string;
    port: number;
  }> {
    let msisdn = input.msisdn;
    if (!msisdn) {
      console.log('msisdn not found in input, getting from DB');
      const client = await this.clientRepo.getById(input.id);
      msisdn = client.msisdn;
    }
    return await this.getTokenForMSISDN(msisdn);
  }
}
