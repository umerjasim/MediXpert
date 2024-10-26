import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";

export async function getBranches(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { userId } = req.user;
        const userAccess = await dbHandler(
            collectionNames.usersAccess,
            'findOne',
            { 
                userId: new ObjectId(userId),
                active: true
             }
        );
       
        if (!userAccess || !userAccess.branches) {
            return res.status(requestCode.UNAUTHORIZED)
                .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
        }

        const branchIds = userAccess.branches;

        const accessibleBranches = await dbHandler(
            collectionNames.branches,
            'find',
            { 
                _id: { $in: branchIds },
                active: true
            }
        );
        
        return res.status(requestCode.SUCCESS)
            .send({ branches: accessibleBranches });
    } catch (error) {
        console.log(error)
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};