"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchDetails = getBranchDetails;
exports.getOutletDetails = getOutletDetails;
exports.getCurrentOutletWiseSum = getCurrentOutletWiseSum;
exports.getPreviousOutletWiseSum = getPreviousOutletWiseSum;
exports.getCurrentCollectionSum = getCurrentCollectionSum;
exports.getPreviousCollectionSum = getPreviousCollectionSum;
exports.getCurrentBranchPatientCount = getCurrentBranchPatientCount;
exports.getPreviousBranchPatientCount = getPreviousBranchPatientCount;
exports.getCurrentOutletPatientCount = getCurrentOutletPatientCount;
exports.getPreviousOutletPatientCount = getPreviousOutletPatientCount;
const mongodb_1 = require("mongodb");
const constants_1 = require("../helpers/constants");
const logger_1 = __importDefault(require("../helpers/logger"));
const dbConfig_1 = require("../config/dbConfig");
async function getBranchDetails(branch) {
    try {
        const branchDetails = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.branches, 'findOne', {
            _id: new mongodb_1.ObjectId(branch)
        }, {
            projection: { name: 1, _id: 0 }
        });
        return branchDetails;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getOutletDetails(outlet) {
    try {
        const outletDetails = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.outlets, 'findOne', {
            _id: new mongodb_1.ObjectId(outlet)
        }, {
            projection: { name: 1, _id: 0 }
        });
        return outletDetails;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getCurrentOutletWiseSum(branch, branchName, currentStartDate, currentEndDate) {
    try {
        const currentOutletWiseSum = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleMaster, 'aggregate', [
            {
                $match: {
                    branch: new mongodb_1.ObjectId(branch),
                    "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                    active: true
                }
            },
            {
                $group: {
                    _id: '$outlet',
                    totalAmount: { $sum: "$totalAmount" },
                    discountAmount: { $sum: "$discountAmount" },
                    grandTotal: { $sum: "$grandTotal" },
                    roundedGrandTotal: { $sum: "$roundedGrandTotal" },
                    roundoffGrandTotal: { $sum: "$roundoffGrandTotal" }
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: "_id",
                    foreignField: "_id",
                    as: "outletDetails"
                }
            },
            {
                $unwind: "$outletDetails"
            },
            {
                $project: {
                    outletId: "$_id",
                    outletName: "$outletDetails.name",
                    _id: 0,
                    totalAmount: 1,
                    discountAmount: 1,
                    grandTotal: 1,
                    roundedGrandTotal: 1,
                    roundoffGrandTotal: 1,
                    branch: new mongodb_1.ObjectId(branch),
                    branchName
                }
            }
        ]);
        return currentOutletWiseSum;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getPreviousOutletWiseSum(branch, branchName, previousStartDate, previousEndDate) {
    try {
        const previousOutletWiseSum = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleMaster, 'aggregate', [
            {
                $match: {
                    branch: new mongodb_1.ObjectId(branch),
                    "created.date": { $gte: previousStartDate, $lte: previousEndDate },
                    active: true
                }
            },
            {
                $group: {
                    _id: '$outlet',
                    totalAmount: { $sum: "$totalAmount" },
                    discountAmount: { $sum: "$discountAmount" },
                    grandTotal: { $sum: "$grandTotal" },
                    roundedGrandTotal: { $sum: "$roundedGrandTotal" },
                    roundoffGrandTotal: { $sum: "$roundoffGrandTotal" }
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: "_id",
                    foreignField: "_id",
                    as: "outletDetails"
                }
            },
            {
                $unwind: "$outletDetails"
            },
            {
                $project: {
                    outletId: "$_id",
                    outletName: "$outletDetails.name",
                    _id: 0,
                    totalAmount: 1,
                    discountAmount: 1,
                    grandTotal: 1,
                    roundedGrandTotal: 1,
                    roundoffGrandTotal: 1,
                    branch: new mongodb_1.ObjectId(branch),
                    branchName
                }
            }
        ]);
        return previousOutletWiseSum;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getCurrentCollectionSum(branch, branchName, currentStartDate, currentEndDate) {
    try {
        const currentCollectionSum = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.billMaster, 'aggregate', [
            {
                $match: {
                    branch: new mongodb_1.ObjectId(branch),
                    "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                    active: true
                }
            },
            {
                $group: {
                    _id: '$outlet',
                    totalPaidAmount: { $sum: "$totalPaidAmount" }
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: "_id",
                    foreignField: "_id",
                    as: "outletDetails"
                }
            },
            {
                $unwind: "$outletDetails"
            },
            {
                $project: {
                    outletId: "$_id",
                    outletName: "$outletDetails.name",
                    _id: 0,
                    totalPaidAmount: 1,
                    branch: new mongodb_1.ObjectId(branch),
                    branchName
                }
            }
        ]);
        return currentCollectionSum;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getPreviousCollectionSum(branch, branchName, previousStartDate, previousEndDate) {
    try {
        const previousCollectionSum = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.billMaster, 'aggregate', [
            {
                $match: {
                    branch: new mongodb_1.ObjectId(branch),
                    "created.date": { $gte: previousStartDate, $lte: previousEndDate },
                    active: true
                }
            },
            {
                $group: {
                    _id: '$outlet',
                    totalPaidAmount: { $sum: "$totalPaidAmount" }
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: "_id",
                    foreignField: "_id",
                    as: "outletDetails"
                }
            },
            {
                $unwind: "$outletDetails"
            },
            {
                $project: {
                    outletId: "$_id",
                    outletName: "$outletDetails.name",
                    _id: 0,
                    totalPaidAmount: 1,
                    branch: new mongodb_1.ObjectId(branch),
                    branchName
                }
            }
        ]);
        return previousCollectionSum;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getCurrentBranchPatientCount(branch, currentStartDate, currentEndDate) {
    try {
        const currentBranchPatientCount = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientVisit, 'countDocuments', {
            branch: new mongodb_1.ObjectId(branch),
            "created.date": { $gte: currentStartDate, $lte: currentEndDate },
            active: true
        });
        return currentBranchPatientCount;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getPreviousBranchPatientCount(branch, previousStartDate, previousEndDate) {
    try {
        const previousBranchPatientCount = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientVisit, 'countDocuments', {
            branch: new mongodb_1.ObjectId(branch),
            "created.date": { $gte: previousStartDate, $lte: previousEndDate },
            active: true
        });
        return previousBranchPatientCount;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getCurrentOutletPatientCount(outlet, currentStartDate, currentEndDate) {
    try {
        const currentOutletPatientCount = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientVisit, 'countDocuments', {
            outlet: new mongodb_1.ObjectId(outlet),
            "created.date": { $gte: currentStartDate, $lte: currentEndDate },
            active: true
        });
        return currentOutletPatientCount;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getPreviousOutletPatientCount(outlet, previousStartDate, previousEndDate) {
    try {
        const previousOutletPatientCount = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientVisit, 'countDocuments', {
            outlet: new mongodb_1.ObjectId(outlet),
            "created.date": { $gte: previousStartDate, $lte: previousEndDate },
            active: true
        });
        return previousOutletPatientCount;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
// export async function getPreviousCollectionSum(
//     branch: string | ObjectId,
//     branchName: string,
//     previousStartDate: Date,
//     previousEndDate: Date,
// ): Promise<any> {
//     try {
//         return previousCollectionSum;
//     } catch (error) {
//         logger.error(error.stack);
//         return null;
//     }
// };
