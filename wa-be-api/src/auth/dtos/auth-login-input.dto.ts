import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginInput {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  username: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  password: string;
}

export class EmailConfirmationBody {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  token: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password: string;
}
