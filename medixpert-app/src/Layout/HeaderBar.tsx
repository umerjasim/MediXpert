import React, { useState } from 'react';
import {
  BellFilled,
  EditOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonFilled,
  SearchOutlined,
  SettingFilled,
  SunFilled,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Drawer, Dropdown, Input, Layout, Menu, 
  MenuProps, Space, Switch, Tooltip, Typography, theme } from 'antd';
import globalStore from '../Store/globalStore';
import { inject, observer } from 'mobx-react';
import { IconButton } from '@mui/material';
import MuiAvatar from '@mui/material/Avatar';
import authStore from '../Store/authStore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Meta from 'antd/es/card/Meta';
import { t } from 'i18next';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Translate from '../Components/Translate';
import { useLocation } from 'react-router-dom';

interface HeaderBarProps {
  collapse: boolean;
  handleCollapse: () => void;
  name: string;
  subName: string;
}

const { Text, Title } = Typography;

const HeaderBar: React.FC<HeaderBarProps> = ({
  collapse,
  handleCollapse,
  name,
  subName,
}) => {

  const user = authStore.currentUser;
  const screens = globalStore.screenSize;

  const [settingDrawerOpen, setSettingDrawerOpen] = useState<boolean>(false);

  const handleSettingDrawer = () => {
    setSettingDrawerOpen(true);
  };

  const onModeChange = (checked: boolean) => {
    if (checked) {
        localStorage.setItem('mx-darkMode', 'true');
    } else {
        localStorage.removeItem('mx-darkMode');
    }
    globalStore.setDarkTheme(checked);
  }

  const items: MenuProps['items'] = [
    {
      label: <>
              <Card
              className="profile-card"
              style={{ width: 150, textAlign: 'center' }}
              cover={
                <MuiAvatar
                  alt={user?.name?.first}
                  src={user?.picture || ''}
                  style={{
                    height: '100px',
                    objectFit: 'cover',
                    width: '100%'
                  }}
                >
                  <AccountCircleIcon sx={{ fontSize: '75px', mt: '12px' }} />
                </MuiAvatar>
              }
              actions={[<Space><EditOutlined key="edit" />{t('editProfileText')}</Space>]}
              >
                <Meta title={
                  <Text className="subtitle" >
                    {user?.name?.first+' '+user?.name?.last}
                  </Text>
                } description={<span style={{ fontSize: '12px' }}>{user?.roleName}</span>} />
              </Card>
            </>,
      key: '0',
    },
    {
      type: 'divider',
    },
    {
      label: t('signoutText'),
      key: '3',
      onClick: async () => {
        await authStore.signOut();
      },
      icon: <LogoutOutlined />
    },
  ];

  return (
    <>
      <Drawer
          title={
            <Title level={5} style={{ margin: 0 }}>
              {t('configuratorText')} <br />
              <Text className="subtitle" 
              style={{
                display: 'block',
                fontWeight: 'normal',
                color: '#8c8c8c',
                fontSize: '14px'
              }}>
                {t('configureOptionsText')}
              </Text>
            </Title>
          }
          placement='right'
          closable={true}
          onClose={() => setSettingDrawerOpen(false)}
          open={settingDrawerOpen}
          key='right'
          width={300}
          mask={true}
        >
          <div>
            <Title level={5} style={{ marginTop: 0 }}>
              {t('languageText')}
              <Tooltip title={t('selectLanguageText')}>
                <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14 }} />
              </Tooltip>
            </Title>
            <Translate />
          </div>
          <div style={{ marginTop: 25 }}>
            <Title level={5} style={{ marginTop: 0 }}>
              {t('modeText')}
              <Tooltip title={t('switchDarkLightInfoText')}>
                <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14 }} />
              </Tooltip>
            </Title>
            <div>
              <Switch
                checked={globalStore.darkTheme} 
                onChange={onModeChange}
                checkedChildren={<MoonFilled twoToneColor={'black'} />}
                unCheckedChildren={<SunFilled />}
              />
            </div>
          </div>
        </Drawer>
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {!screens.lg && !screens.md && (
            <Button
              type="text"
              icon={collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={handleCollapse}
              style={{
                marginLeft: screens.lg || screens.md ? undefined : 10
              }}
            />
          )}
          {/* <span style={{ marginLeft: 20, fontSize: 18, fontWeight: 700 }}>
            {subName.replace("/", "")}
          </span> */}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 10 }}>
          <div style={{ marginRight: 0, marginLeft: 15 }}>
            <Input
              className="header-search"
              placeholder={t('searchText')}
              prefix={<SearchOutlined />}
            />
          </div>
          <div>
            <IconButton >
              <Badge size="small" count={4}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </div>
          <div>
            <IconButton 
            style={{ color: globalStore.darkTheme ? '#d4d4d4' : undefined }}
            onClick={handleSettingDrawer}
            >
              <SettingFilled />
            </IconButton>
          </div>
          <div>
            <Dropdown menu={{ items }} trigger={['click']}>
              <IconButton>
                <MuiAvatar src={user?.picture || ''}>
                  <AccountCircleIcon />
                </MuiAvatar>
              </IconButton>
            </Dropdown>
          </div>
        </div>
      </div>
    </>
  );
};

export default inject('globalStore')(observer(HeaderBar));