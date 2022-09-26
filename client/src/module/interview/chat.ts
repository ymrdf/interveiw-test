import { observable, action, makeAutoObservable } from 'mobx';
import { Interview } from './store';
import { ACCESS_TOKEN } from '../../constants';

type TListener = (data: { [props: string]: any }) => void;

interface IMsg {
  content: string;
  user: string;
}

/**
 * 实现sendMsg方法可把数据通过interview类实例化的socket发送给服务端；
 * 并监听socket message事件，数据类型为chat，则把数据保存到messages属性中用以展示
 */
class ChatManager {
  interview: Interview;

  @observable
  messages: IMsg[] = [];

  @observable
  currentMsg: string = '';

  listener: TListener | null = null;

  get socket() {
    return this.interview.socket;
  }

  @action
  setCurrentMsg(v: string) {
    this.currentMsg = v;
  }

  @action
  setMessages(v: IMsg[]) {
    this.messages = v;
  }

  @action
  addMessage(v: IMsg) {
    this.setMessages([...this.messages, v]);
  }

  addListeners(v: TListener) {
    this.listener = v;
  }

  send(data: any = {}) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    this.socket?.send(
      JSON.stringify({
        event: 'chat',
        data: {
          token: token,
          scope: this.interview.currentInterview?.id,
          data,
        },
      }),
    );
  }

  sendMsg = () => {
    this.send({
      content: this.currentMsg,
    });
  };

  init() {
    this.socket!.addEventListener('message', async (ev: MessageEvent) => {
      const message = JSON.parse(ev.data);

      const { event, data } = message;

      if (event === 'chat') {
        this.listener?.(data);
        this.addMessage({
          content: data.content,
          user: 'peer',
        });
      }
    });
  }

  constructor(interview: Interview) {
    this.interview = interview;
    makeAutoObservable(this);
  }
}

export default ChatManager;
