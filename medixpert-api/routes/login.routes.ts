import { Router } from "express";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { getBranchesAndOutlets } from "../services/login.service";

const loginRoute = Router();

loginRoute.get('/getBranchesAndOutlets', validate, getBranchesAndOutlets);

export = loginRoute;