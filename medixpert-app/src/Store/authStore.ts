import Constant from '../Global/Constant';
import Utility from '../Global/Utility';
import authService from '../Service/authService';
import Notification from "../Global/Notification";
import i18n from '../i18n';
import globalStore from './globalStore';

type AccessPage = {
  _id: string;
  name: string;
  title: string;
  route: string;
};

export type userType = {
  userId: string;
  title: string | null;
  name: {
    first: string;
    last: string;
  };
  dob: string | null;
  picture: string | null;
  roleId: string;
  roleName: string;
  accessPages: Array<AccessPage> | [];
  branch: string;
  outlet: string;
  expiryTime: number;
};

export interface AuthStoreProps {
  error: string,
  authListener: ((user:any) => void) | null,
  currentUser: userType | null,
  addAuthListener: (callbackListener : (user:any) => void) => void,
  containsRequiredUserRoles: () => void,
  signOut: ()=> void,
  login: ()=> void,
  loginOtp: ()=> void,
}

const getCurrentUser = () => {
  const token = localStorage?.getItem('mx-token');
  if (token) {
    return Utility.parseJwt(token);
  }
  return null;
};

class AuthStore {
  error = '';
  authListener: ((user: any) => void) | null = null;
  currentUser: userType | null = null;
  refreshExpireTime: any;
  accessPages: any = [];

  addAuthListener(callbackListener: (user: any) => void) {
    this.authListener = callbackListener;

    this.currentUser = getCurrentUser();

    // check token expire
    if (this.currentUser && (this.currentUser.expiryTime < new Date().getTime())) {
      this.signOut();
    }

    if (this.authListener) {
      this.authListener(this.currentUser);
    }
  }


  containsRequiredUserRoles(userAccess: Array<number>) {
    const { user, role, general, client, plant, equipment, checklist, task, report, configuration } =
      Constant.userAccess;
    if (
      [user, role, general, client, plant, equipment, checklist, task, report, configuration].filter(
        (val: any) => userAccess.includes(val)
      ).length > 0
    ) {
      return true;
    }
    return false;
  }
  async loginOtp(email: string) {
    try {
      const data = { email };
      const response = await authService.loginotp(data);
      if (response) {
        return (response);
      }
      Promise.resolve(null)
    }  catch (error : any) {
      return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
    }
  }

  async login(
    username: string, 
    password: string, 
    branch: string | null,
    outlet: string | null,
    callback: any
  ) {
    try {
      const data = { username, password, branch, outlet };
      const resp = await authService.login(data)
      const { token, refreshToken, accessPages } = resp.data
      const user = Utility.parseJwt(token);
      if (accessPages?.length > 0) {
        localStorage.setItem('mx-token', token);
        localStorage.setItem('mx-refreshToken', refreshToken);
        this.currentUser = user;
        this.accessPages = accessPages;
        globalStore.setUser(user);
        globalStore.setPages(accessPages);
        callback(null);
      } else {
        callback(i18n.t('c'));
      }
    } catch (err: any) {
      let errorMsg = i18n.t('defaultErrorMessage');
      if (err && err.response && err.response.data && err.response.data.error) {
        errorMsg = err.response.data.error.message;
      }
      callback(errorMsg);
    }
  }

  async signOut() {
    try {
      const token = localStorage.getItem('mx-token');
      const refreshToken = localStorage.getItem('mx-refreshToken');
      const user: userType | null = this.currentUser;
      const data = {
        user,
        token,
        refreshToken
      };
      authService.logOut(data).then(() => {
        localStorage.removeItem('mx-token');
        localStorage.removeItem('mx-refreshToken');
        window.location.reload();
      });
      this.currentUser = null;
      if (this.authListener) {
        this.authListener(this.currentUser);
      }
    } catch(err) {
      Notification.error({
        description: i18n.t('error'),
        message: i18n.t('unableToSignOut'),
      });
    }
  }

  async forgotPasswordRequest(email: string, callback: (err?: Error) => void) {
    try {
      await authService.forgotPasswordRequest(email);
      callback();
    } catch (err : any) {
      let errorMsg = i18n.t('defaultErrorMessage');
      if (err && err.response && err.response.data && err.response.data.error) {
        errorMsg = err.response.data.error.message;
      }
      callback(new Error(errorMsg));
    }
  }

  async resetPassword(
    password: string,
    userId: string,
    token: string,
    callback: (err?: Error) => void
  ) {
    try {
      const data = { password, token, userId };
      await authService.resetPassword(data);
      callback();
    } catch (err : any) {
      let errorMsg = i18n.t('defaultErrorMessage');
      if (err && err.response && err.response.data && err.response.data.error) {
        errorMsg = err.response.data.error.message;
      }
      callback(new Error(errorMsg));
    }
  }
}

export default new AuthStore();
