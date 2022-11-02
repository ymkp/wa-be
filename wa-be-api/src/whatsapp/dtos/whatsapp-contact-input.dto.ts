import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WhatsappContactFilterInput {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  msisdn: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;
}
