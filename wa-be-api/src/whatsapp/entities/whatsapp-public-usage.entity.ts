import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WhatsappPublicToken } from './whatsapp-public-token.entity';

@Entity('whatsapp_public_usage')
export class WhatsappPublicUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WhatsappPublicToken)
  @JoinColumn()
  token: WhatsappPublicToken;

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
