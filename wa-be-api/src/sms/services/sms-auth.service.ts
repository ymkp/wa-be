import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { AuthTokenOutput } from 'src/auth/dtos/auth-token-output.dto';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';
import { SMSClientRegisterInput } from '../dtos/sms-client-input.dto';
import { SMSClientService } from './sms-client.service';

@Injectable()
export class SMSAuthService {
  constructor(
    private readonly signService: JwtSigningService,
    private readonly configService: ConfigService,
    private readonly clientService: SMSClientService,
  ) {}
  public async validateSMSClient(msisdn: string, password: string) {
    console.log('validate sms client : ', msisdn, password);
    return this.clientService.validateMSISDNPassword(msisdn, password);
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

  public async register(input: SMSClientRegisterInput) {
    await this.clientService.createSMSClient(input);
  }

  refreshToken() {}

  getAuthToken(id: number): AuthTokenOutput {
    const subject = { sub: id };
    const payload = {
      sub: id,
    };
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
