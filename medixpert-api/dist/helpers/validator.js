"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BODY_STRING = BODY_STRING;
exports.TOKEN = TOKEN;
exports.QUERY_ARRAY = QUERY_ARRAY;
exports.QUERY_NUMBER = QUERY_NUMBER;
exports.QUERY_STRING = QUERY_STRING;
exports.QUERY_ISO = QUERY_ISO;
exports.BODY_NUMBER = BODY_NUMBER;
exports.BODY_ISO = BODY_ISO;
exports.PARAM_STRING = PARAM_STRING;
exports.BODY_ARRAY = BODY_ARRAY;
exports.BODY_BOOLEAN = BODY_BOOLEAN;
exports.BODY_ISIN = BODY_ISIN;
exports.QUERY_STRING_CHECK_FOR_VALUES = QUERY_STRING_CHECK_FOR_VALUES;
const express_validator_1 = require("express-validator");
function BODY_STRING(fieldName, errorMsg, minLength, maxLength) {
    return (0, express_validator_1.body)(fieldName, errorMsg).trim().not().isEmpty()
        .isString()
        .isLength({ min: minLength })
        .isLength({ max: maxLength });
}
function BODY_NUMBER(fieldName, errorMsg) {
    return (0, express_validator_1.body)(fieldName, errorMsg).trim().isNumeric();
}
function BODY_BOOLEAN(fieldName, errorMsg) {
    return (0, express_validator_1.body)(fieldName, errorMsg).trim().isBoolean();
}
function BODY_ARRAY(fieldName, errorMsg, isIn) {
    if (isIn)
        return (0, express_validator_1.body)(fieldName, errorMsg).isArray().isIn(isIn);
    return (0, express_validator_1.body)(fieldName, errorMsg).isArray();
}
function BODY_ISIN(fieldName, errorMsg, isIn) {
    return (0, express_validator_1.body)(fieldName, errorMsg).isIn(isIn);
}
function TOKEN(fieldName, errorMsg, minLength) {
    return (0, express_validator_1.body)(fieldName, errorMsg)
        .trim().isLength({ min: minLength })
        .isJWT()
        .withMessage(errorMsg);
}
function QUERY_ARRAY(fieldName, errorMsg, isIn) {
    return (0, express_validator_1.query)(fieldName, errorMsg).isIn(isIn);
}
function QUERY_NUMBER(fieldName, errorMsg) {
    return (0, express_validator_1.query)(fieldName, errorMsg).trim().isInt();
}
function QUERY_STRING(fieldName, errorMsg, minLength, maxLength) {
    return (0, express_validator_1.query)(fieldName, errorMsg).trim().not().isEmpty()
        .isString()
        .isLength({ min: minLength })
        .isLength({ max: maxLength });
}
function PARAM_STRING(fieldName, errorMsg, minLength, maxLength) {
    return (0, express_validator_1.param)(fieldName, errorMsg).trim().not().isEmpty()
        .isString()
        .isLength({ min: minLength })
        .isLength({ max: maxLength });
}
function QUERY_ISO(fieldName, errorMsg) {
    return (0, express_validator_1.query)(fieldName, errorMsg).isISO8601().toDate();
}
function BODY_ISO(fieldName, errorMsg) {
    return (0, express_validator_1.query)(fieldName, errorMsg).isISO8601().toDate();
}
function checkForValues(value, checkValues) {
    const statusArray = value.split(',').map((s) => s.trim());
    return statusArray.every((statusStr) => {
        const status = parseInt(statusStr, 10);
        return checkValues.includes(status);
    });
}
function QUERY_STRING_CHECK_FOR_VALUES(fieldName, errorMsg, checkValues) {
    return (0, express_validator_1.query)(fieldName, errorMsg).trim().not().isEmpty()
        .custom((value) => checkForValues(value, checkValues));
}
