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

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('events')
  async onEvent(client: Socket, data: any): Promise<any> {
    console.log('events', data);
    const type = data.type;
    const scope = data.scope;
    if (scope) {
      manager.scopeEvent(data);
    }
    switch (type) {
      case 'create-interview':
        const res = await this.interviewService.createOne(data.user.userid);
        manager.createInterview({
          socket: client,
          user: data.user,
          id: res.id,
        });

        return { events: 'create-interview-success', data: res };
      case 'inter-interview':
        const { role, id, user, msg } = data;
        const inter = await this.interviewService.findOne(id);
        console.log('interview', inter);
        if (!inter) {
          return {
            events: 'inter-interview-fail',
            data: {
              msg: 'no interview',
            },
          };
        }

        const interview = manager.getInterviewById(id);
        if (role === 'interviewer') {
          if (inter && inter.interviewerId !== user.userid) {
            return {
              events: 'inter-interview-fail',
              data: {
                msg: 'not you interview',
              },
            };
          }
          if (interview) {
            interview.addNewInterviewer(user.username, user.userid, client);
            manager.saveSocketInterview(client, interview);
            return {
              events: 'inter-interview-success',
              data: {
                interviewId: interview.id,
              },
            };
          } else {
            manager.createInterview({
              id: inter.id,
              socket: client,
              user,
            });
            return {
              events: 'inter-interview-success',
            };
          }
        } else if (role === 'interviewee') {
          if (
            interview &&
            inter &&
            (!inter.intervieweeId || inter.intervieweeId === user.userid)
          ) {
            interview.requestInter(client, user.username, user.userid, msg);
          } else {
            return {
              events: 'inter-interview-fail',
              data: {
                msg: 'no interview created',
              },
            };
          }
        } else {
          return {
            events: 'create-interview-success',
          };
        }
    }
  }

  afterInit(server: Server) {
    manager.setServer(server);
  }

  handleDisconnect(client: Socket) {
    manager.clientDisconnect(client);
  }
}
