import React, { ChangeEvent, useEffect } from 'react';
import { Button, Input } from 'antd';
import { observer } from 'mobx-react-lite';
import ChatManager from '../../module/interview/chat';

const { TextArea } = Input;

interface IProps {
  chatManager: ChatManager;
}

const Chat = observer(({ chatManager }: IProps) => {
  useEffect(() => {
    chatManager.init();
  }, []);
  console.log(chatManager);
  return (
    <div>
      <div>
        {chatManager.messages.map((item) => {
          return (
            <div>
              {item.user}:{item.content}
            </div>
          );
        })}
      </div>
      <TextArea
        rows={4}
        onChange={(v: ChangeEvent<HTMLTextAreaElement>) =>
          chatManager.setCurrentMsg(v.target.value)
        }
      />
      <Button onClick={chatManager.sendMsg}>send</Button>
      <video id="localVideo" autoPlay playsInline controls={false} />
    </div>
  );
});

export default Chat;
