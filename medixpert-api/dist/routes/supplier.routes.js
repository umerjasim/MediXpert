"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const validation_1 = __importDefault(require("../validation"));
const supplier_service_1 = require("../services/supplier.service");
const supplierRoute = (0, express_1.Router)();
supplierRoute.use(jwt_1.authenticate);
supplierRoute.get('/getSuppliers', (0, jwt_1.validateUserAccess)(['/general', '/suppliers']), validation_1.default, supplier_service_1.getSuppliers);
supplierRoute.post('/addSupplier', (0, jwt_1.validateUserAccess)(['/general', '/suppliers']), validation_1.default, supplier_service_1.addSupplier);
module.exports = supplierRoute;
