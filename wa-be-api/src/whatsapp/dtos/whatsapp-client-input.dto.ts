import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WhatsappClientInputRegister {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  msisdn: string;
}

export interface WhatsappWorkerCreateParameter {
  serverPort: number;
  authBasicUsername: string;
  authBasicPassword: string;
}
