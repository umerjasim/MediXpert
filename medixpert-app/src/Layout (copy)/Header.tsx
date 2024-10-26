import { useState, useEffect } from "react";

import {
  Row,
  Col,
  Breadcrumb,
  Badge,
  Dropdown,
  Button,
  List,
  Avatar,
  Input,
  Drawer,
  Typography,
  Switch,
  ColorPicker,
  Skeleton,
  MenuProps,
  Card,
  Space,
} from "antd";

import {
  SearchOutlined,
  StarOutlined,
  TwitterOutlined,
  FacebookFilled,
  SettingFilled,
  MenuOutlined,
  LogoutOutlined,
  EditOutlined
} from "@ant-design/icons";

import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { Color } from "antd/es/color-picker";
import Translate from "../Components/Translate";
import MuiAvatar from '@mui/material/Avatar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import authStore from "../Store/authStore";
import Meta from "antd/es/card/Meta";

const ButtonContainer = styled.div`
  .ant-btn-primary {
    background-color: #1890ff;
  }
  .ant-btn-success {
    background-color: #52c41a;
  }
  .ant-btn-yellow {
    background-color: #fadb14;
  }
  .ant-btn-black {
    background-color: #262626;
    color: #fff;
    border: 0px;
    border-radius: 5px;
  }
  .ant-switch-active {
    background-color: #1890ff;
  }
`;

const bell = [
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    key={0}
  >
    <path
      d="M10 2C6.68632 2 4.00003 4.68629 4.00003 8V11.5858L3.29292 12.2929C3.00692 12.5789 2.92137 13.009 3.07615 13.3827C3.23093 13.7564 3.59557 14 4.00003 14H16C16.4045 14 16.7691 13.7564 16.9239 13.3827C17.0787 13.009 16.9931 12.5789 16.7071 12.2929L16 11.5858V8C16 4.68629 13.3137 2 10 2Z"
      fill="#111827"
    ></path>
    <path
      d="M10 18C8.34315 18 7 16.6569 7 15H13C13 16.6569 11.6569 18 10 18Z"
      fill="#111827"
    ></path>
  </svg>,
];

const wifi = [
  <svg
    width="20"
    height="20"
    viewBox="0 0 107 107"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    key={0}
  >
    <g
      id="Page-1"
      stroke="none"
      stroke-width="1"
      fill="none"
      fillRule="evenodd"
    >
      <g id="logo-spotify" fill="#2EBD59" fillRule="nonzero">
        <path
          d="M53.5,0 C23.9517912,0 0,23.9517912 0,53.5 C0,83.0482088 23.9517912,107 53.5,107 C83.0482088,107 107,83.0482088 107,53.5 C107,23.9554418 83.0482088,0.00365063118 53.5,0 Z M78.0358922,77.1597407 C77.0757762,78.7368134 75.0204708,79.2296486 73.4506994,78.2695326 C60.8888775,70.5922552 45.0743432,68.8582054 26.4524736,73.1111907 C24.656363,73.523712 22.8675537,72.3993176 22.458683,70.6032071 C22.0461617,68.8070966 23.1669055,67.0182873 24.9666667,66.6094166 C45.3444899,61.9548618 62.8273627,63.9590583 76.9297509,72.5745479 C78.4995223,73.5419652 78.9996588,75.5899693 78.0358922,77.1597407 L78.0358922,77.1597407 Z M84.5814739,62.5973729 C83.373115,64.5614125 80.8030706,65.1747185 78.8426817,63.9700102 C64.4664961,55.1318321 42.5408052,52.5727397 25.5325145,57.7347322 C23.3275333,58.4027977 20.9984306,57.1579324 20.3267144,54.9566018 C19.6622996,52.7516206 20.9071648,50.4261685 23.1084954,49.7544524 C42.5371546,43.858683 66.6933811,46.7134766 83.2051859,56.8622313 C85.1692255,58.0705902 85.7898328,60.636984 84.5814739,62.5973729 Z M85.1436711,47.4253497 C67.8980894,37.1853292 39.4523712,36.2434664 22.9880246,41.2375299 C20.3449676,42.0406687 17.5485841,40.5475606 16.7490959,37.9045036 C15.9496076,35.2614466 17.4390652,32.4650631 20.0857728,31.6619243 C38.9850904,25.9267827 70.3987718,27.0329239 90.2509041,38.8171614 C92.627465,40.2299556 93.4087001,43.3001365 91.9995565,45.6730467 C90.5940635,48.0532583 87.5165814,48.838144 85.1436711,47.4253497 Z"
          id="Shape"
        ></path>
      </g>
    </g>
  </svg>,
];

const credit = [
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    key={0}
  >
    <path
      fill="#1890FF"
      d="M4 4C2.89543 4 2 4.89543 2 6V7H18V6C18 4.89543 17.1046 4 16 4H4Z"
    ></path>
    <path
      fill="#1890FF"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 9H2V14C2 15.1046 2.89543 16 4 16H16C17.1046 16 18 15.1046 18 14V9ZM4 13C4 12.4477 4.44772 12 5 12H6C6.55228 12 7 12.4477 7 13C7 13.5523 6.55228 14 6 14H5C4.44772 14 4 13.5523 4 13ZM9 12C8.44772 12 8 12.4477 8 13C8 13.5523 8.44772 14 9 14H10C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12H9Z"
    ></path>
  </svg>,
];

const clockicon = [
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    key={0}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM11 6C11 5.44772 10.5523 5 10 5C9.44772 5 9 5.44772 9 6V10C9 10.2652 9.10536 10.5196 9.29289 10.7071L12.1213 13.5355C12.5118 13.9261 13.145 13.9261 13.5355 13.5355C13.9261 13.145 13.9261 12.5118 13.5355 12.1213L11 9.58579V6Z"
      fill="#111827"
    ></path>
  </svg>,
];

const data = [
  {
    title: "New message from Sophie",
    description: <>{clockicon} <span style={{ marginTop: '-2px' }}>2 days ago</span></>,

    // avatar: avtar,
  },
  {
    title: "New album by Travis Scott",
    description: <>{clockicon} <span style={{ marginTop: '-2px' }}>2 days ago</span></>,

    avatar: <Avatar shape="square">{wifi}</Avatar>,
  },
  {
    title: "Payment completed",
    description: <><span>{clockicon}</span> <span style={{ marginTop: '-2px' }}>2 days ago</span></>,
    avatar: <Avatar shape="square">{credit}</Avatar>,
  },
];

const menu = (
  <List
    min-width="100%"
    className="header-notifications-dropdown "
    itemLayout="horizontal"
    dataSource={data}
    renderItem={(item) => (
      <List.Item>
        <List.Item.Meta
          avatar={<Avatar shape="square" src={item.avatar} />}
          title={item.title}
          description={item.description}
        />
      </List.Item>
    )}
  />
);

interface HeaderProps {
  placement: 'top' | 'bottom' | 'left' | 'right';
  name: string;
  subName: string;
  onPress: () => void;
  handleSidenavColor: (color: string) => void;
  handleSidenavType: (type: string) => void;
  handleFixedNavbar: (event: boolean) => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({
  placement,
  name,
  subName,
  onPress,
  handleSidenavColor,
  handleSidenavType,
  handleFixedNavbar,
  loading,
}) => {
  const { Title, Text } = Typography;
  const user = authStore?.currentUser;

  const [visible, setVisible] = useState(false);
  const [sidenavType, setSidenavType] = useState("transparent");
  const [sidenavColor, setSidenavColor] = useState<string>(
    localStorage.getItem('mx-sidenavColor') || '#000'
  );

  useEffect(() => window.scrollTo(0, 0));

  const showDrawer = () => setVisible(true);
  const hideDrawer = () => setVisible(false);

  const handleCustomSidenavColor = (color: Color) => {
    handleSidenavColor(color.toHexString());
    setSidenavColor(color.toHexString());
  };

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
              actions={[<Space><EditOutlined key="edit" />Edit profile</Space>]}
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
      label: 'Sign out',
      key: '3',
      onClick: async () => {
        await authStore.signOut();
      },
      icon: <LogoutOutlined />
    },
  ];

  return (
    <>
      <div className="setting-drwer" onClick={showDrawer}>
        <SettingFilled />
      </div>
      <Row gutter={[24, 0]}>
        <Col span={24} md={6}>
          <div className="ant-page-header-heading">
            <span
              className="ant-page-header-heading-title"
              style={{ textTransform: "capitalize", fontSize: '16px' }}
            >
              {loading ? (
                <Skeleton.Node active style={{ height: '20px' }} />
              ) : (
                <>{subName.replace("/", "")}</>
              )}
            </span>
          </div>
          <Breadcrumb
            items={[
              {
                title: loading ? <Skeleton.Node active style={{ height: '12px' }} /> : <NavLink to="/" style={{ fontSize: '12px' }}>Pages</NavLink>,
              },
              {
                title: loading ? <Skeleton.Node active style={{ height: '12px' }} /> : <span style={{ textTransform: "capitalize", fontSize: '12px' }}>{name.replace("/", "")}</span>,
              },
            ]}
          />
        </Col>
        <Col span={24} md={18} className="header-control">
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button shape="round" icon={
              <MuiAvatar src={user?.picture || ''} sx={{ width: '30px', height: '30px' }}>
                <AccountCircleIcon sx={{ fontSize: '26px', mr: '0px !important' }} />
              </MuiAvatar>
            } style={{ padding: '0 0 0 7px', marginLeft: '15px' }}>
              <span style={{ 
                display: 'inline-block', 
                maxWidth: '75px',
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap'
              }}>
                {/* {user?.name?.first + ' ' + user?.name?.last}<br /> */}
              </span>
            </Button>
          </Dropdown>
          <Badge size="small" count={4}>
            <Dropdown overlay={menu} trigger={["click"]} 
            overlayStyle={{ 
              width: '250px', 
              background: '#fff',
              boxShadow: '0 20px 27px rgb(0 0 0/5%)',
              padding: '8px 16px',
              borderRadius: '12px'
            }}>
              <a
                href="#pablo"
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                {bell}
              </a>
            </Dropdown>
          </Badge>
          <Button type="link" onClick={showDrawer}>
            <SettingFilled />
          </Button>
          <Button
            type="link"
            className="sidebar-toggler"
            onClick={() => onPress()}
          >
            <MenuOutlined />
          </Button>
          <Drawer
            className="settings-drawer"
            mask={true}
            width={300}
            onClose={hideDrawer}
            placement={placement}
            open={visible}
            title={
              <div>
              <Title level={4} style={{ margin: 0 }}>
                Configurator <br />
                <Text className="subtitle" 
                style={{
                  display: 'block',
                  fontWeight: 'normal',
                  color: '#8c8c8c',
                  fontSize: '14px'
                }}>
                  See our dashboard options.
                </Text>
              </Title>
            </div>
            }
          >
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* <div className="header-top">
                <Title level={4}>
                  Configurator
                  <Text className="subtitle">See our dashboard options.</Text>
                </Title>
              </div> */}

              <div className="sidebar-color" style={{ padding: 0 }}>

                <div className="mb-2">
                  <Title level={5} style={{ marginTop: 0 }}>Language</Title>
                  <Translate />
                </div>

                <Title level={5} style={{ marginTop: 0 }}>Sidebar Color</Title>
                <div className="theme-color mb-2">
                  <ButtonContainer>
                    <Button
                      type="primary"
                      onClick={() => handleSidenavColor("#1890ff")}
                    >
                      1
                    </Button>
                    <Button
                      type="default"
                      style={{ backgroundColor: '#52c41a' }}
                      onClick={() => handleSidenavColor("#52c41a")}
                    >
                      1
                    </Button>
                    <Button
                      type="default"
                      style={{ backgroundColor: '#d9363e' }}
                      onClick={() => handleSidenavColor("#d9363e")}
                    >
                      1
                    </Button>
                    <Button
                      type="default"
                      style={{ backgroundColor: '#fadb14' }}
                      onClick={() => handleSidenavColor("#fadb14")}
                    >
                      1
                    </Button>

                    <Button
                      type="default"
                      style={{ backgroundColor: '#111' }}
                      onClick={() => handleSidenavColor("#111")}
                    >
                      1
                    </Button>

                    <ColorPicker 
                    value={sidenavColor}
                    format='hex'
                    onChange={handleCustomSidenavColor}
                    >
                      <Button className="color-picker"style={{ 
                        background: sidenavColor,
                        borderColor: sidenavColor
                      }}>
                        Custom Color
                      </Button>
                    </ColorPicker>

                  </ButtonContainer>
                </div>

                <div className="sidebarnav-color mb-2">
                  <Title level={5}>Sidenav Type</Title>
                  <Text>Choose between 2 different sidenav types.</Text>
                  <ButtonContainer className="trans">
                    <Button
                      type={sidenavType === "transparent" ? "primary" : "default"}
                      onClick={() => {
                        handleSidenavType("transparent");
                        setSidenavType("transparent");
                      }}
                    >
                      TRANSPARENT
                    </Button>
                    <Button
                      type={sidenavType === "white" ? "primary" : "default"}
                      onClick={() => {
                        handleSidenavType("#fff");
                        setSidenavType("white");
                      }}
                    >
                      WHITE
                    </Button>
                  </ButtonContainer>
                </div>
                <div className="fixed-nav mb-2">
                  <Title level={5}>Navbar Fixed </Title>
                  <Switch 
                  checked={localStorage.getItem('mx-fixedNavebar') === 'true' || false} 
                  onChange={handleFixedNavbar} 
                  />
                </div>
                <div className="ant-docment">
                  <ButtonContainer>
                    <Button type="default" size="large">
                      FREE DOWNLOAD
                    </Button>
                    <Button size="large">VIEW DOCUMENTATION</Button>
                  </ButtonContainer>
                </div>
                <div className="viewstar">
                  <a href="#pablo">{<StarOutlined />} Star</a>
                  <a href="#pablo"> 190</a>
                </div>

                <div className="ant-thank">
                  <Title level={5} className="mb-2">
                    Thank you for sharing!
                  </Title>
                  <ButtonContainer className="social">
                    <Button type="default">{<TwitterOutlined />}TWEET</Button>
                    <Button type="default">{<FacebookFilled />}SHARE</Button>
                  </ButtonContainer>
                </div>
              </div>
            </div>
          </Drawer>
          <Input
            className="header-search"
            placeholder="Type here..."
            prefix={<SearchOutlined />}
          />
        </Col>
      </Row>
    </>
  );
}

export default Header;
