import { Injectable } from '@nestjs/common';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { WhatsappTestMessageTextInput } from '../dtos/whatsapp-message-input.dto';
import * as util from 'util';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WhatsappContactRepository } from '../repositories/whatsapp-contact.repository';
const execAsync = util.promisify(require('child_process').exec);
const randommerIOURL = 'https://randommer.io/api/Text/LoremIpsum';
const apiKey = '410dfcd9363a4babac9901bed7363ee4';
@Injectable()
export class WhatsappTestService {
  constructor(
    private readonly httpService: HttpService,
    private readonly contactRepo: WhatsappContactRepository,
  ) {}

  public async sendTextMessage(
    ctx: RequestContext,
    input: WhatsappTestMessageTextInput,
  ): Promise<void> {
    const contacts = await this.contactRepo.find({ select: ['id', 'msisdn'] });
    const msisdns = contacts.map((c) => c.msisdn);
    for (let i = 0; i < input.nOfTimes; i++) {
      // const content = await this.generateRandomText();
      const content = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      const contactMsisdn = input.msisdn
        ? input.msisdn
        : msisdns[Math.floor(Math.random() * msisdns.length)];
      try {
        await this.sendMessage(
          'http://10.200.201.102:8017/api/v1/whatsapp-public/send/text',
          { content, contactMsisdn },
          input.token,
        );
        this.writeLog(`${i},${contactMsisdn}`);
      } catch (err) {
        console.log('failed to send message');
        this.writeErrorLog(`${i},${contactMsisdn}`);
      }
    }
  }

  private async writeLog(log: string) {
    const content = `${log}, ${new Date(Date.now())}`;
    console.log(content);
    await execAsync(`echo "${content}" >> log.log`);
  }

  private async writeErrorLog(log: string) {
    const content = `${log}, ${new Date(Date.now())}`;
    console.log('err', content);
    await execAsync(`echo "${content}" >> errorlog.log`);
  }

  private async sendMessage(
    url: string,
    body: any,
    token: string,
  ): Promise<any> {
    return await firstValueFrom(
      this.httpService.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }

  private async generateRandomText(): Promise<string> {
    const res = await firstValueFrom(
      this.httpService.get(randommerIOURL, {
        headers: {
          accept: '*/*',
          'X-Api-Key': apiKey,
        },
        params: {
          loremType: 'business',
          type: 'words',
          number: 30,
        },
      }),
    );
    return res.data;
  }
}
