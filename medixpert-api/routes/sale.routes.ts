import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { getItems, getMasterData } from "../services/sale.service";


const saleRoute = Router();

saleRoute.use(authenticate);

// saleRoute.get('/getMasterData', validateUserAccess(['/transactions', '/sale']), validate, getMasterData);
saleRoute.get('/getMasterData', validateUserAccess(['/transactions']), validate, getMasterData);
saleRoute.get('/getItems/:item', validateUserAccess(['/transactions']), validate, getItems);

export = saleRoute;