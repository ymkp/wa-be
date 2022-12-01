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
import { PhoneSocketRegisterInput } from '../dtos/phone-socket.dto';

// FIXME : Data validation!!
@WebSocketGateway({
  // path: '/gw-sms',
  cors: {
    origin: '*',
  },
})
export class SMSEventsGateway {
  constructor(private readonly enc: EncryptService) {}
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

  @SubscribeMessage('ping')
  onPing(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    console.log('listeners : ', socket.listenerCount('ping'));
    console.log(socket.client.conn);
    console.log(socket.listeners.toString());
    console.log('ping? ', data);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async ping() {
    console.log('ping 30 secs');
    // TODO : ack socket
    // this.server.emit('ping', 'ping', (res: any) => {
    //   console.log('response ? ', res);
    // });
  }
}
