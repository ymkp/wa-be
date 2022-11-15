import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SMSClientRegisterInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  msisdn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
