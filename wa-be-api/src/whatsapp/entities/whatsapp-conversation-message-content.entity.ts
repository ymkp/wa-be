import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('whatsapp_conversation_message_content')
export class WhatsappConversationMessageContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true, default: null })
  text: string;

  @Column({ type: 'text', nullable: true, default: null })
  fileName: string;

  @Column({ type: 'text', nullable: true, default: null })
  fileDir: string;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;
}
