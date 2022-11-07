import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WhatsappClient } from './whatsapp-client.entity';
import { WhatsappContact } from './whatsapp-contact.entity';

@Entity('whatsapp_conversation')
export class WhatsappConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WhatsappClient)
  @JoinColumn()
  client: WhatsappClient;

  @Column()
  clientId: number;

  @ManyToOne(() => WhatsappContact)
  @JoinColumn()
  contact: WhatsappContact;

  @Column()
  contactId: number;

  @Column({ nullable: true, default: null })
  name: string;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
