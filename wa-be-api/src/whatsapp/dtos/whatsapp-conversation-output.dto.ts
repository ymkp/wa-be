import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IdMsisdnOutputDTO } from './whatsapp-contact-output.dto';

@Exclude()
export class WhatsappConversationMessageContentOutputDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  text: string;

  @Expose()
  @ApiProperty()
  fileName: string;

  @Expose()
  @ApiProperty()
  fileDir: string;
}

@Exclude()
export class WhatsappConversationMessageOutputDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  waId: string;

  @Expose()
  @ApiProperty()
  contact: IdMsisdnOutputDTO;

  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty()
  mediaType: string;

  @Expose()
  @ApiProperty()
  content: WhatsappConversationMessageContentOutputDTO;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

@Exclude()
export class WhatsappConversationOutputDTOMini {}

@Exclude()
export class WhatsappConversationOutputDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  client: IdMsisdnOutputDTO;

  @Expose()
  @ApiProperty()
  contact: IdMsisdnOutputDTO;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
