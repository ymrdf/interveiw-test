import { useState, ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Input, message } from 'antd';
import { useNavigate } from 'react-router';
import profileStore from '../../module/profile/store';
import interviewStore from '../../module/interview/store';

import './style.scss';
import 'antd/es/input/style/css';

const Profile = observer(() => {
  const [interviewId, setInterview] = useState('');
  const navigate = useNavigate();
  const createInterview = async () => {
    const res = await interviewStore.createInterview();
    if (res) {
      navigate(`/interview/${res.id}`);
    }
  };
  const interInterview = async () => {
    try {
      const res = await interviewStore.interInterview(interviewId);
      if (res.interviewId) {
        navigate(`/interview/${res.interviewId}`);
      }
    } catch (e: any) {
      message.error(e.msg);
    }
  };
  const interInterviewAsInterviewer = async () => {
    try {
      const res = await interviewStore.interInterviewAsInterviewer(interviewId);
      if (res.interviewId) {
        navigate(`/interview/${res.interviewId}`);
      }
    } catch (e: any) {
      message.error(e.msg);
    }
  };
  return (
    <div className="Profile-container">
      <div className="info">{profileStore.user?.username}</div>
      <div className="operation">
        <Input
          value={interviewId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInterview(e.target.value)
          }
        ></Input>
        <Button onClick={createInterview}>create interview</Button>
        <Button onClick={interInterview}>inter interview</Button>
        <Button onClick={interInterviewAsInterviewer}> interviewer back</Button>
      </div>
    </div>
  );
});

export default Profile;
