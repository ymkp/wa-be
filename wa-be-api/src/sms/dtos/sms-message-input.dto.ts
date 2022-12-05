import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SMS_DELIVERY_STATUS } from '../constants/sms-message-status.const';

export class SMSMessageCreateInputDTO {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  clientId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to: string;
}

export class SMSMessageFilterQ {
  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsOptional()
  clientId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsOptional()
  contactId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsOptional()
  createdById: number;

  @ApiPropertyOptional({
    enum: SMS_DELIVERY_STATUS,
    example: SMS_DELIVERY_STATUS.ONQUEUE,
  })
  @IsEnum(SMS_DELIVERY_STATUS)
  @IsOptional()
  status: SMS_DELIVERY_STATUS;
}

export class SMSMessageFilterForWorkerQ {
  @ApiPropertyOptional()
  @IsEnum(SMS_DELIVERY_STATUS)
  @IsOptional()
  status: SMS_DELIVERY_STATUS;
}
