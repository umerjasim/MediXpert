import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/tax.validation';
import validate from '../validation';
import { addTax, getTaxes } from "../services/tax.service";

const taxRoute = Router();

taxRoute.use(authenticate);

taxRoute.get('/getTaxes', validateUserAccess(['/masters', '/taxes']), validate, getTaxes);
taxRoute.post('/addTax', validateUserAccess(['/masters', '/taxes']), validation.addTax(), validate, addTax);

export = taxRoute;