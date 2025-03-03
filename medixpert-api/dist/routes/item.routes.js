"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const validation_1 = __importDefault(require("../validation"));
const item_service_1 = require("../services/item.service");
const itemRoute = (0, express_1.Router)();
itemRoute.use(jwt_1.authenticate);
itemRoute.get('/getMasterData', (0, jwt_1.validateUserAccess)(['/general', '/items']), validation_1.default, item_service_1.getMasterData);
itemRoute.post('/addItem', (0, jwt_1.validateUserAccess)(['/general', '/items']), validation_1.default, item_service_1.addItem);
itemRoute.get('/getItems', (0, jwt_1.validateUserAccess)(['/general', '/items']), validation_1.default, item_service_1.getItems);
module.exports = itemRoute;
