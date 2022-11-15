import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-local';

import { createRequestContext } from '../../shared/request-context/util';
import { STRATEGY_LOCAL } from '../constants/strategy.constant';
import { SMSClientAccessTokenClaims } from '../dtos/sms-client-output.dto';
import { SMSAuthService } from '../services/sms-auth.service';

@Injectable()
export class SMSClientLocalStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_LOCAL,
) {
  constructor(private authService: SMSAuthService) {
    console.log('init auth service sms?');
    // Add option passReqToCallback: true to configure strategy to be request-scoped.
    super({
      usernameField: 'msisdn',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    username: string,
    password: string,
  ): Promise<SMSClientAccessTokenClaims> {
    console.log(request, username, password);
    const ctx = createRequestContext(request);
    const client = await this.authService.validateSMSClient(username, password);
    return client;
  }
}
