"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const validation_1 = __importDefault(require("../validation"));
const sale_service_1 = require("../services/sale.service");
const saleRoute = (0, express_1.Router)();
saleRoute.use(jwt_1.authenticate);
// saleRoute.get('/getMasterData', validateUserAccess(['/transactions', '/sale']), validate, getMasterData);
saleRoute.get('/getMasterData', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, sale_service_1.getMasterData);
saleRoute.get('/getItems/:item', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, sale_service_1.getItems);
saleRoute.post('/generateInvoice', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, sale_service_1.generateInvoice);
saleRoute.post('/confirmPayment', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, sale_service_1.confirmPayment);
module.exports = saleRoute;
