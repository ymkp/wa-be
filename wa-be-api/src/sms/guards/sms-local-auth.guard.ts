import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { STRATEGY_LOCAL } from '../constants/strategy.constant';

@Injectable()
export class SMSLocalAuthGuard extends AuthGuard(STRATEGY_LOCAL) {}
