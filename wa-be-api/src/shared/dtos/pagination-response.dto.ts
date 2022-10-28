import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PaginationResponseDto {
  @Expose()
  @ApiProperty()
  page: number;

  @Expose()
  @ApiProperty()
  maxPage: number;

  @Expose()
  @ApiProperty()
  count: number;
}
