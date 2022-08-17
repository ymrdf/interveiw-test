import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from 'antd';
import { useParams } from 'react-router';
import profileStore from '../../module/profile/store';
import interviewStore from '../../module/interview/store';
import Editor from '../../component/editor';

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
      <div className="operation">
        <Editor interviewId={params.id!} />
      </div>
    </div>
  );
});

export default Profile;
