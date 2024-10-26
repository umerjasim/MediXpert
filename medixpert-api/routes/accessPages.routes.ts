import { Router } from "express";
import { authenticate } from "../helpers/jwt";
import * as validation from '../validation/accessPages.validation';
import validate from '../validation';
import { getAccessPages } from "../services/accessPages.service";

const accessPagesRoute = Router();

accessPagesRoute.use(authenticate);

accessPagesRoute.post('/getAccessPages', validation.access(), validate, getAccessPages);

export = accessPagesRoute;