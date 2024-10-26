import React from 'react';
import { notification } from 'antd';
import Constant from './Constant';

function error(params: { description: string, message?: string, duration?: number }) {
  notification.destroy();
  const closeIcon = <div></div>
  notification.error({
    placement: 'topRight',
    description: params.description,
    message: params.message,
    duration: params.duration ? params.duration : Constant.notificationDuration,
    // closeIcon: closeIcon,
    showProgress: true,
    pauseOnHover: false
  });
}

function success(params: { description: string, message?: string, duration?: number }) {
  notification.destroy();
  const closeIcon = <div></div>
  notification.success({
    placement: 'topRight',
    description: params.description,
    message: params.message,
    duration: params.duration ? params.duration : Constant.notificationDuration,
    // closeIcon: closeIcon
    showProgress: true,
    pauseOnHover: false
  });
}

function warn(params: { description: string, message?: string, duration?: number }) {
  notification.destroy();
  const closeIcon = <div></div>
  notification.warning({
    placement: 'topRight',
    description: params.description,
    message: params.message,
    duration: params.duration ? params.duration : Constant.notificationDuration,
    // closeIcon: closeIcon
    showProgress: true,
    pauseOnHover: false
  });
}

function info(params: { description: string, message?: string, duration?: number }) {
  notification.destroy();
  const closeIcon = <div></div>
  notification.info({
    placement: 'topRight',
    description: params.description,
    message: params.message,
    duration: params.duration ? params.duration : Constant.notificationDuration,
    // closeIcon: closeIcon
    showProgress: true,
    pauseOnHover: false
  });
}


export default {
  error, success, warn, info
};
