import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RegisterInput {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  name: string;

  @ApiProperty()
  @MaxLength(200)
  @IsString()
  username: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  identificationNo: string;

  // These keys can only be set by ADMIN user.
  // roles: ROLE[] = [ROLE.USER];
  isAccountDisabled: boolean;
}

export class SSORequestInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  identificationNo: string;
}

export class SSOUseInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ssoToken: string;
}
