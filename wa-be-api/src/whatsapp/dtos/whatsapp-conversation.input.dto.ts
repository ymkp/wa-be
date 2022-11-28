import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class WhatsappConversationFilterInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientMsisdn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  clientId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactMsisdn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  contactId: number;
}
