import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWhatsappMessageInput {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  clientId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contactMsisdn: string;
}

export class WhatsappMessageFilterInput {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  clientId: number;
}

export class WhatsappTestMessageTextInput {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  nOfTimes: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  seed: string;
}
