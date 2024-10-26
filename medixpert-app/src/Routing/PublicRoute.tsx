
import React from 'react';
import { useLocation ,Navigate } from 'react-router-dom';
import RoutesPath from '../Global/Routes';
import authStore from '../Store/authStore';
import globalStore from '../Store/globalStore';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const currentUser = authStore.currentUser;
  const accessPages = authStore.currentUser?.accessPages;

  if (currentUser != null && (accessPages && accessPages?.length > 0)) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.

    return <Navigate to={accessPages?.[0]?.route} state={{ from: location }} replace />;
  }

  return children;
};

export default PublicRoute;
