import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WHATSAPP_CLIENT_STATUS } from '../constants/whatsapp-client-status.constants';

@Entity('whatsapp_client')
export class WhatsappClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ length: 18 })
  msisdn: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  secret: string;

  @Column()
  port: number;

  @Column({
    type: 'enum',
    enum: WHATSAPP_CLIENT_STATUS,
    default: WHATSAPP_CLIENT_STATUS.NONE,
  })
  status: WHATSAPP_CLIENT_STATUS;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
