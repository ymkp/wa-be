import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('whatsapp_contact')
export class WhatsappContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Unique('msisdn', ['msisdn'])
  @Column({ length: 18 })
  msisdn: string;

  @Column({ nullable: true, default: null })
  name: string;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
