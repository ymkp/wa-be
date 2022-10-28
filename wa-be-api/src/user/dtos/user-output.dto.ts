import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IdNameStringDTO } from 'src/shared/dtos/id-value-response.dto';

@Exclude()
export class UserOutput {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  identificationNo: string;

  @Expose()
  @ApiProperty()
  divisiId: number;

  @Expose()
  @ApiProperty()
  divisi: IdNameStringDTO;

  @Expose()
  @ApiProperty()
  biroId: number;

  @Expose()
  @ApiProperty()
  biro: IdNameStringDTO;

  @Expose()
  @ApiProperty()
  bagianId: number;

  @Expose()
  @ApiProperty()
  bagian: IdNameStringDTO;

  @Expose()
  @ApiProperty()
  divisiModeratorId: number;

  @Expose()
  @ApiProperty()
  isAccountDisabled: boolean;

  @Expose()
  @ApiProperty()
  isSuperAdmin: boolean;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;
}

@Exclude()
export class UserOutputMini {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  identificationNo: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => value?.name ?? null, { toClassOnly: true })
  divisi: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => value?.name ?? null, { toClassOnly: true })
  biro: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => value?.name ?? null, { toClassOnly: true })
  bagian: string;
}
