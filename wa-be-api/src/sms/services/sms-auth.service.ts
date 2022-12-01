import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { AuthTokenOutput } from 'src/auth/dtos/auth-token-output.dto';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { EncryptService } from 'src/shared/signing/encrypt.service';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';
import { SMSClientRegisterInput } from '../dtos/sms-client-input.dto';
import { SMSEventsGateway } from '../gateways/sms-events.gateway';
import { SMSClientService } from './sms-client.service';

@Injectable()
export class SMSAuthService {
  constructor(
    private readonly signService: JwtSigningService,
    // private readonly configService: ConfigService,
    private readonly enc: EncryptService,
    private readonly clientService: SMSClientService,
    private readonly gw: SMSEventsGateway,
  ) {}
  public async validateSMSClient(msisdn: string, password: string) {
    console.log('validate sms client : ', msisdn, password);
    return this.clientService.validateMSISDNPassword(msisdn, password);
  }

  public async testMessage(message: string): Promise<string> {
    const msg = await this.enc.encryptString(message);
    console.log({ msg });
    this.gw.broadcastMessage(msg);
    return msg;
  }

  public async decryptMsg(message: string): Promise<string> {
    const msg = await this.enc.decryptString(message);
    console.log({ msg });
    this.gw.broadcastMessage(msg);
    return msg;
  }

  public async login(
    ctx: RequestContext,
    input: SMSClientRegisterInput,
  ): Promise<AuthTokenOutput> {
    const user = await this.clientService.validateMSISDNPassword(
      input.msisdn,
      input.password,
    );
    return this.getAuthToken(user.id);
  }

  logout() {}

  refreshToken() {}

  getAuthToken(id: number): AuthTokenOutput {
    const subject = { sub: 0, clientId: id };
    const authToken = {
      refreshToken: '',
      accessToken: this.signService.signPayload(
        // { ...payload, ...subject },
        subject,
        // {
        //   expiresIn: this.configService.get('jwt.accessTokenExpiresInSec'),
        // },
      ),
    };
    return plainToInstance(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true,
    });
  }
}
