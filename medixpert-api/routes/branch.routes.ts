import { Router } from "express";
import { authenticate, validateUserAccess } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { getBranches } from "../services/branch.service";

const branchRoute = Router();

branchRoute.use(authenticate);

branchRoute.get('/getBranches', validate, getBranches);

export = branchRoute;