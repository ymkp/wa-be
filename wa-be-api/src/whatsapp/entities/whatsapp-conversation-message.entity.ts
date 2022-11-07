import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WHATSAPP_CONVERSATION_MESSAGE_MEDIA_TYPE } from '../constants/whatsapp-conversation-message-media-type.constant';
import { WHATSAPP_CONVERSATION_TYPE } from '../constants/whatsapp-conversation-type.constant';
import { WhatsappContact } from './whatsapp-contact.entity';
import { WhatsappConversationMessageContent } from './whatsapp-conversation-message-content.entity';
import { WhatsappConversation } from './whatsapp-conversation.entity';

@Entity('whatsapp_conversation_message')
export class WhatsappConversationMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WhatsappConversation)
  @JoinColumn()
  conversation: WhatsappConversation;

  @Column()
  conversationId: number;

  @Column()
  waId: string;

  @ManyToOne(() => WhatsappContact, { nullable: true })
  @JoinColumn()
  contact: WhatsappContact;

  @Column({ nullable: true, default: null })
  contactId: number;

  @Column({
    type: 'enum',
    enum: WHATSAPP_CONVERSATION_TYPE,
    default: WHATSAPP_CONVERSATION_TYPE.SENT,
  })
  type: WHATSAPP_CONVERSATION_TYPE;

  @Column({
    type: 'enum',
    enum: WHATSAPP_CONVERSATION_MESSAGE_MEDIA_TYPE,
    default: WHATSAPP_CONVERSATION_MESSAGE_MEDIA_TYPE.TEXT,
  })
  mediaType: WHATSAPP_CONVERSATION_MESSAGE_MEDIA_TYPE;

  @OneToOne(() => WhatsappConversationMessageContent, { eager: true })
  @JoinColumn()
  content: WhatsappConversationMessageContent;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;
}
