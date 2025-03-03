"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const validation_1 = __importDefault(require("../validation"));
const designer_service_1 = require("../services/designer.service");
const designerRoute = (0, express_1.Router)();
designerRoute.use(jwt_1.authenticate);
// designerRoute.get('/getPageSizes', validateUserAccess(['/transactions']), validate, getPageSizes);
designerRoute.get('/getData', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, designer_service_1.getData);
designerRoute.post('/saveContent', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, designer_service_1.saveContent);
module.exports = designerRoute;
