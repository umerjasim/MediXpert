import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { addPurchaseEntry, getMasterData } from "../services/purchaseEntry.service";

const purchaseEnryRoute = Router();

purchaseEnryRoute.use(authenticate);

purchaseEnryRoute.get('/getMasterData', validateUserAccess(['/transactions', '/purchase-entry']), validate, getMasterData);
purchaseEnryRoute.post('/addPurchaseEntry', validateUserAccess(['/transactions', '/purchase-entry']), validate, addPurchaseEntry);

export = purchaseEnryRoute;