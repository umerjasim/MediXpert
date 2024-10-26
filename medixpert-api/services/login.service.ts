import { Request, Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";

export async function getBranchesAndOutlets(
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
        const branches = await dbHandler(
            collectionNames.branches,
            'find',
            { active: true },
            { name: 1 }
        );

        const outlets = await dbHandler(
            collectionNames.outlets,
            'find',
            { active: true },
            { name: 1 }
        );

        return res.status(requestCode.SUCCESS)
          .send({ branches, outlets });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
          .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
      }
};