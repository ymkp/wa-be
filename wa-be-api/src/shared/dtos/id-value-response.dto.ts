import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class IdValNumberDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  value: number;
}

@Exclude()
export class IdNameStringDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;
}
