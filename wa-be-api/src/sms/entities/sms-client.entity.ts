import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sms_client')
export class SMSClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  name: string;

  @Unique('msisdn', ['msisdn'])
  @Column({ length: 18 })
  msisdn: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => User, (d) => d.permittedSMSs)
  permittedUsers: User[];

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
