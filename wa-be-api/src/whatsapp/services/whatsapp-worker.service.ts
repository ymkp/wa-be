import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  WA_WORKER_AUTH,
  WA_WORKER_LOGIN,
  WA_WORKER_SEND_TEXT,
  WA_WORKER_STATUS,
} from '../constants/whatsapp-client-url.constants';
import { WhatsappCacheInfo } from '../dtos/whatsapp-cache.interface';
import { WhatsappWorkerResponseDTO } from '../dtos/whatsapp-worker.dto';
var FormData = require('form-data');

@Injectable()
export class WhatsappWorkerService {
  constructor(private readonly httpService: HttpService) {}

  public async checkClientStatus(cache: WhatsappCacheInfo): Promise<any> {
    const res = await firstValueFrom(
      this.httpService.get<any>(`${cache.fullUrl}${WA_WORKER_STATUS}`, {
        params: {
          msisdn: cache.msisdn,
        },
        headers: {
          Authorization: `Bearer ${cache.token}`,
        },
      }),
    );
    console.log(res.data);
    return res.data;
  }

  public async generateQRLogin(
    cache: WhatsappCacheInfo,
    output?: string,
  ): Promise<any> {
    const bodyFormData = new FormData();
    if (output) {
      bodyFormData.append('output', output);
    }
    const res = await firstValueFrom(
      this.httpService.post<any>(
        `${cache.fullUrl}${WA_WORKER_LOGIN}`,
        bodyFormData,
        {
          headers: {
            Authorization: `Bearer ${cache.token}`,
          },
        },
      ),
    );
    return res.data;
  }

  public async loginAWorker(
    url: string,
    msisdn: string,
    secret: string,
  ): Promise<string> {
    const res = await firstValueFrom(
      this.httpService.get<WhatsappWorkerResponseDTO<{ token: string }>>(
        `${url}${WA_WORKER_AUTH}`,
        {
          auth: { username: msisdn, password: secret },
        },
      ),
    );
    return res.data.data.token;
  }

  public async sendTextMessage(
    clientId: number,
    text: string,
    recipient: string,
    fullUrl: string,
    token: string,
  ): Promise<string> {
    console.log('try to send message to : ', recipient);
    const url = `${fullUrl}${WA_WORKER_SEND_TEXT}`;
    const bodyFormData = new FormData();
    bodyFormData.append('msisdn', recipient);
    bodyFormData.append('message', text);
    const res = await firstValueFrom(
      this.httpService.post<WhatsappWorkerResponseDTO<{ msgid: string }>>(
        url,
        bodyFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );
    return res.data.data.msgid;
  }
}
