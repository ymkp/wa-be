import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WHATSAPP_MESSAGE_QUEUE_STATUS } from '../constants/whatsapp-message-queue-status.constants';
import { WhatsappClient } from './whatsapp-client.entity';
import { WhatsappContact } from './whatsapp-contact.entity';
import { WhatsappMessageContent } from './whatsapp-message-content.entity';

@Entity('whatsapp_message')
export class WhatsappMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  messageId: string;

  @ManyToOne(() => WhatsappClient)
  @JoinColumn()
  client: WhatsappClient;

  @Column()
  clientId: number;

  @ManyToOne(() => WhatsappContact, { nullable: true, eager: true })
  @JoinColumn()
  contact: WhatsappContact;

  @Column({ nullable: true, default: null })
  contactId: number;

  @OneToOne(() => WhatsappMessageContent, { eager: true })
  @JoinColumn()
  content: WhatsappMessageContent;

  @Column()
  contentId: number;

  @Column({
    type: 'enum',
    enum: WHATSAPP_MESSAGE_QUEUE_STATUS,
    default: WHATSAPP_MESSAGE_QUEUE_STATUS.ONQUEUE,
  })
  status: WHATSAPP_MESSAGE_QUEUE_STATUS;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
