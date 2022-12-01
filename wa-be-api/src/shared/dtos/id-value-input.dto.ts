import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

export class MultipleIdsToSingleEntityInput {
  @ApiProperty({ type: [Number] })
  ids: number[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  entityId: number;
}
