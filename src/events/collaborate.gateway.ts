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

  // 初始化websocket后，处理文档协同
  afterInit(server: Server) {
    server.on('connection', (client: Socket, request: any) => {
      const docName = request.url.split('?')[1];
      if (!docName) return;

      // 调用y-websocket的setupWSConnection函数用y-websocket库处理文档协同的逻辑。
      wutils.setupWSConnection(client, request, { docName, gc: true });
    });
  }
}
