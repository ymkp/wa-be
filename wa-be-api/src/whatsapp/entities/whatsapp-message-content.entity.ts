import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WHATSAPP_MESSAGE_CONTENT_TYPE } from '../constants/whatsapp-message-content-type.constant';
import { WhatsappMessage } from './whatsapp-message.entity';

@Entity('whatsapp_message_content')
export class WhatsappMessageContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @OneToOne(() => WhatsappMessage)
  message: WhatsappMessage;

  @Column({
    type: 'enum',
    enum: WHATSAPP_MESSAGE_CONTENT_TYPE,
    default: WHATSAPP_MESSAGE_CONTENT_TYPE.TEXT,
  })
  type: WHATSAPP_MESSAGE_CONTENT_TYPE;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;
}
