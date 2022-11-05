import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { WHATSAPP_MESSAGE_QUEUE_STATUS } from '../constants/whatsapp-message-queue-status.constants';

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

  @ApiPropertyOptional()
  @IsEnum(WHATSAPP_MESSAGE_QUEUE_STATUS)
  @IsOptional()
  status: WHATSAPP_MESSAGE_QUEUE_STATUS;
}

export class WhatsappTestMessageTextInput {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  nOfTimes: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  seed: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  msisdn: string;
}
