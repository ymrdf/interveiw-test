import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from 'antd';
import { useParams } from 'react-router';
import profileStore from '../../module/profile/store';
import interviewStore from '../../module/interview/store';
import Editor from '../../component/editor';
import Chat from '../../component/chat';
// import { LogsContainer } from '../../component/logs';

import './style.scss';

const Profile = observer(() => {
  const params = useParams();

  useEffect(() => {
    interviewStore.queryInterview(params.id!);
  }, []);
  return (
    <div className="Interview-container">
      <div className="info">
        myname: {profileStore.user?.username}
        interview:{' '}
        {interviewStore.currentInterview?.name ||
          interviewStore.currentInterview?.id}
      </div>
      <div>
        <video id="remoteVideo" autoPlay playsInline controls={false} />
        <video id="localVideo" autoPlay playsInline controls={false} />
        <Button onClick={() => interviewStore.initWebrtc()}>init rtc</Button>
        <Button onClick={() => interviewStore.call()}>call rtc</Button>
      </div>
      <div>
        <Chat chatManager={interviewStore.chatManager}></Chat>
      </div>

      <div className="operation">
        <Editor interviewId={params.id!} />
        {/* <LogsContainer /> */}
      </div>
    </div>
  );
});

export default Profile;
