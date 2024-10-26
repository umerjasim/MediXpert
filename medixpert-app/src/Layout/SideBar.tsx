import React, { useEffect, useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Divider, Drawer, Layout, Menu, MenuProps, Tooltip, Typography, theme } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from "../Components/Icon"
import Constant from '../Global/Constant';
import logo from "../Assets/media/images/img-logo.jpg";
import { inject, observer } from 'mobx-react';
import globalStore from '../Store/globalStore';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

interface SideBarProps {
  color: string;
  accessPages: Pages[] | [];
  loading: boolean;
  collapse: boolean;
  setCollapse: (collapse: boolean) => void
}

type Pages = {
  subPages: Pages[] | [];
  _id: string;
  name: string;
  title: string;
  route: string;
  icon: string;
};

type MenuItem = Required<MenuProps>['items'][number];

const { Title } = Typography;

const SideBar: React.FC<SideBarProps> = ({ 
  color, 
  accessPages, 
  loading,
  collapse,
  setCollapse
}) => {

  const { pathname } = useLocation();
  const pathArray = pathname.split('/').filter(part => part !== undefined).map(part => `/${part}`);
  const screens = globalStore.screenSize;
  const { i18n } = useTranslation();

  const [routes, setRoutes] = useState<string[] | undefined>(pathArray);

  useEffect(() => {
    i18n.changeLanguage(globalStore.language);
  }, [globalStore.language]);

  useEffect(() => {
    const pathArray = pathname.split('/').filter(Boolean).map(part => `/${part}`);
    setRoutes(pathArray);
  }, [pathname]);

  const menuItems = (pages: Pages[]) => {
    return pages && pages.length > 0 ? pages.map(page => ({
        key: page.route,
        label: <>
                {page.subPages && page.subPages.length > 0 ?
                  <span>
                    {page.name}
                  </span>
                  :
                  <span>
                    <NavLink to={page.route}>
                      {page.name}
                    </NavLink>
                  </span>
                }
              </>,
        icon: <span>
                <Icon name={page.icon} />
              </span>,
        children: page.subPages && page.subPages.length > 0 ? page.subPages.map(subPage => ({
            key: subPage.route,
            label: <span>
                      <NavLink to={page.route+''+subPage.route}>
                        {subPage.name}
                      </NavLink>
                    </span>,
            icon: <span>
                    <Icon name={subPage.icon} />
                  </span>,
        })) : undefined,
    })) : [];
  };

  const items: MenuItem[] = menuItems(accessPages);

  return (
    <>
    {screens.lg || screens.md ? (
      <>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px 10px 10px 20px',
          height: 64
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {collapse ? 
                <Tooltip placement="right" title={t('appName')}>
                  <Avatar 
                    shape="square" 
                    src={<img src={logo} alt="logo" />} 
                    alt="logo" 
                    size='large'
                  />
                </Tooltip>
              : <>
                  <Avatar 
                    shape="square" 
                    src={<img src={logo} alt="logo" />} 
                    alt="logo" 
                    size='large'
                  />&nbsp;&nbsp;
                </>
            }
            <span className={`transition-container ${collapse ? 'hidden' : 'visible'}`} 
            style={{ 
              fontSize: '1rem', 
              fontWeight: '600',
              color: globalStore.darkTheme ? '#fff' : undefined
              }}>
              {t('appName')}
            </span>
          </div>
        </div>
        <Divider style={{ margin: 0 }} />
        <Menu
          // theme="dark"
          mode="inline"
          defaultSelectedKeys={routes}
          items={items}
          defaultOpenKeys={routes?.slice(0, -1)}
        />
      </>
    ) : (
      <>
        <Drawer
          className='menu-drawer'
          title={
            <>
              <Avatar 
                shape="square" 
                src={<img src={logo} alt="logo" />} 
                alt="logo" 
                size='large'
              />&nbsp;&nbsp;
              <span
              style={{ fontSize: '1rem', fontWeight: '600' }}>
                {t('appName')}
              </span>
            </>
          }
          placement='left'
          closable={false}
          onClose={() => setCollapse(false)}
          open={collapse}
          key='left'
          width={250}
        >
          <Menu
            // theme="dark"
            mode="inline"
            defaultSelectedKeys={routes}
            items={items}
            defaultOpenKeys={routes?.slice(0, -1)}
          />
        </Drawer>
      </>
    )}
    </>
  );
};

export default inject('globalStore')(observer(SideBar));