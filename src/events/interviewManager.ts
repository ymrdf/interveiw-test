import { Socket } from 'ws';

export class ConnectUser {
  id: string;
  name: string;

  socket: Socket;

  send(type: string, data: any = {}) {
    this.socket.send(JSON.stringify({ events: type, data }));
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

export class Interview {
  id: string;
  interviewer: ConnectUser | null;
  interviewee: ConnectUser | null = null;

  server: Socket;

  waitingUser: ConnectUser[] = [];

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

  requestInter(socket: Socket, name: string, id: string, msg: string) {
    const user = new ConnectUser(name, id, socket);
    this.waitingUser.push(user);

    this.interviewer.socket.send(
      JSON.stringify({
        events: 'request-inter',
        data: {
          name,
          msg,
          id,
        },
      }),
    );
  }

  constructor(id: string, interviewer: ConnectUser, server: Socket) {
    this.id = id;
    this.interviewer = interviewer;
    this.server = server;
  }
}

export class InterviewManager {
  interviews = new Map<string, Interview>();
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

  createInterview(data: {
    id: string;
    socket: Socket;
    user: { username: string; userid: string };
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

  // addToInterview(data: {
  //   id: string;
  //   socket: Socket;
  //   user: { username: string; userid: string };
  // }) {
  //   const interview = this.interviews.get(data.id);
  //   if (interview) {
  //     const interviewee = new ConnectUser(
  //       data.user.username,
  //       data.user.userid,
  //       data.socket,
  //     );
  //     interview.addInterviewee(interviewee);
  //   } else {
  //     return { status: 'error', msg: 'interview did not found ' };
  //   }
  // }
}

export const manager = new InterviewManager();
