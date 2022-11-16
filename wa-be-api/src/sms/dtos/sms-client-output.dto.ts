import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export class SMSClientSendMessageDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  senderId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}
