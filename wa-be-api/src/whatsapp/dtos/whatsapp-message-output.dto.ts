import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserOutputMini } from 'src/user/dtos/user-output.dto';
import { WhatsappContactOutputDTO } from './whatsapp-contact-output.dto';
import { WhatsappContentOutputDTO } from './whatsapp-content-output.dto';

@Exclude()
export class WhatsappMessageOutputDTOMini {
  @Expose()
  id: number;

  @Expose()
  status: string;

  @Expose()
  @Transform(({ value }) => value?.msisdn ?? '', { toClassOnly: true })
  contact: string;

  @Expose()
  @Type(() => WhatsappContactOutputDTO)
  client: WhatsappContactOutputDTO;

  @Expose()
  @Type(() => UserOutputMini)
  createdBy: UserOutputMini;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => value?.content, { toClassOnly: true })
  content: string;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

@Exclude()
export class WhatsappMessageOutputDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  messageId: string;

  @Expose()
  @ApiProperty()
  contact: WhatsappContactOutputDTO;

  @Expose()
  @ApiProperty()
  content: WhatsappContentOutputDTO;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
