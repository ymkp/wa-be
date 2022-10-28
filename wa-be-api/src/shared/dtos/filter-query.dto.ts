import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class OnlyDatesQuery {
  @ApiPropertyOptional({
    description: 'Optional, e.g : 2022-07-20. defaults to today at 00:00 ',
  })
  @IsDateString()
  @IsOptional()
  firstDate: string;

  @ApiPropertyOptional({
    description: 'Optional, e.g : 2022-07-21. defaults to today at 23:59 ',
  })
  @IsDateString()
  @IsOptional()
  lastDate: string;
}

export class CustomFilterQuery {
  // @ApiPropertyOptional({
  //   description: 'Optional, defaults to 20',
  //   type: Number,
  // })
  // @IsNumber()
  // @IsOptional()
  // @Min(0)
  // @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  // limit = 20;

  // @ApiPropertyOptional({
  //   description: 'Optional, defaults to 1',
  //   type: Number,
  // })
  // @IsNumber()
  // @IsOptional()
  // @Min(1)
  // @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  // page = 1;

  // @ApiPropertyOptional({
  //   description: 'Optional, defaults to 0',
  //   type: Number,
  // })
  // @IsNumber()
  // @IsOptional()
  // @Min(0)
  // @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  // offset = 0;

  @ApiPropertyOptional({
    description: 'Optional, e.g : 2022-07-20. defaults to today at 00:00 ',
  })
  @IsDateString()
  @IsOptional()
  firstDate: string;

  @ApiPropertyOptional({
    description: 'Optional, e.g : 2022-07-21. defaults to today at 23:59 ',
  })
  @IsDateString()
  @IsOptional()
  lastDate: string;

  @ApiPropertyOptional({
    description: 'Optional, defaults to 1 (polri.go.id)',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  siteId = 1;

  @ApiPropertyOptional({
    description:
      'Optional, name of property that want to be sorted by. If the property doesnt exists, it wont return anything. Please leeave it to empty if not needed. Defaults to table id',
  })
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional({
    description:
      'Optional, sort ASC or DESC, regarding orderBy query. Defaults to DESC',
  })
  @IsString()
  @IsOptional()
  sort: string = 'DESC';
}
