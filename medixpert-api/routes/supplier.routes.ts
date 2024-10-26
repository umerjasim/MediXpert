import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { addSupplier, getSuppliers } from "../services/supplier.service";

const supplierRoute = Router();

supplierRoute.use(authenticate);

supplierRoute.get('/getSuppliers', validateUserAccess(['/general', '/suppliers']), validate, getSuppliers);
supplierRoute.post('/addSupplier', validateUserAccess(['/general', '/suppliers']), validate, addSupplier);

export = supplierRoute;