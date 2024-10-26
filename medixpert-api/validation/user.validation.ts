import {
    msg,
  } from '../helpers/constants';
  import {
    BODY_STRING, QUERY_ARRAY, QUERY_STRING, TOKEN, BODY_ARRAY, PARAM_STRING, QUERY_NUMBER,
    BODY_NUMBER,
  } from '../helpers/validator';

  function login() {
    return [
      BODY_STRING('username', msg.loginCredRequired),
      BODY_STRING('password', msg.loginCredRequired),
    ];
  }
  
  export {
    login,
  };
  