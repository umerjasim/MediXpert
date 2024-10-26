import React from 'react';
import { Navigate, useLocation  } from 'react-router-dom';
import RoutesPath from '../Global/Routes';
import authStore from '../Store/authStore';

type AccessRouteData = {
  access: string;
  children: JSX.Element;
}
const AccessRoute = (props: AccessRouteData) => {
  const {children , access} = props;
  const location = useLocation();
  const currentUser = authStore.currentUser;

  const pageAccess = currentUser?.accessPages?.some(page => page.route === access);

  // if (!pageAccess) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    // return <Navigate to={RoutesPath.noAccess} state={{ from: location }} replace />;
  // }

  return children;
};

export default AccessRoute;

