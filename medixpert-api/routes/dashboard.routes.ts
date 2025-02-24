import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { getBranchOutletData, getTotalData, getBranchOutletPatientData } from "../services/dashboard.service";


const dashboardRoute = Router();

dashboardRoute.use(authenticate);

// dashboardRoute.get('/getMasterData', validateUserAccess(['/transactions', '/sale']), validate, getMasterData);
dashboardRoute.get('/getTotalData', validateUserAccess(['/transactions']), validate, getTotalData);
dashboardRoute.get('/getBranchOutletData', validateUserAccess(['/transactions']), validate, getBranchOutletData);
dashboardRoute.get('/getBranchOutletPatientData', validateUserAccess(['/transactions']), validate, getBranchOutletPatientData);

export = dashboardRoute;