import { observable, action, makeObservable } from "mobx";

export type globalStoreProps = {
  loading: boolean,
  pages: Array<object> | any,
  user: object,
  pageTitle: string;
  screenSize: any;
  collapse: boolean;
  darkTheme: boolean; 
  language: string;
  setLoading: (loading: boolean) => any,
  setPages: (pages: Array<object> | any) => any,
  setUser: (user: object) => any,
  setpageTitle: (page: string) => any,
  setScreenSize: (screenSize: {}) => any,
  setCollapse: (collapse: boolean) => any,
  setDarkTheme: (darkTheme: boolean) => any,
  setLanguage: (language: string) => any,
}

class GlobalStore {
  loading = true;
  pages = [];
  user = {};
  pageTitle = '';
  screenSize = {
    lg: true,
    md: false,
    sm: false,
    xl: false,
    xs: false,
    xxl: false,
  };
  collapse = localStorage.getItem('mx-sideCollapse') === 'true';
  darkTheme = localStorage.getItem('mx-darkMode') === 'true';
  language = localStorage.getItem('mx-language') || 'en';

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setPages(pages: Array<object> | any) {
    this.pages = pages;
  }

  setUser(user: object) {
    this.user = user;
  }

  setPageTitle(page: string) {
    this.pageTitle = page;
  }

  setScreenSize(screenSize: any) {
    this.screenSize = screenSize;
  }

  setCollapse(collapse: boolean) {
    this.collapse = collapse;
  }

  setDarkTheme(darkTheme: boolean) {
    this.darkTheme = darkTheme;
  }

  setLanguage(language: string) {
    this.language = language;
  }

  constructor() {
    makeObservable(this, {
      loading: observable,
      setLoading: action,
      pages: observable,
      setPages: action,
      user: observable,
      setUser: action,
      pageTitle: observable,
      setPageTitle: action,
      screenSize: observable,
      setScreenSize: action,
      collapse: observable,
      setCollapse: action,
      darkTheme: observable,
      setDarkTheme: action,
      language: observable,
      setLanguage: action,
    });
  }
}

export default new GlobalStore();