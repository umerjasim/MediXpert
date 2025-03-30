// Global/NotificationProvider.tsx

import React, { useEffect } from 'react';
import { App } from 'antd';
import { overrideApi } from './Notification';

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appApi = App.useApp();

  useEffect(() => {
    overrideApi(appApi.notification);
  }, [appApi]);

  return <>{children}</>;
};

export default NotificationProvider;