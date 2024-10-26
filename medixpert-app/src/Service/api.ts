import axios, { AxiosRequestConfig } from 'axios';
import Constant from '../Global/Constant';
import Utility from '../Global/Utility';
import authStore from '../Store/authStore';

class API {
  constructor(){
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('mx-token');
      const acceptLanguage = localStorage.getItem('mx-language') ?? 'en';
      const item = { ...config };
      if(item.headers) {
        item.headers['Accept-Language'] = acceptLanguage;
      }
      if (token && item.headers) {  
        item.headers.Authorization = `Bearer ${token}`;
        return item;
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    },
  );

  axios.interceptors.response.use(
    (responseInter) => responseInter,
    (error) => new Promise((resolve, reject) => {
      const originalReq = error?.config;
      const refreshToken = localStorage.getItem(Constant.refreshToken);
      if (
        refreshToken
          && error?.response?.status === 403
          && !originalReq?._retry
      ) {
        const refreshExpireTime = Utility.getRefreshTokenTime();
        if (refreshExpireTime && refreshExpireTime * 1000 < new Date().getTime()) {
          authStore.signOut();
        } else {
          const res = this.getRefreshToken(originalReq,refreshToken)
          resolve(res)
        }
      }
      reject(error);
    }),
  );
  } 

  async getRefreshToken(originalReq: any, refreshToken: any) {
    originalReq._retry = true;
    return fetch(`${axios.defaults.baseURL}/user/refresh`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify({
        refreshToken,
      }),
    })
      .then((response) => {
        if (response?.status === 200) {
          return response.json();
        }
        authStore.signOut();
      })
      .then((response) => {
        if (response) {
          localStorage.setItem(Constant.token, response?.token);
          localStorage.setItem(Constant.refreshToken, response?.refreshToken);
          originalReq.headers.Authorization = `Bearer ${response?.token}`;
          return axios(originalReq);
        }
      });
  }

  async get(url: string, config?: AxiosRequestConfig) {
    return axios.get(url, config);
  }

  async post(url: string, data: any) {
    return axios.post(url, data);
  }

  async put(url: string, data?: any) {
    return axios.put(url, data);
  }

  async delete(url: string) {
    return axios.delete(url);
  }
  
}

export default new API();
