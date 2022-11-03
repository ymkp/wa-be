import { WhatsappClient } from 'src/whatsapp/entities/whatsapp-client.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ default: null, nullable: true })
  password: string;

  @Unique('username', ['username'])
  @Column({ length: 200 })
  username: string;

  @Column({ default: null, nullable: true })
  isAccountDisabled: boolean;

  @Column({ default: false, nullable: true })
  isSuperAdmin: boolean;

  @Unique('email', ['email'])
  @Column({ length: 200 })
  email: string;

  @Unique('identificationNo', ['identificationNo'])
  @Column({ length: 30 })
  identificationNo: string;

  @ManyToMany(() => WhatsappClient)
  @JoinTable()
  permittedClients: WhatsappClient[];

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
