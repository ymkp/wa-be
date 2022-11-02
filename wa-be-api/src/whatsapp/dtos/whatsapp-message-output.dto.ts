import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { WhatsappContactOutputDTO } from './whatsapp-contact-output.dto';
import { WhatsappContentOutputDTO } from './whatsapp-content-output.dto';

@Exclude()
export class WhatsappMessageOutputDTOMini {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => value.msisdn ?? '', { toClassOnly: true })
  contact: string;

  @Expose()
  @ApiProperty()
  @Transform(
    ({ value }) => (value.content ? value.content.substring(0, 50) : ''),
    { toClassOnly: true },
  )
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
