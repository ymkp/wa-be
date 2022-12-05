import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class SMSPublicUsageFilterQ {
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

export class SMSPublicUsageGetterQ {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  isUser: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  isHost: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  isURL: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  isIP: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  isReferer: boolean = true;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  isUserAgent: boolean = true;
}
