"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const validation_1 = __importDefault(require("../validation"));
const purchaseEntry_service_1 = require("../services/purchaseEntry.service");
const purchaseEnryRoute = (0, express_1.Router)();
purchaseEnryRoute.use(jwt_1.authenticate);
purchaseEnryRoute.get('/getMasterData', (0, jwt_1.validateUserAccess)(['/transactions', '/purchase-entry']), validation_1.default, purchaseEntry_service_1.getMasterData);
purchaseEnryRoute.post('/addPurchaseEntry', (0, jwt_1.validateUserAccess)(['/transactions', '/purchase-entry']), validation_1.default, purchaseEntry_service_1.addPurchaseEntry);
purchaseEnryRoute.get('/getApprovePurchaseEntry', (0, jwt_1.validateUserAccess)(['/transactions', '/approve-purchase-entry']), validation_1.default, purchaseEntry_service_1.getApprovePurchaseEntry);
purchaseEnryRoute.post('/approvePurchaseEntry', (0, jwt_1.validateUserAccess)(['/transactions', '/approve-purchase-entry']), validation_1.default, purchaseEntry_service_1.approvePurchaseEntry);
purchaseEnryRoute.get('/getPurchaseEntryItems/:entryId', (0, jwt_1.validateUserAccess)(['/transactions', '/approve-purchase-entry']), validation_1.default, purchaseEntry_service_1.getPurchaseEntryItems);
module.exports = purchaseEnryRoute;
