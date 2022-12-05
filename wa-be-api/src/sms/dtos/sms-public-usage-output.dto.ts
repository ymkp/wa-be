import { Exclude, Expose, Type } from 'class-transformer';
import { UserOutputMini } from 'src/user/dtos/user-output.dto';

@Exclude()
export class TokenOnlyUserDTO {
  @Expose()
  @Type(() => UserOutputMini)
  user: UserOutputMini;
}

@Exclude()
export class SMSPublicUsageOutputDTO {
  @Expose()
  id: number;

  @Expose()
  @Type(() => TokenOnlyUserDTO)
  token: TokenOnlyUserDTO;

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
