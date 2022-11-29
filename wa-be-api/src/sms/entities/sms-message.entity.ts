import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SMS_DELIVERY_STATUS } from '../constants/sms-message-status.const';
import { SMSClient } from './sms-client.entity';
import { SMSContact } from './sms-contact.entity';

@Entity('sms_message')
export class SMSMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SMSClient)
  @JoinColumn()
  client: SMSClient;

  @Column()
  clientId: number;

  @ManyToOne(() => SMSContact, { nullable: true })
  @JoinColumn()
  contact: SMSContact;

  @Column({ nullable: true, default: null })
  contactId: number;

  @Column({ type: 'text' })
  message: string;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @Column()
  createdById: number;

  @Column({
    type: 'enum',
    enum: SMS_DELIVERY_STATUS,
    default: SMS_DELIVERY_STATUS.ONQUEUE,
  })
  status: SMS_DELIVERY_STATUS;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
