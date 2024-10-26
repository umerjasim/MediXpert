import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from 'antd';
import { Provider } from 'mobx-react';

import store from './Store';
import authStore from './Store/authStore';
import ApplicationRoutes from './Routing/ApplicationRoutes';
// import './App.less';
import NoInternetConnection from './Components/NoInternetConnection';

// import "antd/dist/antd.css";
import "./Assets/style/main.css";
import Utility from './Global/Utility';
// import "./Assets/style/responsive.css";

export class App extends React.Component {
  constructor(props: object) {
    super(props);
    const token: any = localStorage.getItem('mx-token');
    const user = Utility.parseJwt(token)
    if (user) {
      authStore.currentUser = user;
    }
  }

  componentDidMount() {
    authStore.addAuthListener((user: any) => {
      authStore.currentUser = user;
      this.forceUpdate();
    });
  }

  render() {
    return (
      <Provider {...store}>
        <Router>
          <Layout.Content className='main-wrapper'>
            <ApplicationRoutes />
          </Layout.Content>
          {/* <NoInternetConnection /> */}
        </Router>
      </Provider>
    );
  }
}

export default App;
