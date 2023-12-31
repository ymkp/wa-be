import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { EncryptService } from 'src/shared/signing/encrypt.service';
import { SMS_DELIVERY_STATUS } from '../constants/sms-message-status.const';
import {
  PhoneInfoGW,
  PhoneSocketRegisterInput,
} from '../dtos/phone-socket.dto';
import { SMSMessageRepository } from '../repositories/sms-message.repository';

@Injectable()
@WebSocketGateway({
  // path: '/gw-sms',
  cors: {
    origin: '*',
  },
})
export class SMSEventsGateway {
  constructor(
    private readonly enc: EncryptService,
    private readonly smsMessageRepo: SMSMessageRepository,
  ) {}

  clients: PhoneInfoGW[] = [];

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('register')
  async phoneRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): Promise<WsResponse<any>> {
    const msg = await this.enc.decryptString(data);
    try {
      const input = this.transformData(PhoneSocketRegisterInput, msg);
      if (input.id) {
        this.insertPhone(input);
        console.log('input register phone ok : ', input);
        return { event: 'register', data: JSON.stringify(input) };
      } else {
        console.log('input doesnt have ID');
      }
    } catch (err) {
      console.log('ERR : ', err);
      return { event: 'register', data: 'failed' };
    }
  }

  getAvailableCLients(): number[] {
    const now = new Date(Date.now());
    const ps = this.clients.filter((c) => {
      const diff: number = now.getTime() - c.last.getTime();
      const d = new Date(diff);
      console.log(d.getMinutes());
      return d.getMinutes() < 3;
    });
    return ps.map((p) => p.id);
  }

  private insertPhone(input: PhoneSocketRegisterInput) {
    const idx = this.clients.findIndex((c) => c.id === input.id);
    if (idx > -1) {
      this.clients[idx].last = new Date(Date.now());
    } else {
      this.clients.push({
        id: input.id,
        msisdn: input.msisdn,
        last: new Date(Date.now()),
      });
    }
  }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log('events? ', data);
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  identity(@MessageBody() data: number): WsResponse<any> {
    console.log('identity? ', data);
    return { event: 'identity', data: data };
  }

  @SubscribeMessage('sms-confirmation')
  async smsConfirmation(@MessageBody() data: string): Promise<WsResponse<any>> {
    console.log('confirmation to dec', data);
    const msg = await this.enc.decryptString(data);
    const ss = JSON.parse(msg) as { id: number; status: SMS_DELIVERY_STATUS };
    this.smsMessageRepo.update(ss.id, {
      status: ss.status,
    });

    console.log('confirmation to dec', msg);

    return { event: 'confirmation', data: data };
  }

  broadcastMessage(message: string) {
    this.server.emit('message', message);
  }

  createARoom(@ConnectedSocket() socket: Socket) {
    socket.join('aRoom');
    socket.to('aRoom').emit('roomCreated', { room: 'aRoom' });
    return { event: 'roomCreated', room: 'aRoom' };
  }

  private transformData<T>(cls: ClassConstructor<T>, data: string): T {
    console.log('INPUT---------------------');
    console.log(data);
    console.log('--------------END OF INPUT');
    const jsonData = JSON.parse(data);
    console.log('json data? : ', jsonData);
    console.log('-----------------------');

    return plainToInstance(cls, jsonData);
  }

  @SubscribeMessage('pong')
  onPing(@MessageBody() data: any): Promise<WsResponse<any>> {
    console.log('pong? ', data);
    return data;
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async ping() {
    console.log('ping 30 secs');
    const ids = this.getAvailableCLients();
    this.server.emit('ping', ids);
  }
}
