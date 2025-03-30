// Global/Notification.tsx

import type { NotificationInstance } from 'antd/es/notification/interface';
import Constant from './Constant';

let apiRef: NotificationInstance | null = null;

export function overrideApi(api: NotificationInstance) {
  apiRef = api;
}

function notify(
  type: 'error' | 'success' | 'warning' | 'info',
  params: { description: string; message?: string; duration?: number }
) {
  if (!apiRef) return;

  const duration = params.duration ?? Constant.notificationDuration;
  const config = {
    placement: 'topRight' as const,
    description: params.description,
    message: params.message,
    duration,
    showProgress: true,
    pauseOnHover: false,
  };

  apiRef[type](config);
}

export default {
  error: (params: Parameters<typeof notify>[1]) => notify('error', params),
  success: (params: Parameters<typeof notify>[1]) => notify('success', params),
  warn: (params: Parameters<typeof notify>[1]) => notify('warning', params),
  info: (params: Parameters<typeof notify>[1]) => notify('info', params),
  overrideApi,
};
