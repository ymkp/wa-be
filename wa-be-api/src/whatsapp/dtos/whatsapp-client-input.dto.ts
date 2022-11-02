import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class WhatsappClientInputRegister {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  msisdn: string;
}

export interface WhatsappWorkerCreateParameter {
  serverPort: number;
  authBasicUsername: string;
  authBasicPassword: string;
}

export interface WhatsappClientEntityInterface {
  id: number;
  msisdn: string;
  secret: string;
}

export class WhatsappClientEntityInput {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  msisdn: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  port: number;
}

export class WhatsappClientIdInput {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class WhatsappClientQRGenerateInput {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  other: string;
}
