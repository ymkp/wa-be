import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HookWorkerInitDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  port: string;
}

export class HookReceivedMessageDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  port: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contact: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  message: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mediaType: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFromMe: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFromGroup: boolean;
}
