import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
import 'moment-timezone';
import { Col, Row, Tooltip } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import globalStore from '../../Store/globalStore';

const DateTime = () => {
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

  if (!timezone) return <div>z</div>;

  return (
    <div 
      style={{ 
        fontSize: '1rem' ,
        color: globalStore.darkTheme ? '#9c9c9c' : '#6c6c6c',
        fontWeight: 600,
        marginBottom: 10
      }}
    >
      <Row gutter={0}>
        <Col lg={24} style={{ textAlign: 'right' }}>
          <Tooltip title={timezone}>
            <CalendarOutlined style={{ marginRight: 6 }} />
            <Moment format="ddd DD, MMM YYYY" tz={timezone} 
            style={{ marginRight: 10 }}>
                {currentTime}
            </Moment>
            <ClockCircleOutlined style={{ marginRight: 6 }} />
            <Moment format="hh:mm:ss A" tz={timezone} >
              {currentTime}
            </Moment>
          </Tooltip>
        </Col>
      </Row>
      
    </div>
  );
};

export default DateTime;
