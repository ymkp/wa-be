import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchQuery {
  @ApiPropertyOptional()
  @IsOptional()
  search: string;
}
