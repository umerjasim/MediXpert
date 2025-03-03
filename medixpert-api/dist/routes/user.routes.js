"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const user_service_1 = require("../services/user.service");
const validation = __importStar(require("../validation/user.validation"));
const validation_1 = __importDefault(require("../validation"));
const constants_1 = require("../helpers/constants");
const jwt_1 = require("../helpers/jwt");
const { task, user, report } = constants_1.userAccess;
const userRoute = (0, express_1.Router)();
userRoute.post('/login', validation.login(), validation_1.default, user_service_1.login);
userRoute.use(jwt_1.authenticate);
userRoute.put('/logout', validation_1.default, user_service_1.logOut);
module.exports = userRoute;
