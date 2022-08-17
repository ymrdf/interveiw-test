import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'dgram';
// import wutils from 'y-websocket/bin/utils';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'ws';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const wutils = require('y-websocket/bin/utils');

console.log(wutils);

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/room',
})
export class CollaborateGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  onEvent(client: any, data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  afterInit(server: Server) {
    server.on('connection', (client: Socket, request: any) => {
      console.log('con------>', request.url);
      const docName = request.url.split('?')[1];
      if (!docName) {
        return;
      }

      wutils.setupWSConnection(client, request, { docName, gc: true });
    });
  }
}
