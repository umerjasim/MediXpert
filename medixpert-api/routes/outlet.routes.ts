import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { getOutlets } from "../services/outlet.service";

const outletRoute = Router();

outletRoute.use(authenticate);

outletRoute.get('/getOutlets', validate, getOutlets);

export = outletRoute;