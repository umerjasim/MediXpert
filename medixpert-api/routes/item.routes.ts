import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { addItem, getItems, getMasterData } from "../services/item.service";

const itemRoute = Router();

itemRoute.use(authenticate);

itemRoute.get('/getMasterData', validateUserAccess(['/general', '/items']), validate, getMasterData);
itemRoute.post('/addItem', validateUserAccess(['/general', '/items']), validate, addItem);
itemRoute.get('/getItems', validateUserAccess(['/general', '/items']), validate, getItems);

export = itemRoute;