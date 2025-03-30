import React, { ReactNode, useEffect, useState } from 'react';
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Button, Col, ConfigProvider, Grid, Layout, Menu, Row, theme, 
  Typography, App as AntdApp, } from 'antd';
import SideBar from './SideBar';
import authStore from '../Store/authStore';
import { useLocation } from 'react-router-dom';
import accessPagesStore from '../Store/accessPagesStore';
import globalStore from '../Store/globalStore';
import Constant from '../Global/Constant';
import Notification from '../Global/Notification';
import { t } from 'i18next';
import HeaderBar from './HeaderBar';
import { inject, observer } from 'mobx-react';
import DateTime from '../Components/DateTime';
import { NavLink } from 'react-router-dom';
import branchStore from '../Store/branchStore';
import NotificationProvider from '../Global/NotificationProvider';

const { Header, Sider, Content } = Layout;
const { Link } = Typography;

interface MainProps {
  children: ReactNode;
}

type Pages = {
  subPages: Pages[] | [];
  _id: string;
  name: string;
  title: string;
  route: string;
  icon: string;
};

const { useBreakpoint } = Grid;

const Main: React.FC<MainProps> = ({ children }) => {
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const user = authStore.currentUser ?? {};
  const { pathname } = useLocation();
  const screens = useBreakpoint();

  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [placement, setPlacement] = useState<"right" | "left">("right");
  const [sidenavColor, setSidenavColor] = useState<string>(
    localStorage.getItem('mx-sidenavColor') || "#1890ff"
  );
  const [sidenavType, setSidenavType] = useState<string>(
    localStorage.getItem('mx-sidenavType') || "transparent"
  );
  const [fixed, setFixed] = useState<boolean>(
    localStorage.getItem('mx-fixedNavebar') === 'true'
  );
  const [accessPages, setAccessPages] = useState<Pages[] | []>(accessPagesStore?.accessPages as Pages[]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [joinedPath, setJoinedPath] = useState<string>('');

  useEffect(() => {
    globalStore.setScreenSize({
      lg: screens.lg,
      md: screens.md,
      sm: screens.sm,
      xl: screens.xl,
      xs: screens.xs,
      xxl: screens.xxl,
    });
  }, [screens, globalStore]);
  
  useEffect(() => {
    getAccessPages();
    getBranches();
  }, [user]);

  useEffect(() => {
    const segments = pathname.split('/').filter(segment => segment);
    const lastPath = `/${segments[segments.length - 1]}`;
    const joinedPath = `/${segments.join(' / ')}`;
    const subPage = accessPages?.flatMap(page => page.subPages).find(subPage => subPage.route === lastPath);
    const homePage = subPage || accessPages?.find(page => page.route === lastPath);
    const homePageName = homePage?.title || Constant.appName;
    setPageTitle(homePage?.title || '');
    setJoinedPath(joinedPath);
    if (homePageName) {
      document.title = homePageName;
    }
  }, [user, pathname, accessPages]);

  const getBranches = async () => {
    globalStore.setLoading(true);
    try {
        await branchStore.getBranches();
    } catch (error) {
        Notification.error({
            message: t('error'),
            description: t('defaultErrorMessage')
        });
    } finally {
        setTimeout(() => {
            globalStore.setLoading(false);
        }, 500);
    }
  };

  const getAccessPages = async () => {
    globalStore.setLoading(true);
    try {
      await accessPagesStore.getAccessPages(user);
      setAccessPages(accessPagesStore?.accessPages as Pages[]);
    } catch (error: any) {
        Notification.error({
            description: error,
            message: t('error')
        });
    } finally {
      setTimeout(() => {
        setLoading(false);
        globalStore.setLoading(false);
      }, 500);
    }
  };

  const openDrawer = () => setVisible(!visible);
  const handleSidenavType = (type: string) => {
    setSidenavType(type);
    localStorage.setItem('mx-sidenavType', type);
  };
  const handleSidenavColor = (color: string) => {
    setSidenavColor(color);
    localStorage.setItem('mx-sidenavColor', color);
  };
  const handleFixedNavbar = (fixed: boolean) => {
    setFixed(fixed);
    localStorage.setItem('mx-fixedNavebar', fixed.toString());
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
    globalStore.setCollapse(!collapsed);
    if (collapsed) {
      localStorage.setItem('mx-sideCollapse', 'true');
    } else {
      localStorage.removeItem('mx-sideCollapse');
    }
  }

  return (
    <ConfigProvider
    theme={{
      algorithm: globalStore.darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
    }}
    >
        <AntdApp>
          <NotificationProvider>
            <Layout>
              {screens.lg || screens.md ? (
                <Sider
                  breakpoint="lg"
                  // collapsedWidth="0"
                  theme={globalStore.darkTheme ? 'dark' : 'light'}
                  onBreakpoint={(broken) => {
                    console.log('broken');
                  }}
                  onCollapse={(collapsed, type) => {
                    setCollapsed(collapsed);
                  }}
                  style={{ 
                    overflow: 'auto', 
                    background: globalStore.darkTheme ? undefined : '#fff'
                  }}
                  collapsible 
                  collapsed={collapsed}
                  width={260}
                >
                  <SideBar
                    accessPages={accessPages}
                    color=''
                    loading
                    collapse={collapsed}
                    setCollapse={setCollapsed}
                  />
                </Sider>
              ) : (
                <SideBar
                  accessPages={accessPages}
                  color=''
                  loading
                  collapse={collapsed}
                  setCollapse={setCollapsed}
                />
              )}
              <Layout>
                <Header 
                style={{ 
                  padding: 0,
                  background: globalStore.darkTheme ? undefined : '#fff',
                }}
                >
                  <HeaderBar 
                  collapse={collapsed}
                  handleCollapse={handleCollapse}
                  name={joinedPath}
                  subName={pageTitle}
                  />
                </Header>
                <Content
                  style={{
                    // margin: '8px 16px 24px 16px',
                    padding: '2px 12px 12px 12px',
                    minHeight: 'calc(100vh - 66px)',
                    height: 'calc(100vh - 66px)',
                    overflowY: 'auto',
                    // background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                  }}
                > 
                  <div style={{
                    margin: '8px 16px 24px 16px'
                  }}
                  >
                    <Row gutter={0} style={{ marginBottom: 10 }}>
                      <Col lg={16}>
                        <div style={{ textTransform: "capitalize", fontSize: 18, fontWeight: 600 }}>
                          {pageTitle.replace("/", "")}
                        </div>
                        <Breadcrumb
                          items={[
                              {
                                  title: (
                                      <Link href='/dashboard' style={{ cursor: 'pointer' }}>
                                          <HomeOutlined />
                                      </Link>
                                  ),
                              },
                              ...pathname
                                  .split('/')
                                  .filter(segment => segment)
                                  .map(part => ({
                                      title: part
                                          .split('-')
                                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                          .join(' '),
                                  })),
                          ]}
                        />
                      </Col>
                      <Col lg={8}>
                        <DateTime />
                      </Col>
                    </Row>
                    {children}
                  </div>
                </Content>
              </Layout>
            </Layout>
          </NotificationProvider>
        </AntdApp>
    </ConfigProvider>
  );
};

export default inject('globalStore')(observer(Main));