import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WhatsappMessage } from './whatsapp-message.entity';

@Entity('whatsapp_message_content')
export class WhatsappMessageContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @OneToOne(() => WhatsappMessage)
  message: WhatsappMessage;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;
}
