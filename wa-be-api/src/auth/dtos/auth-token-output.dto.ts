import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthTokenOutput {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;
}

export class UserAccessTokenClaims {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  other?: string | number[];

  @Expose()
  type?: string;

  @Expose()
  terumbuKarang?: boolean;
}

export class UserRefreshTokenClaims {
  id: number;
}
