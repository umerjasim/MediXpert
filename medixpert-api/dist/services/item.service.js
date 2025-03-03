"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMasterData = getMasterData;
exports.addItem = addItem;
exports.getItems = getItems;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
const mongodb_1 = require("mongodb");
async function getMasterData(req, res) {
    try {
        const itemMaster = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemMaster, 'find', { active: true }, { name: 1, isDrug: 1 });
        const itemType = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemType, 'find', { active: true }, { name: 1 });
        const itemCategory = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemCategory, 'find', { active: true }, { name: 1 });
        const itemCode = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemCode, 'find', { active: true }, { name: 1 });
        const itemQtyUnit = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemQtyUnit, 'find', { active: true }, { name: 1 });
        const itemRisk = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemRisk, 'find', { active: true }, { name: 1, color: 1 });
        const itemGeneric = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.genericNames, 'find', { active: true, name: { $ne: "" } }, { name: 1 });
        return res.status(constants_1.requestCode.SUCCESS)
            .send({
            itemMaster,
            itemType,
            itemCategory,
            itemCode,
            itemQtyUnit,
            itemRisk,
            itemGeneric
        });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function addItem(req, res) {
    try {
        const { userId } = req === null || req === void 0 ? void 0 : req.user;
        const { 'item-branch': itemBranches, 'item-master-type': itemMasterType, 'item-name': itemName, 'item-category': itemCategory, 'generic-name': genericName, 'generic-id': genericId, 'item-type': itemType, 'item-qty-unit': itemQtyUnit, 'item-reorder-qty': itemReorderQty, 'item-risk': itemRisk, 'form-item-remarks-list': itemRemarks } = req.body;
        let genericIds = null;
        if (genericName) {
            genericIds = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.genericNames, 'checkAndInsert', {
                name: genericName
            }, {
                name: genericName,
                active: true,
                created: {
                    by: new mongodb_1.ObjectId(userId),
                    on: new Date().toLocaleString(),
                    date: new Date()
                },
                modified: {
                    by: null,
                    on: null,
                    date: null
                }
            });
        }
        const existingItem = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.items, 'findOne', {
            name: itemName,
            active: true
        });
        if (!existingItem) {
            const itemBranchIds = itemBranches.map((id) => new mongodb_1.ObjectId(id));
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.items, 'insertOne', {
                name: itemName,
                genericId: (genericIds === null || genericIds === void 0 ? void 0 : genericIds.insertedId) || null,
                masterId: new mongodb_1.ObjectId(itemMasterType),
                typeId: new mongodb_1.ObjectId(itemType),
                categoryId: itemCategory ? new mongodb_1.ObjectId(itemCategory) : null,
                qtyUnitId: new mongodb_1.ObjectId(itemQtyUnit),
                reorderQty: Number(itemReorderQty),
                riskId: new mongodb_1.ObjectId(itemRisk),
                remarks: itemRemarks && itemRemarks.length ? itemRemarks : null,
                branches: itemBranchIds,
                active: true,
                created: {
                    by: new mongodb_1.ObjectId(userId),
                    on: new Date().toLocaleString(),
                    date: new Date()
                },
                modified: {
                    by: null,
                    on: null,
                    date: null,
                }
            });
            return res.status(constants_1.requestCode.SUCCESS)
                .send({ message: (0, i18n_1.geti18nResponse)(req, 'success', constants_1.msg.success) });
        }
        return res.status(constants_1.requestCode.BAD_REQUEST)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'itemAlreadyExist', constants_1.msg.itemAlreadyExist) });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function getItems(req, res) {
    try {
        const items = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.items, 'aggregate', [
            {
                $lookup: {
                    from: constants_1.collectionNames.genericNames,
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
                    from: constants_1.collectionNames.itemMaster,
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
                    from: constants_1.collectionNames.itemType,
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
                    from: constants_1.collectionNames.itemCategory,
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
                    from: constants_1.collectionNames.itemQtyUnit,
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
                    from: constants_1.collectionNames.itemRisk,
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
                    from: constants_1.collectionNames.branches,
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
        ]);
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ items });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
