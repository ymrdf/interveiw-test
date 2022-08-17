import { useLocation, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import profileStore from '../module/profile/store';

export const RequireAuth = observer(
  ({ children }: { children: JSX.Element }) => {
    let location = useLocation();

    if (!profileStore.user) {
      // Redirect them to the /login page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
  },
);
