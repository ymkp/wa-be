import { Exclude, Expose, Type } from 'class-transformer';
import { UserOutputMini } from 'src/user/dtos/user-output.dto';

@Exclude()
export class WhatsappPublicUsageOutputDTO {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserOutputMini)
  user: UserOutputMini;

  @Expose()
  host: string;

  @Expose()
  url: string;

  @Expose()
  ip: string;

  @Expose()
  referer: string;

  @Expose()
  userAgent: string;

  @Expose()
  createdAt: Date;
}
