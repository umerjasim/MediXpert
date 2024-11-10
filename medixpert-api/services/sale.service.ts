import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";

export async function getMasterData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const titles = await dbHandler(
            collectionNames.titles,
            'find',
            { active: true },
            {
                projection: {
                    name: 1,
                    genderId: 1
                }
            }
        );

        const genders = await dbHandler(
            collectionNames.genders,
            'find',
            { active: true },
            {
                projection: {
                    name: 1,
                    code: 1
                }
            }
        );

        return res.status(requestCode.SUCCESS)
            .send({ 
                titles,
                genders
            });
   } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function getItems(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch } = req?.user;
        const { item } = req?.params;
        
        const items = await dbHandler(
            collectionNames.itemsStock,
            'aggregate',
            [
                {
                    $match: {
                        active: true,
                        branchId: new ObjectId(branch)
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.items,
                        localField: 'itemId',
                        foreignField: '_id',
                        as: 'itemsData'
                    },
                },
                {
                    $unwind: {
                        path: '$itemsData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.outlets,
                        localField: 'outletId',
                        foreignField: '_id',
                        as: 'outletsData'
                    },
                },
                {
                    $unwind: {
                        path: '$outletsData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.genericNames,
                        localField: 'itemsData.genericId',
                        foreignField: '_id',
                        as: 'genericData'
                    },
                },
                {
                    $unwind: {
                        path: '$genericData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        $or: [
                            { 'itemsData.name': { $regex: item, $options: 'i' } },
                            { 'genericData.name': { $regex: item, $options: 'i' } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.itemQtyUnit,
                        localField: 'itemsData.qtyUnitId',
                        foreignField: '_id',
                        as: 'unitData'
                    },
                },
                {
                    $unwind: {
                        path: '$unitData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.itemRisk,
                        localField: 'itemsData.riskId',
                        foreignField: '_id',
                        as: 'riskData'
                    },
                },
                {
                    $unwind: {
                        path: '$riskData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        hsnNo: 1,
                        batchNo: 1,
                        rackNo: 1,
                        expiry: 1,
                        totalQty: 1,
                        totalFreeQty: 1,
                        mrpPerQty: 1,
                        'itemsData.name': 1,
                        'itemsData._id': 1,
                        'genericData.name': 1,
                        'outletsData.name': 1,
                        'outletsData._id': 1,
                        'unitData.name': 1,
                        'riskData.name': 1,
                        'riskData.color': 1,
                        tax: 1,
                        taxForFree: 1
                    }
                }
            ]
        );        
        
        console.log(items)

        return res.status(requestCode.SUCCESS)
            .send({ 
                items
            });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};