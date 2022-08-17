import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
import { RequireAuth } from '../auth';
import LoginRegister from '../../pages/login';
import Profile from '../../pages/profile';
import profileStore from '../../module/profile/store';
import InterviewPage from '../../pages/interview';

const App = observer(() => {
  useEffect(() => {
    console.log('effect', window.location);
    if (window.location.pathname !== '/login') {
      profileStore.queryUser();
    }
  }, []);
  return (
    <Spin spinning={profileStore.loading}>
      <div className="app-container">
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={<LoginRegister></LoginRegister>}
            ></Route>
            {profileStore.user && (
              <>
                <Route
                  index
                  element={
                    <RequireAuth>
                      <Profile></Profile>
                    </RequireAuth>
                  }
                ></Route>

                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile></Profile>
                    </RequireAuth>
                  }
                ></Route>

                <Route
                  path="/interview/:id"
                  element={
                    <RequireAuth>
                      <InterviewPage></InterviewPage>
                    </RequireAuth>
                  }
                ></Route>
              </>
            )}
          </Routes>
        </BrowserRouter>
      </div>
    </Spin>
  );
});

export default App;
