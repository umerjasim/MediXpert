import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { getPageSizes, getReplacingHashtags } from "../models/designer.model";

export async function getData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch, outlet } = req.user;

        const pageSizes = await getPageSizes();

        const hashtags = await getReplacingHashtags();

        return res.status(requestCode.SUCCESS)
            .send({ pageSizes, hashtags });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
}