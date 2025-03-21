import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { getData, saveContent } from "../services/designer.service";


const designerRoute = Router();

designerRoute.use(authenticate);

// designerRoute.get('/getPageSizes', validateUserAccess(['/transactions']), validate, getPageSizes);
designerRoute.get('/getData', validateUserAccess(['/transactions']), validate, getData);
designerRoute.post('/saveContent', validateUserAccess(['/transactions']), validate, saveContent);

export = designerRoute;