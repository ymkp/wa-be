import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sso_token')
export class SSOToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  ssoToken: string;

  @Column()
  expiresIn: Date;

  @Column()
  userId: number;

  @Column({ default: false })
  hasBeenUsed: boolean;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
