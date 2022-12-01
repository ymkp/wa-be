import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { SMSClientOutputDTO } from 'src/sms/dtos/sms-client-output.dto';
import { WhatsappClientOutputDTO } from 'src/whatsapp/dtos/whatsapp-client-output.dto';

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
export class UserOutputDetailDTO {
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
  isAccountDisabled: boolean;

  @Expose()
  @ApiProperty()
  isSuperAdmin: boolean;

  @Expose()
  @ApiProperty()
  @Type(() => WhatsappClientOutputDTO)
  permittedClients: WhatsappClientOutputDTO[];

  @Expose()
  @ApiProperty()
  @Type(() => SMSClientOutputDTO)
  permittedSMSs: SMSClientOutputDTO[];

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
}
