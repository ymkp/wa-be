import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserOutputMini } from 'src/user/dtos/user-output.dto';
import { SMSClientOutputDTO } from './sms-client-output.dto';
import { SMSContactOutputDTO } from './sms-contact-output.dto';

export interface SMSMessageToClientDTO {
  id: number;
  msisdn: string;
  message: string;
  to: string;
}

@Exclude()
export class SMSMessageDetailDTO {
  @Expose()
  id: number;

  @Expose()
  @Type(() => SMSClientOutputDTO)
  client: SMSClientOutputDTO;

  @Expose()
  @Type(() => SMSContactOutputDTO)
  contact: SMSContactOutputDTO;

  @Expose()
  message: string;

  @Expose()
  @Type(() => UserOutputMini)
  createdBy: UserOutputMini;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

@Exclude()
export class SMSMessageMiniDTO {
  @Expose()
  id: number;

  @Expose()
  status: string;

  @Expose()
  message: string;

  @Expose()
  @Transform(({ value }) => value?.msisdn ?? '', { toClassOnly: true })
  contact: string;

  @Expose()
  @Type(() => SMSContactOutputDTO)
  client: SMSContactOutputDTO;

  @Expose()
  @Type(() => UserOutputMini)
  createdBy: UserOutputMini;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdAt: Date;
}
