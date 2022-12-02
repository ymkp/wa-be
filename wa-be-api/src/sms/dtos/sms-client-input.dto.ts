import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SMSClientRegisterInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  msisdn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;
}

export class SMSClientEditNameInput {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
