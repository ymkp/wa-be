import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { SMSPublicTokenRepository } from '../repositories/sms-public-token.repository';
import { SMSPublicUsageRepository } from '../repositories/sms-public-usage.repository';

@Injectable()
export class SMSPublicService {
  constructor(
    private readonly smsPublicUsageRepo: SMSPublicUsageRepository,
    private readonly smsPublicTokenRepo: SMSPublicTokenRepository,
  ) {}

  public async sendSMS() {}

  public async getSMSs() {}

  public async validateTokenAndRecordUsage(
    ctx: RequestContext,
  ): Promise<boolean> {
    const token = await this.smsPublicTokenRepo.findOne({
      where: {
        userId: ctx.user.id,
        secret: ctx.user.other as string,
      },
    });
    if (token) {
      await this.smsPublicUsageRepo.save({
        tokenId: token.id,
        userAgent: ctx.userAgent,
        referer: ctx.referer,
        ip: ctx.ip,
        host: ctx.host,
      });
      return true;
    } else {
      throw new BadRequestException('Token tidak valid atau sudah tidak aktif');
    }
  }

  // ? -------------------privates

  private async checkContext() {}
}
