"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const validation_1 = __importDefault(require("../validation"));
const branch_service_1 = require("../services/branch.service");
const branchRoute = (0, express_1.Router)();
branchRoute.use(jwt_1.authenticate);
branchRoute.get('/getBranches', validation_1.default, branch_service_1.getBranches);
module.exports = branchRoute;
