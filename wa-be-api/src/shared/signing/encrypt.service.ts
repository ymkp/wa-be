import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class EncryptService {
  constructor(private readonly configService: ConfigService) {
    this.password = this.configService.get('doc_pass');
    this.ivString = this.configService.get('enc.iv');
  }

  password = '';
  ivString = '';

  public async encryptString(message: string): Promise<string> {
    const iv = Buffer.from(this.ivString, 'hex');
    console.log('iv : ascii : ', iv.toString('hex'));
    const key = (await promisify(scrypt)(this.password, 'salt', 32)) as Buffer;
    console.log('key : hex : ', key.toString('hex'));

    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([
      cipher.update(message),
      cipher.final(),
    ]);

    return encryptedText.toString('hex');
  }

  public async decryptString(message: string): Promise<string> {
    const encText = Buffer.from(message, 'hex');
    const iv = Buffer.from(this.ivString, 'hex');
    const key = (await promisify(scrypt)(this.password, 'salt', 32)) as Buffer;
    const dec = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([dec.update(encText), dec.final()]);
    console.log('dct : ', decryptedText);
    return decryptedText.toString();
  }
}
