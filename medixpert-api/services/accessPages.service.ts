import { Request, Response } from "express";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";
import logger from "../helpers/logger";

export async function getAccessPages(
    req: Request,
    res: Response,
  ): Promise<any> {
    const { userId, roleId } = req.body;
    try {
        if (userId && roleId) {
            const usersRole = await dbHandler(
                collectionNames.usersRole, 
                'findOne', 
                { _id: new ObjectId(roleId) }
            );
            
            if (!usersRole) {
                return res.status(requestCode.UNAUTHORIZED)
                    .send({ error: geti18nResponse(req, 'noAnyAccess', msg.noAnyAccess) });
            }
            const userAccessArray: Array<ObjectId> = usersRole?.access;
            const accessPages: Array<object> = await dbHandler(
                collectionNames.mainPages,
                'aggregate',
                [
                    {
                        $match: {
                            _id: { $in: userAccessArray },
                            active: true
                        }
                    },
                    {
                        $lookup: {
                          from: collectionNames.subPages,
                          localField: "_id",
                          foreignField: "mainPageId",
                          as: "subPages"
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            title: 1,
                            route: 1,
                            icon: 1,
                            subPages: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: "$subPages",
                                      as: "subPage",
                                      cond: {
                                        $and: [
                                          { $in: ["$$subPage._id", userAccessArray] },
                                          { $eq: ["$$subPage.active", true] }
                                        ]
                                      }
                                    }
                                  },
                                  as: "subPage",
                                  in: {
                                    _id: "$$subPage._id",
                                    name: "$$subPage.name",
                                    title: "$$subPage.title",
                                    route: "$$subPage.route",
                                    icon: "$$subPage.icon"
                                  }
                                }
                            }
                        }
                    }
                ]
            );
            return res.status(requestCode.SUCCESS)
                .send({ accessPages });
        }
        return res.status(requestCode.UNAUTHORIZED)
            .send({ error: geti18nResponse(req, 'noAnyAccess', msg.noAnyAccess) });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};