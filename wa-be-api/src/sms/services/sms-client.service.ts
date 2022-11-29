import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { SMSClientRegisterInput } from '../dtos/sms-client-input.dto';
import { SMSClientOutputDTO } from '../dtos/sms-client-output.dto';
import { SMSClient } from '../entities/sms-client.entity';
import { SMSClientRepository } from '../repositories/sms-client.repository';

@Injectable()
export class SMSClientService {
  constructor(private readonly clientRepo: SMSClientRepository) {}

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

  async createSMSClient(input: SMSClientRegisterInput) {
    const client = plainToInstance(SMSClient, input);
    client.password = await hash(input.password, 10);
    await this.clientRepo.save(client);
  }

  async getMe(ctx: RequestContext): Promise<SMSClientOutputDTO> {
    const c = await this.clientRepo.findOne({
      where: { id: ctx.user.id },
      select: ['id', 'name', 'msisdn'],
    });
    return c;
  }

  public async getClient(id?: number): Promise<SMSClient> {
    let client: SMSClient;
    if (id) {
      client = await this.clientRepo.getById(id);
    } else {
      // FIXME : get random active client
    }
    return client;
  }
}
