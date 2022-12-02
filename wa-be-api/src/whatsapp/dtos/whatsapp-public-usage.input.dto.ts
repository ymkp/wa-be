import { ParseIntPipe } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class WHatsappPublicUsageFilterQ {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  userId: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  lastDate: number;
}

export class WhatsappPublicUsageGetterQ {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isUser: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isHost: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isURL: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isIP: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isReferer: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isUserAgent: boolean = true;
}
