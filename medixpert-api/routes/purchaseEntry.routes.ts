import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { addPurchaseEntry, approvePurchaseEntry, 
    getApprovePurchaseEntry, getMasterData, 
    getPurchaseEntryItems} from "../services/purchaseEntry.service";

const purchaseEnryRoute = Router();

purchaseEnryRoute.use(authenticate);

purchaseEnryRoute.get('/getMasterData', validateUserAccess(['/transactions', '/purchase-entry']), validate, getMasterData);
purchaseEnryRoute.post('/addPurchaseEntry', validateUserAccess(['/transactions', '/purchase-entry']), validate, addPurchaseEntry);
purchaseEnryRoute.get('/getApprovePurchaseEntry', validateUserAccess(['/transactions', '/approve-purchase-entry']), validate, getApprovePurchaseEntry);
purchaseEnryRoute.post('/approvePurchaseEntry', validateUserAccess(['/transactions', '/approve-purchase-entry']), validate, approvePurchaseEntry);
purchaseEnryRoute.get('/getPurchaseEntryItems/:entryId', validateUserAccess(['/transactions', '/approve-purchase-entry']), validate, getPurchaseEntryItems);

export = purchaseEnryRoute;