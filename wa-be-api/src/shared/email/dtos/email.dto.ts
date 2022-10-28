import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class EmailWithCTAInputDTO{

  @ApiProperty()
  @IsString()
  cta: string;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsString()
  to: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  subtitle: string;

  @ApiProperty()
  @IsString()
  subject: string;
}