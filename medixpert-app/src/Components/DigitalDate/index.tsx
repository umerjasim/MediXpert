import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
import 'moment-timezone';
import { Tooltip } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const DigitalDate = () => {
  const [timezone, setTimezone] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  useEffect(() => {
    const fetchTimezone = () => {
      const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(serverTimezone);
    };

    fetchTimezone();

    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!timezone) return <div></div>;

  return (
    <div 
      style={{ 
        fontSize: '1rem' ,
        color: '#6c6c6c',
        fontWeight: 600,
        marginBottom: 10
      }}
    >
        <Tooltip title={timezone}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            <Moment format="ddd DD, MMM YYYY" tz={timezone}>
                {currentTime}
            </Moment>
        </Tooltip>
    </div>
  );
};

export default DigitalDate;