import { observable, action, makeAutoObservable } from 'mobx';
import { ACCESS_TOKEN } from '../../constants';
import { getInterview } from './apis';
import type { IInterview } from './type';

class Interview {
  socket: WebSocket | null = null;

  @observable.ref
  currentInterview: IInterview | null = null;

  loading: boolean = false;

  @action
  setCurrentInterview(v: IInterview | null) {
    this.currentInterview = v;
  }

  @action
  setLoading(v: boolean) {
    this.loading = v;
  }

  async queryInterview(id: string) {
    this.setLoading(true);
    const res = await getInterview(id);
    this.setCurrentInterview(res);
    this.setLoading(false);
  }

  send(type: string, data: any = {}) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    this.socket?.send(
      JSON.stringify({
        event: 'events',
        data: { ...data, type, token: token },
      }),
    );
  }

  initSocket() {
    if (!this.socket) {
      this.socket = new WebSocket('ws://192.168.1.4:3000/websocket/event');
      this.socket.addEventListener('close', () => {
        this.socket = null;
      });
      return new Promise((r) => {
        this.socket?.addEventListener('open', () => {
          r(this.socket);
        });
      });
    }
  }

  sendWaitReply<T>(
    type: string,
    data: any = {},
    waitTime: number = 3000,
  ): Promise<T> {
    return new Promise((r, j) => {
      const handle = async (ev: MessageEvent) => {
        const message = JSON.parse(ev.data);
        const timeoutFlag = setTimeout(() => {
          this.socket?.removeEventListener('message', handle);
          j({ message: 'timeout' });
        }, waitTime);
        if (message.events === `${type}-success`) {
          this.socket?.removeEventListener('message', handle);
          clearTimeout(timeoutFlag);
          r(message.data);
        } else if (message.events === `${type}-fail`) {
          this.socket?.removeEventListener('message', handle);
          clearTimeout(timeoutFlag);
          j(message.data);
        }
      };
      this.socket?.addEventListener('message', handle);
      this.send(type, data);
    });
  }

  listenInter() {
    const handle = async (ev: MessageEvent) => {
      const message = JSON.parse(ev.data);
      if (message.events === 'request-inter') {
        this.send('request-inter-reply', {
          agree: true,
          scope: this.currentInterview?.id,
          id: message.data.id,
        });
      }
    };
    this.socket?.addEventListener('message', handle);
  }

  async createInterview(): Promise<{ id: string }> {
    await this.initSocket();
    const res = await this.sendWaitReply<{ id: string }>('create-interview');

    this.listenInter();
    return res;
  }

  async interInterview(id: string): Promise<{ interviewId: string }> {
    await this.initSocket();
    return this.sendWaitReply<{ interviewId: string }>('inter-interview', {
      id,
      msg: 'wo shi zhao',
      role: 'interviewee',
    });
  }

  async interInterviewAsInterviewer(
    id: string,
  ): Promise<{ interviewId: string }> {
    await this.initSocket();
    return this.sendWaitReply<{ interviewId: string }>('inter-interview', {
      id,
      msg: 'wo shi zhao',
      role: 'interviewer',
    });
  }

  sentToOpposite() {}

  listenToOpposite() {}

  constructor() {
    makeAutoObservable(this);
  }
}

export default new Interview();
