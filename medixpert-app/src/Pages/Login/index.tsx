import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Switch,
  Tooltip,
  Progress,
  Select,
  ConfigProvider,
  theme,
} from "antd";
import signinbg from "../../Assets/media/images/img-signin.jpg";
import {
  DribbbleOutlined,
  TwitterOutlined,
  InstagramOutlined,
  GithubOutlined,
  InfoCircleOutlined,
  MoonFilled,
  SunFilled,
} from "@ant-design/icons";
import Utility from '../../Global/Utility';
import Notification from "../../Global/Notification";
import { WithTranslation, withTranslation } from "react-i18next";
import Translate from "../../Components/Translate";
import { t } from 'i18next';
import globalStore from "../../Store/globalStore";
import { inject, observer } from "mobx-react";
import authStore from "../../Store/authStore";
import Constant from "../../Global/Constant";
import RoutesPath from "../../Global/Routes";
import loginStore from "../../Store/loginStore";


const { Title } = Typography;
const { Header, Footer, Content } = Layout;

interface SignInState {
    rememberMe: boolean;
    darkMode: boolean;
    branch: string | null;
    outlet: string | null;
    branches: any[];
    outlets: any[];
} 

interface SignInProps extends WithTranslation {
    navigate: (path: string) => void;
}

class SignIn extends Component<SignInProps, SignInState> {

  constructor(props: any) {
    super(props);
    const rememberMe = localStorage.getItem('mx-rememberMe') === 'true';
    const darkMode = localStorage.getItem('mx-darkMode') === 'true';
    const branch = localStorage.getItem('mx-branch');
    const outlet = localStorage.getItem('mx-outlet');
    this.state = {
        rememberMe,
        darkMode,
        branch,
        outlet,
        branches: [],
        outlets: []
    };

    this.onRememberChange = this.onRememberChange.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.getBranchesAndOutlets = this.getBranchesAndOutlets.bind(this);
    // this.handleBranchChange = this,handleBranchChange(this);
    // this.handleOutletChange = this,handleOutletChange(this);
  }

  componentDidMount() {
    this.getBranchesAndOutlets();
    Utility.handleFocus('username');
    setTimeout(() => {
      globalStore.setLoading(false);
    }, 500);
  }

  async getBranchesAndOutlets() {
    globalStore.setLoading(true);
    try {
      await loginStore.getBranchesAndOutlets();
      this.setState({
        branches: loginStore.branches,
        outlets: loginStore.outlets,
        branch: localStorage.getItem('mx-branch') || loginStore?.branches?.[0]?._id,
        outlet: localStorage.getItem('mx-outlet') || loginStore?.outlets?.[0]?._id
      });
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
  }

  onFinish =  async (values: any) => {
    globalStore.setLoading(true);
    const { outlet, branch } = this.state;
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
          message: t('signInCredEmptyMsg')
        });
        return;
      }
      const user = authStore?.currentUser;
      const { navigate } = this.props;
      navigate(authStore?.accessPages[0]?.route);
    });
  };

  onFinishFailed = (errorInfo: any) => {
    Notification.error({ 
        description: t('signInCredEmptyDesc'),
        message: t('signInCredEmptyMsg')
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

  onRememberChange(checked: boolean) {
    if (checked) {
        localStorage.setItem('mx-rememberMe', 'true');
    } else {
        localStorage.removeItem('mx-rememberMe');
    }
    this.setState({ rememberMe: checked });
  }

  onModeChange(checked: boolean) {
    if (checked) {
        localStorage.setItem('mx-darkMode', 'true');
    } else {
        localStorage.removeItem('mx-darkMode');
    }
    this.setState({ darkMode: checked });
  }

  handleBranchChange(value: any) {
    localStorage.setItem('mx-branch', value);
    this.setState({ branch: value })
  }

  handleOutletChange(value: any) {
    localStorage.setItem('mx-outlet', value);
    this.setState({ outlet: value })
  }

  render() {

    const { t } = this.props;
    const { 
      rememberMe,
      darkMode,
      branch,
      outlet,
      branches,
      outlets
    } = this.state;

    if (!outlets || outlets.length === 0) {
      return;
    }

    return (
      <ConfigProvider theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}>
        <Layout>
        <Header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: darkMode ? undefined : '#fff',
          boxShadow: '0 20px 27px rgb(0 0 0 / 5%)',
          color: darkMode ? undefined : '#fff',
        }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
            <h5>{t('medixpert')}</h5>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Switch 
              checked={darkMode} 
              onChange={this.onModeChange}
              checkedChildren={<MoonFilled twoToneColor={'black'} />}
              unCheckedChildren={<SunFilled />}
            />
            <Translate />
          </div>
        </Header>
        <Content style={{ overflow: 'auto' }}>
          <Row style={{ height: 'calc(100vh - 64px)' }} gutter={0}>
            <Col
              lg={12}
              style={{
                padding: '0px 65px',
              }}
            >
                <Title level={3} style={{ marginTop: 10 }}>{t('signInTitle')}</Title>
                <Title level={5} style={{ marginTop: 10 }}>
                {t('signInDescription')}
                </Title>
                <Form
                  onFinish={this.onFinish}
                  onFinishFailed={this.onFinishFailed}
                  layout="vertical"
                  className="row-col"
                  id="signIn-form"
                  onKeyDown={(event) => Utility.handleEnterKey(event, 'signIn-form')}
                >
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
                    <Select onChange={this.handleBranchChange}>
                      {branches && branches.length > 0 && 
                      branches.map((branch: any) => (
                        <Select.Option key={branch._id} value={branch._id}>{branch.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

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
                    <Select onChange={this.handleOutletChange}>
                      {outlets && outlets.length > 0 && 
                      outlets.map((outlet: any) => (
                        <Select.Option key={outlet._id} value={outlet._id}>{outlet.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="remember"
                    className="aligin-center"
                    valuePropName="checked"
                  >
                    <div>
                        <Switch checked={rememberMe} onChange={this.onRememberChange} />
                        &nbsp;{t('rememberMeText')}
                    </div>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ width: "100%" }}
                    >
                      {t('signInButtonText').toUpperCase()}
                    </Button>
                  </Form.Item>
                  <p className="font-semibold text-muted">
                    <Link to="/sign-up" className="font-bold">
                        {t('forgotPasswordText')}{" "}
                    </Link>
                  </p>
                </Form>
            </Col>
            <Col
              lg={12}
              style={{
                backgroundImage: `url("${signinbg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </Row>
        </Content>
        </Layout>
      </ConfigProvider>
    );
  }
}

function WithNavigateWrapper(Component: any) {
    return function Wrapper(props: any) {
      const navigate = useNavigate();
      return <Component {...props} navigate={navigate} />;
    };
}

export default inject('globalStore')(
    observer(
      withTranslation()(
        WithNavigateWrapper(SignIn)
      )
    )
);