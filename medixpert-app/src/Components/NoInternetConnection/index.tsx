import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Notification from "../../Global/Notification";

const NoInternetConnection = (props: any) => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (isOnline) {
    return props.children;
  } else {
    Notification.warn({
      description: t('noInternet'),
      message: t('warning'),
    });
    return null;
  }
};

export default NoInternetConnection;