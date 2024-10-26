import {
    body, param, query,
  } from 'express-validator';
  import { errorType } from './types';
  
  function BODY_STRING(
    fieldName: string,
    errorMsg: errorType,
    minLength?: number,
    maxLength?: number,
  ) {
    return body(fieldName, errorMsg).trim().not().isEmpty()
      .isString()
      .isLength({ min: minLength })
      .isLength({ max: maxLength });
  }
  
  function BODY_NUMBER(fieldName: string, errorMsg: errorType) {
    return body(fieldName, errorMsg).trim().isNumeric();
  }
  
  function BODY_BOOLEAN(fieldName: string, errorMsg: errorType) {
    return body(fieldName, errorMsg).trim().isBoolean();
  }
  
  function BODY_ARRAY(
    fieldName:string,
    errorMsg: errorType,
    isIn?: Array<unknown>,
  ) {
    if (isIn) return body(fieldName, errorMsg).isArray().isIn(isIn);
    return body(fieldName, errorMsg).isArray();
  }
  
  function BODY_ISIN(
    fieldName:string,
    errorMsg: errorType,
    isIn: Array<unknown>,
  ) {
    return body(fieldName, errorMsg).isIn(isIn);
  }
  
  function TOKEN(
    fieldName: string,
    errorMsg: errorType,
    minLength: number,
  ) {
    return body(fieldName, errorMsg)
      .trim().isLength({ min: minLength })
      .isJWT()
      .withMessage(errorMsg);
  }
  
  function QUERY_ARRAY(
    fieldName:string,
    errorMsg: errorType,
    isIn: Array<any>,
  ) {
    return query(fieldName, errorMsg).isIn(isIn);
  }
  
  function QUERY_NUMBER(
    fieldName:string,
    errorMsg: errorType,
  ) {
    return query(fieldName, errorMsg).trim().isInt();
  }
  
  function QUERY_STRING(
    fieldName:string,
    errorMsg: errorType,
    minLength?: number,
    maxLength?: number,
  ) {
    return query(fieldName, errorMsg).trim().not().isEmpty()
      .isString()
      .isLength({ min: minLength })
      .isLength({ max: maxLength });
  }
  
  function PARAM_STRING(
    fieldName:string,
    errorMsg: errorType,
    minLength?: number,
    maxLength?: number,
  ) {
    return param(fieldName, errorMsg).trim().not().isEmpty()
      .isString()
      .isLength({ min: minLength })
      .isLength({ max: maxLength });
  }
  
  function QUERY_ISO(
    fieldName:string,
    errorMsg: errorType,
  ) {
    return query(fieldName, errorMsg).isISO8601().toDate();
  }
  
  function BODY_ISO(
    fieldName:string,
    errorMsg: errorType,
  ) {
    return query(fieldName, errorMsg).isISO8601().toDate();
  }
  
  function checkForValues(value: any, checkValues: Array<any>) {
    const statusArray = value.split(',').map((s: string) => s.trim());
    return statusArray.every((statusStr: string) => {
      const status = parseInt(statusStr, 10);
      return checkValues.includes(status);
    });
  }
  
  function QUERY_STRING_CHECK_FOR_VALUES(
    fieldName: string,
    errorMsg: errorType,
    checkValues:Array<any>,
  ) {
    return query(fieldName, errorMsg).trim().not().isEmpty()
      .custom((value) => checkForValues(value, checkValues));
  }
  
  export {
    BODY_STRING, TOKEN, QUERY_ARRAY, QUERY_NUMBER, QUERY_STRING, QUERY_ISO, BODY_NUMBER, BODY_ISO,
    PARAM_STRING, BODY_ARRAY, BODY_BOOLEAN, BODY_ISIN, QUERY_STRING_CHECK_FOR_VALUES,
  };
  