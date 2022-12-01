import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SMSPublicToken } from './sms-public-token.entity';

@Entity('sms_public_usage')
export class SMSPublicUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SMSPublicToken)
  @JoinColumn()
  token: SMSPublicToken;

  @Column()
  tokenId: number;

  @Column({ type: 'text', nullable: true, default: null })
  host: string;

  @Column({ nullable: true, default: null })
  ip: string;

  @Column({ type: 'text', nullable: true, default: null })
  referer: string;

  @Column({ type: 'text', nullable: true, default: null })
  userAgent: string;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;
}
