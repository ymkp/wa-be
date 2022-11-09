import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class WhatsappConversationFilterInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientMsisdn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
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
