import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class MultipleIdsToSingleEntityInput {
  @ApiProperty({ type: [Number] })
  @IsArray()
  ids: number[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  entityId: number;
}
