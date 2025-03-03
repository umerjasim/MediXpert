"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalData = getTotalData;
exports.getBranchOutletData = getBranchOutletData;
exports.getBranchOutletPatientData = getBranchOutletPatientData;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
const mongodb_1 = require("mongodb");
const moment_1 = __importDefault(require("moment"));
const dashboard_model_1 = require("../models/dashboard.model");
async function getTotalData(req, res) {
    try {
        const { branch, outlet } = req.user;
        const { from, to, preset } = req.query;
        const dateRange = String(preset) || 'Custom Range';
        const fromDate = String(from);
        const toDate = String(to);
        const { currentStartDate, currentEndDate, previousStartDate, previousEndDate } = await getDateRange(dateRange, [fromDate, toDate]);
        const branchDetails = await (0, dashboard_model_1.getBranchDetails)(branch);
        const branchName = branchDetails ? branchDetails.name : null;
        const outletDetails = await (0, dashboard_model_1.getOutletDetails)(outlet);
        const outletName = outletDetails ? outletDetails.name : null;
        const currentOutletWiseSum = await (0, dashboard_model_1.getCurrentOutletWiseSum)(branch, branchName, currentStartDate, currentEndDate) || [];
        const { totalSum: currentTotalSum, outletSum: currentOutletSum } = await getSumsOfData(currentOutletWiseSum, String(outlet));
        const previousOutletWiseSum = await (0, dashboard_model_1.getPreviousOutletWiseSum)(branch, branchName, previousStartDate, previousEndDate) || [];
        const { totalSum: previousTotalSum, outletSum: previousOutletSum } = await getSumsOfData(previousOutletWiseSum, String(outlet));
        const branchPrevTotal = previousTotalSum.roundedGrandTotal;
        const branchCurrTotal = currentTotalSum.roundedGrandTotal;
        let branchMarginPrecentage = "0.00%";
        let branchMargin = 0;
        if (branchPrevTotal !== 0 && branchCurrTotal !== 0) {
            const percentage = ((branchCurrTotal - branchPrevTotal) / branchPrevTotal) * 100;
            branchMarginPrecentage = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
            branchMargin = percentage;
        }
        const branchTotalSale = { ...currentTotalSum, branchMarginPrecentage, branchMargin };
        const outletPrevTotal = previousOutletSum.roundedGrandTotal;
        const outletCurrTotal = currentOutletSum.roundedGrandTotal;
        let outletMarginPercentage = "0.00%";
        let outletMargin = 0;
        if (outletPrevTotal !== 0 && outletCurrTotal !== 0) {
            const percentage = ((outletCurrTotal - outletPrevTotal) / outletPrevTotal) * 100;
            outletMarginPercentage = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
            outletMargin = percentage;
        }
        const outletTotalSale = { ...currentOutletSum, outletMarginPercentage, outletMargin };
        const currentCollectionSum = await (0, dashboard_model_1.getCurrentCollectionSum)(branch, branchName, currentStartDate, currentEndDate) || [];
        const { totalSum: currentCollectionTotalSum, outletSum: currentCollectionOutletSum } = await getSumsOfCollectionData(currentCollectionSum, String(outlet));
        const previousCollectionSum = await (0, dashboard_model_1.getPreviousCollectionSum)(branch, branchName, previousStartDate, previousEndDate) || [];
        const { totalSum: previousCollectionTotalSum, outletSum: previousCollectionOutletSum } = await getSumsOfCollectionData(previousCollectionSum, String(outlet));
        const branchPrevCollectionTotal = previousCollectionTotalSum.totalPaidAmount;
        const branchCurrCollectionTotal = currentCollectionTotalSum.totalPaidAmount;
        let branchCollectionMarginPrecentage = "0.00%";
        let branchCollectionMargin = 0;
        if (branchPrevCollectionTotal !== 0 && branchCurrCollectionTotal !== 0) {
            const percentage = ((branchCurrCollectionTotal - branchPrevCollectionTotal) / branchPrevCollectionTotal) * 100;
            branchCollectionMarginPrecentage = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
            branchCollectionMargin = percentage;
        }
        const branchCollectionTotalSale = { ...currentCollectionTotalSum, branchCollectionMarginPrecentage, branchCollectionMargin };
        const outletPrevCollectionTotal = previousCollectionOutletSum.totalPaidAmount;
        const outletCurrCollectionTotal = currentCollectionOutletSum.totalPaidAmount;
        let outletCollectionMarginPercentage = "0.00%";
        let outletCollectionMargin = 0;
        if (outletPrevCollectionTotal !== 0 && outletCurrCollectionTotal !== 0) {
            const percentage = ((outletCurrCollectionTotal - outletPrevCollectionTotal) / outletPrevCollectionTotal) * 100;
            outletCollectionMarginPercentage = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
            outletCollectionMargin = percentage;
        }
        const outletCollectionTotalSale = { ...currentCollectionOutletSum, outletCollectionMarginPercentage, outletCollectionMargin };
        const currentBranchPatientCount = await (0, dashboard_model_1.getCurrentBranchPatientCount)(branch, currentStartDate, currentEndDate) || 0;
        const previousBranchPatientCount = await (0, dashboard_model_1.getPreviousBranchPatientCount)(branch, previousStartDate, previousEndDate) || 0;
        let branchPatientCountMarginPrecentage = "0.00%";
        let branchPatientCountMargin = 0;
        if (currentBranchPatientCount !== 0 && previousBranchPatientCount !== 0) {
            const percentage = ((currentBranchPatientCount - previousBranchPatientCount) / previousBranchPatientCount) * 100;
            branchPatientCountMarginPrecentage = `${percentage > 0 ? "+" : percentage < 0 ? "" : ""}${percentage.toFixed(2)}%`;
            branchPatientCountMargin = percentage;
        }
        const currentOutletPatientCount = await (0, dashboard_model_1.getCurrentOutletPatientCount)(outlet, currentStartDate, currentEndDate) || 0;
        const previousOutletPatientCount = await (0, dashboard_model_1.getPreviousOutletPatientCount)(outlet, previousStartDate, previousEndDate) || 0;
        let outletPatientCountMarginPrecentage = "0.00%";
        let outletPatientCountMargin = 0;
        if (currentOutletPatientCount !== 0 && previousOutletPatientCount !== 0) {
            const percentage = ((currentOutletPatientCount - previousOutletPatientCount) / previousOutletPatientCount) * 100;
            outletPatientCountMarginPrecentage = `${percentage > 0 ? "+" : percentage < 0 ? "" : ""}${percentage.toFixed(2)}%`;
            outletPatientCountMargin = percentage;
        }
        const patientVisitCount = {
            branchPatientCount: currentBranchPatientCount,
            outletPatientCount: currentOutletPatientCount,
            branchPrecentage: branchPatientCountMarginPrecentage,
            branchMargin: branchPatientCountMargin,
            outletPrecentage: outletPatientCountMarginPrecentage,
            outletMargin: outletPatientCountMargin
        };
        return res.status(constants_1.requestCode.SUCCESS)
            .send({
            branchName,
            outletName,
            branchTotalSale,
            outletTotalSale,
            branchCollectionTotalSale,
            outletCollectionTotalSale,
            patientVisitCount
        });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
function getSumsOfData(data, outletId) {
    var _a, _b;
    const totalSum = {
        totalAmount: 0,
        discountAmount: 0,
        grandTotal: 0,
        roundedGrandTotal: 0,
        roundoffGrandTotal: 0
    };
    const outletSum = { ...totalSum, outlet: null };
    data.forEach(item => {
        totalSum.totalAmount += item.totalAmount;
        totalSum.discountAmount += item.discountAmount;
        totalSum.grandTotal += item.grandTotal;
        totalSum.roundedGrandTotal += item.roundedGrandTotal;
        totalSum.roundoffGrandTotal += item.roundoffGrandTotal;
        if (item.outletId.toString() === outletId) {
            outletSum.totalAmount += item.totalAmount;
            outletSum.discountAmount += item.discountAmount;
            outletSum.grandTotal += item.grandTotal;
            outletSum.roundedGrandTotal += item.roundedGrandTotal;
            outletSum.roundoffGrandTotal += item.roundoffGrandTotal;
        }
    });
    totalSum.branch = ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.branchName) || null;
    outletSum.outlet = ((_b = data[0]) === null || _b === void 0 ? void 0 : _b.outletName) || null;
    return { totalSum, outletSum };
}
function getSumsOfCollectionData(data, outletId) {
    var _a, _b;
    const totalSum = {
        totalPaidAmount: 0
    };
    const outletSum = { ...totalSum };
    data.forEach(item => {
        totalSum.totalPaidAmount += item.totalPaidAmount;
        if (item.outletId.toString() === outletId) {
            outletSum.totalPaidAmount += item.totalPaidAmount;
        }
    });
    totalSum.branch = ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.branchName) || null;
    outletSum.outlet = ((_b = data[0]) === null || _b === void 0 ? void 0 : _b.outletName) || null;
    return { totalSum, outletSum };
}
const getDateRange = (dateRange, dates) => {
    let currentStartDate = (0, moment_1.default)().startOf('day').toDate();
    let currentEndDate = (0, moment_1.default)().endOf('day').toDate();
    let previousStartDate = (0, moment_1.default)().subtract(1, 'days').startOf('day').toDate();
    let previousEndDate = (0, moment_1.default)().subtract(1, 'days').endOf('day').toDate();
    switch (dateRange) {
        case 'Today':
            currentStartDate = (0, moment_1.default)().startOf('day').toDate();
            currentEndDate = (0, moment_1.default)().endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(1, 'days').startOf('day').toDate();
            previousEndDate = (0, moment_1.default)().subtract(1, 'days').endOf('day').toDate();
            break;
        case 'Yesterday':
            currentStartDate = (0, moment_1.default)().subtract(1, 'days').startOf('day').toDate();
            currentEndDate = (0, moment_1.default)().subtract(1, 'days').endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(2, 'days').startOf('day').toDate();
            previousEndDate = (0, moment_1.default)().subtract(2, 'days').endOf('day').toDate();
            break;
        case 'This Week':
            currentStartDate = (0, moment_1.default)().startOf('week').toDate();
            currentEndDate = (0, moment_1.default)().endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(1, 'week').startOf('week').toDate();
            previousEndDate = (0, moment_1.default)().subtract(1, 'week').endOf('week').toDate();
            break;
        case 'This Month':
            currentStartDate = (0, moment_1.default)().startOf('month').toDate();
            currentEndDate = (0, moment_1.default)().endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(1, 'month').startOf('month').toDate();
            previousEndDate = (0, moment_1.default)().subtract(1, 'month').endOf('month').toDate();
            break;
        case 'Last 7 Days':
            currentStartDate = (0, moment_1.default)().subtract(6, 'days').startOf('day').toDate();
            currentEndDate = (0, moment_1.default)().endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(13, 'days').startOf('day').toDate();
            previousEndDate = (0, moment_1.default)().subtract(7, 'days').endOf('day').toDate();
            break;
        case 'Last 14 Days':
            currentStartDate = (0, moment_1.default)().subtract(13, 'days').startOf('day').toDate();
            currentEndDate = (0, moment_1.default)().endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(27, 'days').startOf('day').toDate();
            previousEndDate = (0, moment_1.default)().subtract(14, 'days').endOf('day').toDate();
            break;
        case 'Last 30 Days':
            currentStartDate = (0, moment_1.default)().subtract(29, 'days').startOf('day').toDate();
            currentEndDate = (0, moment_1.default)().endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(59, 'days').startOf('day').toDate();
            previousEndDate = (0, moment_1.default)().subtract(30, 'days').endOf('day').toDate();
            break;
        case 'Last 90 Days':
            currentStartDate = (0, moment_1.default)().subtract(89, 'days').startOf('day').toDate();
            currentEndDate = (0, moment_1.default)().endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(179, 'days').startOf('day').toDate();
            previousEndDate = (0, moment_1.default)().subtract(90, 'days').endOf('day').toDate();
            break;
        case 'Custom Range':
            if (dates && dates.length === 2) {
                const fromDate = (0, moment_1.default)(dates[0], "DD-MM-YYYY").startOf('day').toDate();
                const toDate = (0, moment_1.default)(dates[1], "DD-MM-YYYY").endOf('day').toDate();
                currentStartDate = fromDate;
                currentEndDate = toDate;
                const diffDays = (0, moment_1.default)(toDate).diff((0, moment_1.default)(fromDate), 'days') + 1;
                previousStartDate = (0, moment_1.default)(fromDate).subtract(diffDays, 'days').startOf('day').toDate();
                previousEndDate = (0, moment_1.default)(toDate).subtract(diffDays, 'days').endOf('day').toDate();
            }
            else {
                currentStartDate = (0, moment_1.default)().startOf('day').toDate();
                currentEndDate = (0, moment_1.default)().endOf('day').toDate();
                previousStartDate = (0, moment_1.default)().subtract(1, 'days').startOf('day').toDate();
                previousEndDate = (0, moment_1.default)().subtract(1, 'days').endOf('day').toDate();
            }
            break;
        default:
            currentStartDate = (0, moment_1.default)().startOf('day').toDate();
            currentEndDate = (0, moment_1.default)().endOf('day').toDate();
            previousStartDate = (0, moment_1.default)().subtract(1, 'days').startOf('day').toDate();
            previousEndDate = (0, moment_1.default)().subtract(1, 'days').endOf('day').toDate();
    }
    return { currentStartDate, currentEndDate, previousStartDate, previousEndDate };
};
async function getBranchOutletData(req, res) {
    try {
        const { branch, outlet } = req.user;
        const { from, to, preset, outletSegment, branchSegment } = req.query;
        const dateRange = String(preset) || 'Custom Range';
        const fromDate = String(from);
        const toDate = String(to);
        const { currentStartDate, currentEndDate, } = await getDateRange(dateRange, [fromDate, toDate]);
        const branchDetails = await (0, dashboard_model_1.getBranchDetails)(branch);
        const branchName = branchDetails ? branchDetails.name : null;
        const outletDetails = await (0, dashboard_model_1.getOutletDetails)(outlet);
        const outletName = outletDetails ? outletDetails.name : null;
        const currentOutletWiseSum = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleMaster, 'aggregate', [
            {
                $match: {
                    outlet: new mongodb_1.ObjectId(outlet),
                    "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                    active: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: "outlet",
                    foreignField: "_id",
                    as: "outletDetails"
                }
            },
            {
                $unwind: "$outletDetails"
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$created.date" }
                    },
                    totalAmount: { $sum: "$totalAmount" },
                    discountAmount: { $sum: "$discountAmount" },
                    grandTotal: { $sum: "$grandTotal" },
                    roundedGrandTotal: { $sum: "$roundedGrandTotal" },
                    roundoffGrandTotal: { $sum: "$roundoffGrandTotal" },
                    branch: { $first: "$branch" },
                    outletName: { $first: "$outletDetails.name" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    outletName: 1,
                    totalAmount: 1,
                    discountAmount: 1,
                    grandTotal: 1,
                    roundedGrandTotal: 1,
                    roundoffGrandTotal: 1,
                    branchName
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);
        const currentBranchWiseSum = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleMaster, 'aggregate', [
            {
                $match: {
                    branch: new mongodb_1.ObjectId(branch),
                    "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                    active: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.branches,
                    localField: "branch",
                    foreignField: "_id",
                    as: "branchDetails"
                }
            },
            {
                $unwind: "$branchDetails"
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$created.date" }
                    },
                    totalAmount: { $sum: "$totalAmount" },
                    discountAmount: { $sum: "$discountAmount" },
                    grandTotal: { $sum: "$grandTotal" },
                    roundedGrandTotal: { $sum: "$roundedGrandTotal" },
                    roundoffGrandTotal: { $sum: "$roundoffGrandTotal" },
                    branch: { $first: "$branch" },
                    outletName: { $first: "$branchDetails.name" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    outletName: 1,
                    totalAmount: 1,
                    discountAmount: 1,
                    grandTotal: 1,
                    roundedGrandTotal: 1,
                    roundoffGrandTotal: 1,
                    branchName
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);
        const currentOutletWiseCollectionSum = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.billMaster, 'aggregate', [
            {
                $match: {
                    outlet: new mongodb_1.ObjectId(outlet),
                    "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                    active: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: "outlet",
                    foreignField: "_id",
                    as: "outletDetails"
                }
            },
            {
                $unwind: "$outletDetails"
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$created.date" }
                    },
                    totalPaidAmount: { $sum: "$totalPaidAmount" },
                    outletName: { $first: "$outletDetails.name" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    outletName: 1,
                    totalPaidAmount: 1,
                    branchName
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);
        const currentBranchWiseCollectionSum = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.billMaster, 'aggregate', [
            {
                $match: {
                    branch: new mongodb_1.ObjectId(branch),
                    "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                    active: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.branches,
                    localField: "branch",
                    foreignField: "_id",
                    as: "branchDetails"
                }
            },
            {
                $unwind: "$branchDetails"
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$created.date" }
                    },
                    totalPaidAmount: { $sum: "$totalPaidAmount" },
                    outletName: { $first: "$outletDetails.name" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    outletName: 1,
                    totalPaidAmount: 1,
                    branchName
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);
        return res.status(constants_1.requestCode.SUCCESS)
            .send({
            branchName,
            outletName,
            currentOutletWiseSum,
            currentBranchWiseSum,
            currentOutletWiseCollectionSum,
            currentBranchWiseCollectionSum
        });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function getBranchOutletPatientData(req, res) {
    try {
        const { branch, outlet } = req.user;
        const { from, to, preset, segment } = req.query;
        const dateRange = String(preset) || 'Custom Range';
        const fromDate = String(from);
        const toDate = String(to);
        const { currentStartDate, currentEndDate, } = await getDateRange(dateRange, [fromDate, toDate]);
        const branchDetails = await (0, dashboard_model_1.getBranchDetails)(branch);
        const branchName = branchDetails ? branchDetails.name : null;
        const outletDetails = await (0, dashboard_model_1.getOutletDetails)(outlet);
        const outletName = outletDetails ? outletDetails.name : null;
        ;
        let match = {
            outlet: new mongodb_1.ObjectId(outlet),
            "created.date": { $gte: currentStartDate, $lte: currentEndDate },
            active: true
        };
        if (segment === 'branch') {
            match = {
                branch: new mongodb_1.ObjectId(branch),
                "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                active: true
            };
        }
        const branchOutletPatientData = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientVisit, 'aggregate', [
            {
                $match: match
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.saleMaster,
                    localField: "saleMasterId",
                    foreignField: "_id",
                    as: "saleMaster"
                }
            },
            {
                $unwind: { path: "$saleMaster", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.billMaster,
                    localField: "saleMaster._id",
                    foreignField: "saleMasterId",
                    as: "billMaster"
                }
            },
            {
                $unwind: { path: "$billMaster", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.saleItems,
                    localField: "saleMaster._id",
                    foreignField: "saleMasterId",
                    as: "saleItems"
                }
            },
            {
                $unwind: { path: "$saleItems", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.items,
                    localField: "saleItems.itemId",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            {
                $unwind: { path: "$saleItems.itemDetails", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.billDetails,
                    localField: "billMaster._id",
                    foreignField: "billMasterId",
                    as: "billDetails"
                }
            },
            {
                $unwind: { path: "$billDetails", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.salePatientMaster,
                    localField: "patientMasterId",
                    foreignField: "_id",
                    as: "patientDetails"
                }
            },
            {
                $unwind: { path: "$patientDetails", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.genders,
                    localField: "patientDetails.gender",
                    foreignField: "_id",
                    as: "gender"
                }
            },
            {
                $unwind: { path: "$gender", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.doctors,
                    localField: "patientDetails.doctor",
                    foreignField: "_id",
                    as: "doctor"
                }
            },
            {
                $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.places,
                    localField: "patientDetails.place",
                    foreignField: "_id",
                    as: "place"
                }
            },
            {
                $unwind: { path: "$place", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.titles,
                    localField: "patientDetails.title",
                    foreignField: "_id",
                    as: "title"
                }
            },
            {
                $unwind: { path: "$title", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.branches,
                    localField: "branch",
                    foreignField: "_id",
                    as: "branchDetails"
                }
            },
            {
                $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: "outlet",
                    foreignField: "_id",
                    as: "outletDetails"
                }
            },
            {
                $unwind: { path: "$outletDetails", preserveNullAndEmptyArrays: true }
            },
            {
                $group: {
                    _id: "$_id",
                    patientMasterId: { $first: "$patientMasterId" },
                    patientVisitId: { $first: "$patientVisitId" },
                    saleMasterId: { $first: "$saleMasterId" },
                    branch: { $first: "$branch" },
                    outlet: { $first: "$outlet" },
                    active: { $first: "$active" },
                    created: { $first: "$created" },
                    modified: { $first: "$modified" },
                    saleMaster: { $first: "$saleMaster" },
                    billMaster: { $first: "$billMaster" },
                    billDetails: { $push: "$billDetails" },
                    branchDetails: { $first: "$branchDetails" },
                    outletDetails: { $first: "$outletDetails" },
                    saleItems: {
                        $push: {
                            amount: "$saleItems.amount",
                            balanceStock: "$saleItems.balanceStock",
                            name: "$itemDetails.name",
                        }
                    },
                    patientDetails: { $first: '$patientDetails' },
                    gender: { $first: '$gender' },
                    doctor: { $first: '$doctor' },
                    place: { $first: '$place' },
                    title: { $first: '$title' }
                }
            },
            {
                $sort: { "created.date": -1 }
            },
            {
                $project: {
                    'patientDetails.age': 1,
                    'patientDetails.fullName': 1,
                    'patientDetails.mobileCode': 1,
                    'patientDetails.mobileNo': 1,
                    'patientDetails.patientId': 1,
                    'patientDetails.dob': 1,
                    'title.name': 1,
                    'gender.name': 1,
                    'gender.code': 1,
                    'doctor.fullName': 1,
                    'place.name': 1,
                    'saleMaster.discountAmount': 1,
                    'saleMaster.grandTotal': 1,
                    'saleMaster.invoiceNo': 1,
                    'saleMaster.roundedGrandTotal': 1,
                    'saleMaster.roundoffGrandTotal': 1,
                    'saleMaster.totalAmount': 1,
                    'billMaster.billNo': 1,
                    'billMaster.totalPaidAmount': 1,
                    patientVisitId: 1,
                    saleItems: 1
                }
            }
        ]);
        console.log(branchOutletPatientData);
        return res.status(constants_1.requestCode.SUCCESS)
            .send({
            branchName,
            outletName,
            branchOutletPatientData
        });
    }
    catch (error) {
        console.log(error);
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
