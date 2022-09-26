import { UseGuards, Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'ws';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewService } from '../interview/interview.service';
import { Interview } from '../interview/interview.model';
import { manager } from './interviewManager';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/websocket/event',
})
@Injectable()
export class EventsGateway {
  interviewService = new InterviewService(Interview);
  // constructor(private readonly interviewService: InterviewService) {}

  @WebSocketServer()
  server: Server;

  /**
   * 处理websocket来的event类型的信息即面试创建相关信息
   * @param client 客户端socket
   * @param data 请求数据
   * @returns 回复内容
   */
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('events')
  async onEvent(client: Socket, data: any): Promise<any> {
    const type = data.type;
    const scope = data.scope;
    if (scope) {
      manager.scopeEvent(data);
    }
    switch (type) {
      // 创建面试请求
      case 'create-interview':
        const res = await this.interviewService.createOne(data.user.userid);
        manager.createInterview({
          socket: client,
          user: data.user,
          id: res.id,
        });

        return { event: 'create-interview-success', data: res };
      // 加入面试请求
      case 'inter-interview':
        const { role, id, user, msg } = data;
        const inter = await this.interviewService.findOne(id);
        if (!inter) {
          return {
            event: 'inter-interview-fail',
            data: {
              msg: 'no interview',
            },
          };
        }

        const interview = manager.getInterviewById(id);
        // 判断请求者面试中的角色，当是面试官时
        if (role === 'interviewer') {
          if (inter && inter.interviewerId !== user.userid) {
            return {
              event: 'inter-interview-fail',
              data: {
                msg: 'not you interview',
              },
            };
          }
          // 存在面试时，加入面试
          if (interview) {
            interview.addNewInterviewer(user.username, user.userid, client);
            manager.saveSocketInterview(client, interview);
            return {
              event: 'inter-interview-success',
              data: {
                interviewId: interview.id,
              },
            };
            // 不存在面试时，创建面试
          } else {
            manager.createInterview({
              id: inter.id,
              socket: client,
              user,
            });
            return {
              event: 'inter-interview-success',
            };
          }
        } else if (role === 'interviewee') {
          // 当请求者是面试者时，并且存在面试时，调用面试的请求加入方法
          if (
            interview &&
            inter &&
            (!inter.intervieweeId || inter.intervieweeId === user.userid)
          ) {
            interview.requestInter(client, user.username, user.userid, msg);
          } else {
            return {
              event: 'inter-interview-fail',
              data: {
                msg: 'no interview created',
              },
            };
          }
        } else {
          return {
            event: 'create-interview-success',
          };
        }
    }
  }

  /**
   * 监听所有有关webrtc的通讯，从interviewManger中找到对应面试，
   * 然后交给Interview类的retransmission方法，把请求转发给面试的另一方。
   * @param data 传递的数据
   */
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('webrtc')
  async onWebrtc(client: Socket, data: any): Promise<any> {
    const { scope, user } = data;
    console.log('webrtc msg', scope, data);
    // 找到请求者所在面试，调用面试的方法转发数据
    if (scope) {
      const interview2 = manager.getInterviewById(data.scope);
      console.log('interview2', !!interview2);
      interview2.retransmission(user.userid, 'webrtc', data.data);
    }
  }

  /**
   *转发所有chat类型的数据
   */
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('chat')
  async onChat(client: Socket, data: any): Promise<any> {
    const { scope, user } = data;
    console.log('chat msg', scope, data);
    // 找到请求者所在面试，调用面试的方法转发数据
    if (scope) {
      const interview2 = manager.getInterviewById(data.scope);
      interview2.retransmission(user.userid, 'chat', data.data);
    }
  }

  afterInit(server: Server) {
    manager.setServer(server);
  }

  handleDisconnect(client: Socket) {
    manager.clientDisconnect(client);
  }
}
