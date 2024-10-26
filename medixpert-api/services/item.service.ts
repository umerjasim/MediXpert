import { Request, Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { GenericNames, ItemCategory, ItemCode, ItemMaster, ItemQtyUnit, ItemRisk, ItemType } from "../config/dbTypes";
import { ObjectId } from "mongodb";
import { UserRequest } from "../helpers/jwt";

export async function getMasterData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const itemMaster: ItemMaster[] = await dbHandler(
            collectionNames.itemMaster,
            'find',
            { active: true },
            { name: 1, isDrug: 1 }
        );

        const itemType: ItemType[] = await dbHandler(
            collectionNames.itemType,
            'find',
            { active: true },
            { name: 1 }
        );

        const itemCategory: ItemCategory[] = await dbHandler(
            collectionNames.itemCategory,
            'find',
            { active: true },
            { name: 1 }
        );

        const itemCode: ItemCode[] = await dbHandler(
            collectionNames.itemCode,
            'find',
            { active: true },
            { name: 1 }
        );

        const itemQtyUnit: ItemQtyUnit[] = await dbHandler(
            collectionNames.itemQtyUnit,
            'find',
            { active: true },
            { name: 1 }
        );

        const itemRisk: ItemRisk[] = await dbHandler(
            collectionNames.itemRisk,
            'find',
            { active: true },
            { name: 1, color: 1 }
        );

        const itemGeneric: GenericNames[] = await dbHandler(
            collectionNames.genericNames,
            'find',
            { active: true, name: { $ne: "" } },
            { name: 1 }
        );

        return res.status(requestCode.SUCCESS)
            .send({ 
                itemMaster,
                itemType,
                itemCategory,
                itemCode,
                itemQtyUnit,
                itemRisk,
                itemGeneric
            });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function addItem(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { userId } = req?.user;
        const {
            'item-branch': itemBranches,
            'item-master-type': itemMasterType,
            'item-name': itemName,
            'item-category': itemCategory,
            'generic-name': genericName,
            'generic-id': genericId,
            'item-type': itemType,
            'item-qty-unit': itemQtyUnit,
            'item-reorder-qty': itemReorderQty,
            'item-risk': itemRisk,
            'form-item-remarks-list': itemRemarks
        } = req.body;

        let genericIds = null;
        if (genericName) {
            genericIds = await dbHandler(
                collectionNames.genericNames,
                'checkAndInsert',
                {
                    name: genericName
                },
                {
                    name: genericName,
                    active: true,
                    created: {
                        by: new ObjectId(userId),
                        on: new Date().toLocaleString(),
                        date: new Date()
                    },
                    modified: {
                        by: null,
                        on: null,
                        date: null
                    }
                }
            );
        }

        const existingItem = await dbHandler(
            collectionNames.items,
            'findOne',
            {
                name: itemName,
                active: true
            }
        );

        if (!existingItem) {
            const itemBranchIds = itemBranches.map((id: string) => new ObjectId(id));
            await dbHandler(
                collectionNames.items,
                'insertOne',
                {
                    name: itemName,
                    genericId: genericIds?.insertedId || null,
                    masterId: new ObjectId(itemMasterType),
                    typeId: new ObjectId(itemType),
                    categoryId: itemCategory ? new ObjectId(itemCategory) : null,
                    qtyUnitId: new ObjectId(itemQtyUnit),
                    reorderQty: Number(itemReorderQty),
                    riskId: new ObjectId(itemRisk),
                    remarks: itemRemarks && itemRemarks.length ? itemRemarks : null,
                    branches: itemBranchIds,
                    active: true,
                    created: {
                        by: new ObjectId(userId),
                        on: new Date().toLocaleString(),
                        date: new Date()
                    },
                    modified: {
                        by: null,
                        on: null,
                        date: null,
                    }
                }
            );
            return res.status(requestCode.SUCCESS)
                .send({ message: geti18nResponse(req, 'success', msg.success) });
        }
        return res.status(requestCode.BAD_REQUEST)
            .send({ error: geti18nResponse(req, 'itemAlreadyExist', msg.itemAlreadyExist) });
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

        const items = await dbHandler(
            collectionNames.items,
            'aggregate',
            [
                {
                  $lookup: {
                    from: collectionNames.genericNames,
                    localField: 'genericId',
                    foreignField: '_id',
                    as: 'genericDetails'
                  }
                },
                {
                  $unwind: {
                    path: '$genericDetails',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                    $lookup: {
                      from: collectionNames.itemMaster,
                      localField: 'masterId',
                      foreignField: '_id',
                      as: 'masterDetails'
                    }
                },
                {
                    $unwind: {
                      path: '$masterDetails',
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                      from: collectionNames.itemType,
                      localField: 'typeId',
                      foreignField: '_id',
                      as: 'typeDetails'
                    }
                },
                {
                    $unwind: {
                      path: '$typeDetails',
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                      from: collectionNames.itemCategory,
                      localField: 'categoryId',
                      foreignField: '_id',
                      as: 'categoryDetails'
                    }
                },
                {
                    $unwind: {
                      path: '$categoryDetails',
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                      from: collectionNames.itemQtyUnit,
                      localField: 'qtyUnitId',
                      foreignField: '_id',
                      as: 'qtyUnitDetails'
                    }
                },
                {
                    $unwind: {
                      path: '$qtyUnitDetails',
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                      from: collectionNames.itemRisk,
                      localField: 'riskId',
                      foreignField: '_id',
                      as: 'riskDetails'
                    }
                },
                {
                    $unwind: {
                      path: '$riskDetails',
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.branches,
                        localField: 'branches',
                        foreignField: '_id',
                        as: 'branchDetails'
                    }
                },
                {
                    $project: {
                        name: 1,
                        remarks: 1,
                        genericName: '$genericDetails.name',
                        genericId: '$genericDetails._id',
                        masterName: '$masterDetails.name',
                        masterId: '$masterDetails._id',
                        typeName: '$typeDetails.name',
                        typeId: '$typeDetails._id',
                        categoryName: '$categoryDetails.name',
                        categoryId: '$categoryDetails._id',
                        qtyUnitName: '$qtyUnitDetails.name',
                        qtyUnitId: '$qtyUnitDetails._id',
                        riskName: '$riskDetails.name',
                        riskId: '$riskDetails._id',
                        riskColor: '$riskDetails.color',
                        reorderQty: Number('reorderQty'),
                        isMedicine: '$masterDetails.isDrug',
                        branches: 1,
                        branchNames: {
                            $map: {
                                input: '$branchDetails',
                                as: 'branch',
                                in: '$$branch.name'
                            }
                        },
                        active: 1
                    }
                }
            ]
        );
        
        return res.status(requestCode.SUCCESS)
                .send({ items });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};