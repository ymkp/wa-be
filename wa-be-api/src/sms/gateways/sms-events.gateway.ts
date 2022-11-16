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
import { json } from 'stream/consumers';
import { PhoneSocketRegisterInput } from '../dtos/phone-socket.dto';
import { PhoneRegisterInputPipe } from '../pipes/phone-register-input.pipe';

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
    // console.log('CLIENT----------------');
    // console.log(client.id);
    // console.log('---------END OF CLIENT');
    const msg = await this.enc.decryptString(data);
    console.log({ data, msg });
    try {
      const input = this.transformData(PhoneSocketRegisterInput, msg);
      if (input.id) {
        console.log(input);
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
    // socket.join('aRoom');
    this.server.emit('message', message);
    // socket.emit('message', message);
    // return { event: 'roomCreated', room: 'aRoom' };
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
    return plainToInstance(cls, jsonData);
  }
}
