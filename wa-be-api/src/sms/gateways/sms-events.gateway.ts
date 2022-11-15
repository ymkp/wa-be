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
import { json } from 'stream/consumers';
import { PhoneSocketRegisterInput } from '../dtos/phone-socket.dto';
import { PhoneRegisterInputPipe } from '../pipes/phone-register-input.pipe';

// FIXME : Data validation!!
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SMSEventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('register')
  phoneRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ) {
    console.log('CLIENT----------------');
    console.log(client.id);
    console.log('---------END OF CLIENT');
    console.log('SOCKETS----------------');

    console.log(client.nsp.sockets);
    console.log('---------END OF SOCKETS');
    try {
      const input = this.transformData(PhoneSocketRegisterInput, data);
      if (input.id) {
        console.log(input);
      } else {
        console.log('input doesnt have ID');
      }
    } catch (err) {
      console.log('ERR : ', err);
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

  emitter01() {}

  private transformData<T>(cls: ClassConstructor<T>, data: string): T {
    const jsonData = JSON.parse(data);
    return plainToInstance(cls, jsonData);
  }
}
