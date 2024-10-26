import api from './api';

class AuthService {
  loginotp = async (data : any) => api.post('user/send-otp', data);

  login = async (data : any) => api.post('/user/login', data);

  logOut = async (data: any) => api.put('/user/logout', data);

  forgotPasswordRequest = async (email: string) => api.post('/request/resetPassword', { email });

  resetPassword = async (data: any) => api.post('/request/changePassword', data);

  signOut = async(data?: any) => api.post('/user/signout', data);
}

export default new AuthService();
