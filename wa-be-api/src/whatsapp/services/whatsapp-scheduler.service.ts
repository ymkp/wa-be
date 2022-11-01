import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class WHatsappSchedulerService {
  constructor() {}

  // @Cron('55 * * * * *', {
  //   name: 'wut?',
  // })
  private async insertCronHere() {}
}
