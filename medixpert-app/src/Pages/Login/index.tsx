import { inject, observer } from "mobx-react";
import React, { Component, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Utility from "../../Global/Utility";
import globalStore from "../../Store/globalStore";
import loginStore from "../../Store/loginStore";
import Notification from "../../Global/Notification";
import { t } from "i18next";
import { Button, Card, Carousel, Col, ConfigProvider, Form, Grid, Input, Layout, Row, Select, Switch, theme } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { MoonFilled, SunFilled } from "@ant-design/icons";
import Translate from "../../Components/Translate";
import signinbg from "../../Assets/media/images/mx/img-signin.jpg";
import Title from "antd/es/typography/Title";
import authStore from "../../Store/authStore";
import { Link } from "react-router-dom";
import Particles from "../../Components/Particles"
import logo from '../../Assets/media/images/mx/mx-logo.png';

import img1 from "../../Assets/media/images/login_slide/1.png";
import img2 from "../../Assets/media/images/login_slide/2.png";
import img3 from "../../Assets/media/images/login_slide/3.png";
import img4 from "../../Assets/media/images/login_slide/4.png";

const sliderImages = [img1, img2, img3, img4];

const { useBreakpoint } = Grid;

const SignIn: React.FC = () => {

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem('mx-rememberMe') === 'true'
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('mx-darkMode') === 'true'
  );
  const [branch, setBranch] = useState(
    localStorage.getItem('mx-branch') || ''
  );
  const [outlet, setOutlet] = useState(
    localStorage.getItem('mx-outlet') || ''
  );
  const [branches, setBranches] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);

  useEffect(() => {
    getBranchesAndOutlets();
    Utility.handleFocus('username');
    setTimeout(() => {
      globalStore.setLoading(false);
    }, 500);
  }, []);

  async function getBranchesAndOutlets() {
    globalStore.setLoading(true);
    try {
      await loginStore.getBranchesAndOutlets();
      setBranches(loginStore?.branches);
      setOutlets(loginStore?.outlets);
      setBranch(
        localStorage.getItem('mx-branch') || loginStore?.branches?.[0]?._id
      );
      setOutlet(
        localStorage.getItem('mx-outlet') || loginStore?.outlets?.[0]?._id
      );
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

  const handleModeChange = (checked: boolean) => {
    localStorage.setItem('mx-darkMode', checked.toString());
    setDarkMode(checked);
  };

  const onFinish = async (values: any) => {
    globalStore.setLoading(true);
    authStore.login(
      values.username,
      values.password,
      branch,
      outlet,
      (err: any) => {
        globalStore.setLoading(false);
        if (err) {
          Notification.error({
            description: err,
            message: t('signInCredEmptyMsg'),
          });
          return;
        }
        navigate(authStore?.accessPages[0]?.route);
      }
    );
  };

  const onFinishFailed = (errorInfo: any) => {
    Notification.error({
      description: t('signInCredEmptyDesc'),
      message: t('signInCredEmptyMsg'),
    });
    const errorFields = errorInfo.values;

    if (!errorFields.username) {
      const usernameInput = document.getElementById('username') as HTMLElement;
      usernameInput?.focus();
    } else if (!errorFields.password) {
      const passwordInput = document.getElementById('password') as HTMLElement;
      passwordInput?.focus();
    }
  };

  const handleBranchChange = (value: string) => {
    localStorage.setItem('mx-branch', value);
    setBranch(value);
  };

  const handleOutletChange = (value: string) => {
    localStorage.setItem('mx-outlet', value);
    setOutlet(value);
  };

  const handleRememberChange = (checked: boolean) => {
    localStorage.setItem('mx-rememberMe', checked.toString());
    setRememberMe(checked);
  };

  if (!outlets || outlets.length === 0) {
    return null;
  }

  return (
    <>
      <ConfigProvider theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}>
        <Particles darkMode={darkMode} />
        <Layout>
          <Header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: darkMode ? undefined : '#fff',
            boxShadow: '0 20px 27px rgb(0 0 0 / 5%)',
            color: darkMode ? undefined : '#fff',
            zIndex: 1
          }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: darkMode ? '#fff' : '#000' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginTop: 20 }}> <img src={logo} alt="Logo" style={{ width: "40px", height: "40px" }} /></div>
                &nbsp; {screens.xs ? <div></div> : <div><h5>{t('medixpert')}</h5></div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Switch 
                checked={darkMode} 
                onChange={handleModeChange}
                checkedChildren={<MoonFilled twoToneColor={'black'} />}
                unCheckedChildren={<SunFilled />}
              />
              <Translate />
            </div>
          </Header>
          <Content style={{ overflow: 'auto' }}>
            <Row style={{ height: 'calc(100vh - 64px)' }} gutter={0}>
              <Col lg={24} md={24} xl={24} xs={24} xxl={24} sm={24}
              style={{
                padding: '0px 65px',
                // backgroundImage: `url("${signinbg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
                
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 64px)',
                    // padding: '16px',
                  }}
                >
                  <Card
                    style={{
                      width: screens.lg || screens.md ? '400px' : '100%',
                      // maxWidth: '90%',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                    }}
                    // styles={{ body: { padding: '24px' } }}
                  >
                    <Col>
                      <Title level={3} style={{ marginTop: 10 }}>{t('signInTitle')}</Title>
                    </Col>
                    <Col>
                      <Title level={5} style={{ marginTop: 10 }}>
                        {t('signInDescription')}
                      </Title>
                    </Col>
                    <Form
                      onFinish={onFinish}
                      onFinishFailed={onFinishFailed}
                      layout="vertical"
                      className="row-col"
                      id="signIn-form"
                      onKeyDown={(event) => Utility.handleEnterKey(event, 'signIn-form')}
                    >
                      <Row gutter={0}>
                        <Col lg={24} md={24} xl={24} xs={24} xxl={24} sm={24}>
                          <Form.Item
                            className="username"
                            label={t('usernameText')}
                            name="username"
                            id="username"
                            rules={[
                              {
                                required: true,
                                message: t('usernameEmpty'),
                              },
                            ]}
                          >
                            <Input 
                            autoFocus
                            placeholder={t('usernameText')}
                            />
                          </Form.Item>
                        </Col>
                        <Col lg={24} md={24} xl={24} xs={24} xxl={24} sm={24}>
                          <Form.Item
                            className="username"
                            label={t('passwordText')}
                            name="password"
                            id="password"
                            rules={[
                              {
                                required: true,
                                message: t('passwordEmpty'),
                              },
                            ]}
                          >
                            <Input.Password 
                            placeholder={t('passwordText')}
                            />
                          </Form.Item>
                        </Col>
                        <Col lg={24} md={24} xl={24} xs={24} xxl={24} sm={24}>
                          <Form.Item
                            name="branch"
                            className="aligin-center"
                            initialValue={branch || branches?.[0]?._id}
                            label={t('branchText')}
                            rules={[
                              {
                                required: true,
                                message: t('branchEmpty'),
                              },
                            ]}
                          >
                            <Select onChange={handleBranchChange}>
                              {branches && branches.length > 0 && 
                              branches.map((branch: any) => (
                                <Select.Option key={branch._id} value={branch._id}>{branch.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col lg={24} md={24} xl={24} xs={24} xxl={24} sm={24}>
                          <Form.Item
                            name="outlet"
                            className="aligin-center"
                            initialValue={outlet || outlets?.[0]?._id}
                            label={t('outletText')}
                            rules={[
                              {
                                required: true,
                                message: t('outletEmpty'),
                              },
                            ]}
                          >
                            <Select onChange={handleOutletChange}>
                              {outlets && outlets.length > 0 && 
                              outlets.map((outlet: any) => (
                                <Select.Option key={outlet._id} value={outlet._id}>{outlet.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col lg={24} md={24} xl={24} xs={24} xxl={24} sm={24}>
                          <Form.Item
                            name="remember"
                            className="aligin-center"
                            valuePropName="checked"
                          >
                            <div>
                                <Switch checked={rememberMe} onChange={handleRememberChange} />
                                &nbsp;&nbsp;&nbsp;{t('rememberMeText')}
                            </div>
                          </Form.Item>
                        </Col>
                        <Col lg={24} md={24} xl={24} xs={24} xxl={24} sm={24}>
                          <Form.Item
                            style={{ marginBottom: 0 }}
                          >
                            <Button
                              type="primary"
                              htmlType="submit"
                              block
                            >
                              {t('signInButtonText').toUpperCase()}
                            </Button>
                            <p className="font-semibold text-muted">
                              <Link to="/sign-up" className="font-bold">
                                  {t('forgotPasswordText')}{" "}
                              </Link>
                            </p>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </Card>
                  {screens.lg && (
                    <Card style={{
                      width: screens.lg || screens.md ? '50%' : '100%',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      borderRadius: '0',
                    }}
                    styles={{ body: { padding: 0, borderRadius: 0 } }}
                    >
                      <Carousel 
                      autoplay 
                      dotPosition="left" 
                      autoplaySpeed={3000} 
                      dots={false} 
                      pauseOnHover
                      style={{ height: '100%', overflow: 'hidden' }}
                      >
                         {sliderImages.map((image, index) => (
                          <div key={'img'+index}>
                            <img
                              src={image}
                              alt={`Slide ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "600px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ))}
                      </Carousel>
                    </Card>
                  )}
                </div>
              </Col>
            </Row>
          </Content>
        </Layout>
      </ConfigProvider>
    </>
  );
};

export default inject('globalStore')(observer(SignIn));