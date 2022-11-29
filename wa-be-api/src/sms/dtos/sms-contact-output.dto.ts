import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SMSContactOutputDTO {
  @Expose()
  id: number;

  @Expose()
  msisdn: string;

  @Expose()
  name: string;
}
