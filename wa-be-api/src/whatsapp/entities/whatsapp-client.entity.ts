import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { WHATSAPP_CLIENT_STATUS } from '../constants/whatsapp-client-status.constant';

@Entity('whatsapp_client')
export class WhatsappClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Unique('msisdn', ['msisdn'])
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

  @ManyToMany(() => User, (d) => d.permittedClients)
  permittedUsers: User[];

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt', nullable: true })
  deletedAt: Date;
}
