import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class SMSClientAccessTokenClaims {
  @Expose()
  id: number;
}

export class SMSClientRefreshTokenClaims {
  id: number;
}

@Exclude()
export class SMSClientOutputDTO {
  @Expose()
  @ApiProperty()
  id: number;
}
