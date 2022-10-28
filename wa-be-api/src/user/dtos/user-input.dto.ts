import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserFilterInput {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  identificationNo: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  divisiId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  biroId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  bagianId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  divisiModeratorId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  biroModeratorId: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAccountDisabled: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSuperAdmin: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  createdAt: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  updatedAt: string;
}

export class UserCreateBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identificationNo: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  divisiId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  biroId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  bagianId: number;
}

export class UserEditBody {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  identificationNo: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  divisiId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  biroId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  bagianId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  biroModeratorId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  divisiModeratorId: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAccountDisabled: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSuperAdmin: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  createdAt: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  updatedAt: string;
}

export class UserEditPasswordBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
