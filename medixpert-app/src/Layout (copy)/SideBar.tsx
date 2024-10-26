import { Menu, Button, Skeleton, Avatar, Tooltip, MenuProps, Grid } from "antd";
import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import globalStore from "../Store/globalStore";
import authStore from "../Store/authStore";
import accessPagesStore from "../Store/accessPagesStore";
import Notification from "../Global/Notification";
import { t } from "i18next";
import Icon from "../Components/Icon"
import Constant from "../Global/Constant";
import logo from "../Assets/media/images/img-logo.jpg";
import { AppstoreOutlined, ContainerOutlined, MailOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

interface SideBarProps {
    color: string;
    accessPages: Pages[] | [];
    loading: boolean;
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

const { useBreakpoint } = Grid;
  
const SideBar: React.FC<SideBarProps> = ({ color, accessPages, loading }) => {
  
  const transformAccessPagesToMenuItems = (pages: Pages[]) => {
    return pages && pages.length > 0 ? pages.map(page => ({
        key: page._id,
        label: <>
                {page.subPages && page.subPages.length > 0 ?
                  <span>
                    {page.name}
                  </span>
                  :
                  <span style={{ marginTop: '-20px' }}>
                    <NavLink to={page.route}>
                      {page.name}
                    </NavLink>
                  </span>
                }
              </>,
        icon: !collapse ? <span style={{ marginLeft: page.subPages && page.subPages.length > 0 ? '-14px' : '-10px' }}>
                <Icon name={page.icon} size='2em' />
              </span> :
              <span style={{ marginLeft: '-5px', marginTop: '3px' }}>
                <Icon name={page.icon} size='2em' />
              </span>,
        children: page.subPages && page.subPages.length > 0 ? page.subPages.map(subPage => ({
            key: subPage._id,
            label: <>
                    <span style={{ marginTop: '-20px' }}>
                      <NavLink to={page.route+''+subPage.route}>
                        {subPage.name}
                      </NavLink>
                    </span>
                  </>,
            icon: !collapse ? <span style={{ marginLeft: '-18px' }}>
                    <Icon name={subPage.icon} size='2em' />
                  </span> :
                  <span>
                    <Icon name={subPage.icon} size='2em' />
                  </span>,
        })) : undefined,
    })) : [];
  };

  const { pathname } = useLocation();
  const currentPage = pathname;
  const screens = useBreakpoint();

  const [collapse, setCollapse] = useState<boolean>(
    localStorage.getItem('mx-sidenavCollapse') === 'true'
  );
  
  useEffect(() => {
    const layoutElement = document.querySelector('.layout-dashboard .ant-layout') as HTMLElement;
    const asideElement = document.querySelector('.ant-layout-sider') as HTMLElement;
    if (screens.lg) {
      if (globalStore.collapse) {
        layoutElement.style.marginLeft = '100px';
        asideElement.style.overflow = 'hidden';
      } else {
        layoutElement.style.marginLeft = '250px';
      }
    }
  }, [collapse, globalStore.collapse, screens.lg]);

  const handleCollapseSidebar = async () => {
    const sidenavCollapse = await localStorage.getItem('mx-sidenavCollapse') === 'true';
    await setCollapse(!sidenavCollapse);
    await globalStore.setCollapse(!sidenavCollapse);
    if (sidenavCollapse) {
      localStorage.removeItem('mx-sidenavCollapse');
    } else {
      localStorage.setItem('mx-sidenavCollapse', 'true');
    }
  };

  const items: MenuItem[] = transformAccessPagesToMenuItems(accessPages);

  return (
    <>
      {screens.lg ? (
        <>
          <div className="brand">
            {loading ? (
              <>
                <Skeleton.Avatar active size="default" shape="square" />
                &nbsp;&nbsp;
                <Skeleton.Node active style={{ height: '20px' }} />
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {collapse ? 
                      <Tooltip placement="right" title={Constant.appName}>
                        <Avatar 
                          shape="square" 
                          src={<img src={logo} alt="logo" />} 
                          alt="logo" 
                        />
                      </Tooltip>
                    : <>
                        <Avatar 
                          shape="square" 
                          src={<img src={logo} alt="logo" />} 
                          alt="logo" 
                        />&nbsp;
                        <span>{Constant.appName}</span>
                      </>
                  }
                </div>
                <div>
                  {collapse 
                  ? <MenuUnfoldOutlined onClick={handleCollapseSidebar} /> : 
                    <MenuFoldOutlined onClick={handleCollapseSidebar} />
                  }
                </div>
              </div>
            )}
          </div>
          <hr />
          {
            loading ? (
              <Menu
                theme="light"
                mode="inline"
                className="aside-menu"
                items={Array.from({ length: 10 }).map((_, index) => ({
                  key: index.toString(),
                  label: (
                    <NavLink to="/">
                      <span className="icon" style={{ background: 'transparent' }}>
                        <Skeleton.Avatar active size="small" shape="circle" />
                      </span>
                      <span className="label">
                        <Skeleton.Node active style={{ height: '20px' }} />
                      </span>
                    </NavLink>
                  )
                }))}
              />
            ) : accessPages && accessPages.length > 0 ? ( //ja
              // <Menu theme="dark" mode="inline" className="aside-menu"
              // items={accessPages.map(page => ({
              //   key: page._id,
              //   label: (
              //     <>
              //       <NavLink to={page.route}>
              //         <span
              //           className="icon"
              //           style={{
              //             background: currentPage === page.route ? color : '',
              //           }}
              //         >
              //           <Icon name={page?.icon} />
              //         </span>
              //         {collapse ? 
              //           <span className="label" style={{ color: '#fff' }}>{page.name}</span> : 
              //           <span className="label">{page.name}</span>
              //         }
              //       </NavLink>
              //     </>
              //   ),
              // }))}
              // />
              <>
                <Menu
                  mode="inline"
                  theme="light"
                  // inlineCollapsed
                  items={items}
                />
              </>
            ) : (
              <div className="aside-footer" style={{ paddingTop: 0 }}>
                <div
                  className="footer-box"
                  style={{
                    background: color,
                    height: '75vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span className="icon" style={{ color }}>
                      <Icon name="MehOutlined" />
                    </span>
                    <h6>Sorry !</h6>
                    <p>You do not have any access.</p>
                  </div>
                  <Button type="primary" className="ant-btn-sm ant-btn-block">
                    Contact Manager
                  </Button>
                </div>
              </div>
            )
          }
        </>
      ) : (
        <>
          <Menu
            mode="inline"
            theme="light"
            // inlineCollapsed
            items={items}
          />
        </>
      )}
    </>
  );
}

export default inject('globalStore')(observer(SideBar));
