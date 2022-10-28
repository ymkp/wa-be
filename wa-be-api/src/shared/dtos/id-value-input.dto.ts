import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

export class MultipleIdsToSingleEntityInput {
  @ApiProperty({ type: [Number] })
  @ArrayNotEmpty()
  ids: number[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  entityId: number;
}
