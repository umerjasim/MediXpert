"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const validation_1 = __importDefault(require("../validation"));
const dashboard_service_1 = require("../services/dashboard.service");
const dashboardRoute = (0, express_1.Router)();
dashboardRoute.use(jwt_1.authenticate);
// dashboardRoute.get('/getMasterData', validateUserAccess(['/transactions', '/sale']), validate, getMasterData);
dashboardRoute.get('/getTotalData', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, dashboard_service_1.getTotalData);
dashboardRoute.get('/getBranchOutletData', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, dashboard_service_1.getBranchOutletData);
dashboardRoute.get('/getBranchOutletPatientData', (0, jwt_1.validateUserAccess)(['/transactions']), validation_1.default, dashboard_service_1.getBranchOutletPatientData);
module.exports = dashboardRoute;
