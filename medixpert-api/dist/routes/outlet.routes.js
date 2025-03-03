"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const validation_1 = __importDefault(require("../validation"));
const outlet_service_1 = require("../services/outlet.service");
const outletRoute = (0, express_1.Router)();
outletRoute.use(jwt_1.authenticate);
outletRoute.get('/getOutlets', validation_1.default, outlet_service_1.getOutlets);
module.exports = outletRoute;
