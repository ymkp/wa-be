import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserOutputMini } from 'src/user/dtos/user-output.dto';

@Exclude()
export class WhatsappClientOutputDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  msisdn: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  port: number;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  @Type(() => UserOutputMini)
  permittedUsers: UserOutputMini[];
}
