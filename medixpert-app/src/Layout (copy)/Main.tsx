import { useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Layout, Drawer, Affix, Grid } from "antd";
import Sidenav from "./SideBar";
import Header from "./Header";
import Footer from "./Footer";
import accessPagesStore from "../Store/accessPagesStore";
import Constant from "../Global/Constant";
import authStore from "../Store/authStore";
import Notification from "../Global/Notification";
import { t } from "i18next";
import globalStore from "../Store/globalStore";
import { inject, observer } from "mobx-react";

const { Header: AntHeader, Content, Sider } = Layout;

const { useBreakpoint } = Grid;

interface MainProps {
    children: ReactNode;
}

type Pages = {
  _id: string;
  name: string;
  title: string;
  route: string;
  icon: string;
  subPages: Pages[] | [];
};

const Main: React.FC<MainProps> = ({ children }) => {
  const user = authStore.currentUser ?? {};
  const { pathname } = useLocation();
  const screens = useBreakpoint();

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
    globalStore.setScreenSize(screens);
  }, [screens]);
  
  useEffect(() => {
    getAccessPages();
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

  return (
    <Layout
      className={`layout-dashboard ${
        pathname === "profile" ? "layout-profile" : ""
      } ${pathname === "rtl" ? "layout-dashboard-rtl" : ""}`}
    >
      <Drawer
        title={false}
        placement={placement === "right" ? "left" : "right"}
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}
        key={placement === "right" ? "left" : "right"}
        width={250}
        className={`drawer-sidebar ${
          pathname === "rtl" ? "drawer-sidebar-rtl" : ""
        } `}
      >
        <Layout
          className={`layout-dashboard ${
            pathname === "rtl" ? "layout-dashboard-rtl" : ""
          }`}
        >
          <Sider
            trigger={null}
            width={250}
            theme="light"
            className={`sider-primary ant-layout-sider-primary ${
              sidenavType === "#fff" ? "active-route" : ""
            }`}
            style={{ background: sidenavType }}
          >
            <Sidenav 
            color={sidenavColor}
            accessPages={accessPages}
            loading={loading}
            />
          </Sider>
        </Layout>
      </Drawer>
      <Sider
        breakpoint="lg"
        collapsedWidth="100px"
        collapsed={globalStore.collapse}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
        trigger={null}
        width={250}
        theme="light"
        className={`sider-primary ant-layout-sider-primary ${
          sidenavType === "#fff" ? "active-route" : ""
        }`}
        style={{ background: sidenavType }}
      >
        {screens.lg && (
          <Sidenav 
          color={sidenavColor} 
          accessPages={accessPages}
          loading={loading}
          />
        )}
      </Sider>
      <Layout>
        {fixed ? (
          <Affix>
            <AntHeader className={`${fixed ? "ant-header-fixed" : ""}`}>
              <Header
                placement="right"
                onPress={openDrawer}
                name={joinedPath}
                subName={pageTitle}
                handleSidenavColor={handleSidenavColor}
                handleSidenavType={handleSidenavType}
                handleFixedNavbar={handleFixedNavbar}
                loading={loading}
              />
            </AntHeader>
          </Affix>
        ) : (
          <AntHeader className={`${fixed ? "ant-header-fixed" : ""}`}>
            <Header
              placement="right"
              onPress={openDrawer}
              name={joinedPath}
              subName={pageTitle}
              handleSidenavColor={handleSidenavColor}
              handleSidenavType={handleSidenavType}
              handleFixedNavbar={handleFixedNavbar}
              loading={loading}
            />
          </AntHeader>
        )}
        <Content className="content-ant">{children}</Content>
        <Footer />
      </Layout>
    </Layout>
  );
}

export default inject('globalStore')(observer(Main));