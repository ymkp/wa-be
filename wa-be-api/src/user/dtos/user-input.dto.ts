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
