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

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;
}
