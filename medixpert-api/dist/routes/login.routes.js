"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const validation_1 = __importDefault(require("../validation"));
const login_service_1 = require("../services/login.service");
const loginRoute = (0, express_1.Router)();
loginRoute.get('/getBranchesAndOutlets', validation_1.default, login_service_1.getBranchesAndOutlets);
module.exports = loginRoute;
