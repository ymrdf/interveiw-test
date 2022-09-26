import { Socket } from 'ws';

export class ConnectUser {
  id: string;
  name: string;

  socket: Socket;

  send(type: string, data: any = {}) {
    this.socket.send(JSON.stringify({ event: type, data }));
  }

  get active() {
    return this.socket.readyState === 1;
  }

  constructor(name: string, id: string, socket: Socket) {
    this.id = id;
    this.name = name;
    this.socket = socket;
  }
}

interface IReseiveData {
  type: string;
  scope: string;
  [pro: string]: any;
}

/**
 * 包括面试双方通信以及面试创建的各种方法。
 */
export class Interview {
  id: string;
  interviewer: ConnectUser | null;
  interviewee: ConnectUser | null = null;

  server: Socket;

  waitingUser: ConnectUser[] = [];

  get everyBody() {
    return [this.interviewee, this.interviewer];
  }

  clientDisconnect(socket: Socket) {
    if (this.interviewee && this.interviewee.socket === socket) {
      this.interviewee = null;
    }

    if (this.interviewer && this.interviewer.socket === socket) {
      this.interviewer = null;
    }
  }

  isEmpty() {
    return !this.interviewee && !this.interviewer;
  }

  getRoleBySocket(v: Socket) {
    return this.everyBody.find((item) => item.socket === v);
  }

  getOppositeBySocket(v: Socket) {
    return this.everyBody.find((item) => item.socket !== v);
  }

  getRoleById(v: string) {
    return this.everyBody.find((item) => item.id === v);
  }

  getOppositeById(v: string) {
    return this.everyBody.find((item) => item.id !== v);
  }

  addInterviewee(v: ConnectUser) {
    this.interviewee = v;
  }

  addInterviewer(v: ConnectUser) {
    this.interviewer = v;
  }

  addNewInterviewer(name: string, id: string, socket: Socket) {
    this.addInterviewer(new ConnectUser(name, id, socket));
  }

  addNewInterviewee(name: string, id: string, socket: Socket) {
    this.addInterviewee(new ConnectUser(name, id, socket));
  }

  handleEvent(data: IReseiveData) {
    if (data.type === 'request-inter-reply') {
      this.handleInterReply(data);
    }
  }

  // 处理对“加入面试”请求的回复
  handleInterReply({ agree, id }: IReseiveData) {
    const currentProposer = this.waitingUser.find((item) => item.id === id);
    if (agree && currentProposer && currentProposer.active) {
      currentProposer.send('inter-interview-success', { interviewId: this.id });
      this.addInterviewee(currentProposer);
    } else if (agree === false) {
      if (currentProposer?.active) {
        currentProposer.send('inter-interview-fail', {
          status: 'refuse',
          msg: 'refuse',
        });
      }
    }

    this.waitingUser = this.waitingUser.filter((item) => item.id !== id);
  }

  // 请求加入面试
  requestInter(socket: Socket, name: string, id: string, msg: string) {
    const user = new ConnectUser(name, id, socket);
    this.waitingUser.push(user);

    this.interviewer.socket.send(
      JSON.stringify({
        event: 'request-inter',
        data: {
          name,
          msg,
          id,
        },
      }),
    );
  }

  // 转发面试中双方的信息
  retransmission(originUserId: string, type: string, data: any);
  retransmission(originSocket: Socket, type: string, data: any);
  retransmission(query: any, type: string, data: any) {
    console.log(
      'retransmisssion',
      typeof query === 'string',
      this.getRoleById(query),
    );
    // 根据userId或者socket获取对方User实例，然后发送信息
    if (typeof query === 'string') {
      const my = this.getRoleById(query);
      if (my) {
        const opposite = this.getOppositeById(query);
        opposite.send(type, data);
      }
    } else {
      const my = this.getRoleBySocket(query);
      if (my) {
        const opposite = this.getOppositeBySocket(query);
        opposite.send(type, data);
      }
    }
  }

  constructor(id: string, interviewer: ConnectUser, server: Socket) {
    this.id = id;
    this.interviewer = interviewer;
    this.server = server;
  }
}

// 管理所有面试的类
export class InterviewManager {
  // 所有面试map,以面试ID为KEY
  interviews = new Map<string, Interview>();
  // 所有面试map,以参加者socket为KEY
  sockInterviewMap = new Map<Socket, Interview>();
  server: Socket = null;

  setServer(v: Socket) {
    this.server = v;
  }

  saveSocketInterview(socket: Socket, inter: Interview) {
    this.sockInterviewMap.set(socket, inter);
  }

  getInterviewBySocket = (socket: Socket) => {
    return this.sockInterviewMap.get(socket);
  };

  getInterviewById = (id: string) => {
    return this.interviews.get(id);
  };

  /**
   * 创建面试
   * @param data 创建面试相关信息
   */
  createInterview(data: {
    id: string; // 面试ID
    socket: Socket; // 创建者socket
    user: { username: string; userid: string }; // 创建者信息
  }) {
    const interviewer = new ConnectUser(
      data.user.username,
      data.user.userid,
      data.socket,
    );
    const interview = new Interview(data.id, interviewer, this.server);
    this.interviews.set(interview.id, interview);
    this.interviews.set(data.socket, interview);
  }

  clientDisconnect(socket: Socket) {
    const inter = this.getInterviewBySocket(socket);
    if (inter) {
      inter.clientDisconnect(socket);
      this.sockInterviewMap.delete(socket);
      if (inter.isEmpty()) {
        this.interviews.delete(inter.id);
      }
    }
  }

  scopeEvent(data: IReseiveData) {
    const inter = this.getInterviewById(data.scope);
    if (inter) {
      inter.handleEvent(data);
    }
  }
}

export const manager = new InterviewManager();
