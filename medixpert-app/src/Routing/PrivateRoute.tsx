import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import RoutesPath from '../Global/Routes';
import authStore from '../Store/authStore';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const currentUser = authStore.currentUser;

  if (currentUser === null) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return (
      <Navigate to={RoutesPath.login} state={{ from: location }} replace />
    );
  }

  return children;
};

export default PrivateRoute;
