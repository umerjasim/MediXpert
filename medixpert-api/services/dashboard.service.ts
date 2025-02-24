import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";
import moment from "moment";
import { getBranchDetails, getCurrentBranchPatientCount, getCurrentCollectionSum, getCurrentOutletPatientCount, getCurrentOutletWiseSum, 
    getOutletDetails, getPreviousBranchPatientCount, getPreviousCollectionSum, getPreviousOutletPatientCount, getPreviousOutletWiseSum } from "../models/dashboard.model";

export async function getTotalData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch, outlet } = req.user;
        const { from, to, preset } = req.query;

        const dateRange: string = String(preset) || 'Custom Range';
        const fromDate: string = String(from);
        const toDate: string = String(to);

        const { 
            currentStartDate, 
            currentEndDate, 
            previousStartDate, 
            previousEndDate 
        } = await getDateRange(dateRange, [fromDate, toDate]);

        const branchDetails = await getBranchDetails(branch);
        const branchName: string = branchDetails ? branchDetails.name : null;

        const outletDetails = await getOutletDetails(outlet);
        const outletName: string = outletDetails ? outletDetails.name : null; 

        const currentOutletWiseSum = await getCurrentOutletWiseSum(branch, branchName, currentStartDate, currentEndDate) || [];
        const { totalSum: currentTotalSum, outletSum: currentOutletSum } = await getSumsOfData(currentOutletWiseSum, String(outlet));
        
        const previousOutletWiseSum = await getPreviousOutletWiseSum(branch, branchName, previousStartDate, previousEndDate) || [];
        const { totalSum: previousTotalSum, outletSum: previousOutletSum }  = await getSumsOfData(previousOutletWiseSum, String(outlet));

        const branchPrevTotal: number = previousTotalSum.roundedGrandTotal;
        const branchCurrTotal: number = currentTotalSum.roundedGrandTotal;
        let branchMarginPrecentage = "0.00%";
        let branchMargin = 0;

        if (branchPrevTotal !== 0 && branchCurrTotal !== 0) {
            const percentage = ((branchCurrTotal - branchPrevTotal) / branchPrevTotal) * 100;
            branchMarginPrecentage = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
            branchMargin = percentage;
        }

        const branchTotalSale = { ...currentTotalSum, branchMarginPrecentage, branchMargin };

        const outletPrevTotal: number = previousOutletSum.roundedGrandTotal;
        const outletCurrTotal: number = currentOutletSum.roundedGrandTotal;
        let outletMarginPercentage = "0.00%";
        let outletMargin = 0;

        if (outletPrevTotal !== 0 && outletCurrTotal !== 0) {
            const percentage = ((outletCurrTotal - outletPrevTotal) / outletPrevTotal) * 100;
            outletMarginPercentage = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
            outletMargin = percentage;
        }

        const outletTotalSale = { ...currentOutletSum, outletMarginPercentage, outletMargin };

        const currentCollectionSum = await getCurrentCollectionSum(branch, branchName, currentStartDate, currentEndDate) || [];
        const { 
            totalSum: currentCollectionTotalSum, 
            outletSum: currentCollectionOutletSum 
        } = await getSumsOfCollectionData(currentCollectionSum, String(outlet));

        const previousCollectionSum = await getPreviousCollectionSum(branch, branchName, previousStartDate, previousEndDate) || [];
        const { 
            totalSum: previousCollectionTotalSum, 
            outletSum: previousCollectionOutletSum 
        } = await getSumsOfCollectionData(previousCollectionSum, String(outlet));

        const branchPrevCollectionTotal: number = previousCollectionTotalSum.totalPaidAmount;
        const branchCurrCollectionTotal: number = currentCollectionTotalSum.totalPaidAmount;
        let branchCollectionMarginPrecentage = "0.00%";
        let branchCollectionMargin = 0;

        if (branchPrevCollectionTotal !== 0 && branchCurrCollectionTotal !== 0) {
            const percentage = ((branchCurrCollectionTotal - branchPrevCollectionTotal) / branchPrevCollectionTotal) * 100;
            branchCollectionMarginPrecentage = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
            branchCollectionMargin = percentage;
        }

        const branchCollectionTotalSale = { ...currentCollectionTotalSum, branchCollectionMarginPrecentage, branchCollectionMargin };

        const outletPrevCollectionTotal: number = previousCollectionOutletSum.totalPaidAmount;
        const outletCurrCollectionTotal: number = currentCollectionOutletSum.totalPaidAmount;
        let outletCollectionMarginPercentage = "0.00%";
        let outletCollectionMargin = 0;

        if (outletPrevCollectionTotal !== 0 && outletCurrCollectionTotal !== 0) {
            const percentage = ((outletCurrCollectionTotal - outletPrevCollectionTotal) / outletPrevCollectionTotal) * 100;
            outletCollectionMarginPercentage = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
            outletCollectionMargin = percentage;
        }

        const outletCollectionTotalSale = { ...currentCollectionOutletSum, outletCollectionMarginPercentage, outletCollectionMargin };

        const currentBranchPatientCount = await getCurrentBranchPatientCount(branch, currentStartDate, currentEndDate) || 0;
        
        const previousBranchPatientCount = await getPreviousBranchPatientCount(branch, previousStartDate, previousEndDate) || 0;

        let branchPatientCountMarginPrecentage = "0.00%";
        let branchPatientCountMargin = 0;

        if (currentBranchPatientCount !== 0 && previousBranchPatientCount !== 0) {
            const percentage = ((currentBranchPatientCount - previousBranchPatientCount) / previousBranchPatientCount) * 100;
            branchPatientCountMarginPrecentage = `${percentage > 0 ? "+" : percentage < 0 ? "" : ""}${percentage.toFixed(2)}%`;
            branchPatientCountMargin = percentage;
        }

        const currentOutletPatientCount = await getCurrentOutletPatientCount(outlet, currentStartDate, currentEndDate) || 0;

        const previousOutletPatientCount = await getPreviousOutletPatientCount(outlet, previousStartDate, previousEndDate) || 0;

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

        return res.status(requestCode.SUCCESS)
            .send({ 
                branchName,
                outletName,
                branchTotalSale, 
                outletTotalSale, 
                branchCollectionTotalSale, 
                outletCollectionTotalSale,
                patientVisitCount
            });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
}

function getSumsOfData(data: any[], outletId: string) {
    const totalSum: any = {
        totalAmount: 0,
        discountAmount: 0,
        grandTotal: 0,
        roundedGrandTotal: 0,
        roundoffGrandTotal: 0
    };

    const outletSum: any = { ...totalSum, outlet: null };

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
    totalSum.branch = data[0]?.branchName || null;
    outletSum.outlet = data[0]?.outletName || null;

    return { totalSum, outletSum };
}

function getSumsOfCollectionData(data: any[], outletId: string) {
    const totalSum: any = {
        totalPaidAmount: 0
    };

    const outletSum: any = { ...totalSum };

    data.forEach(item => {
        totalSum.totalPaidAmount += item.totalPaidAmount;

        if (item.outletId.toString() === outletId) {
            outletSum.totalPaidAmount += item.totalPaidAmount;
        }
    });
    totalSum.branch = data[0]?.branchName || null;
    outletSum.outlet = data[0]?.outletName || null;

    return { totalSum, outletSum };
}

const getDateRange = (dateRange?: string, dates?: [string, string]) => {
    let currentStartDate = moment().startOf('day').toDate();
    let currentEndDate = moment().endOf('day').toDate();
    let previousStartDate = moment().subtract(1, 'days').startOf('day').toDate();
    let previousEndDate = moment().subtract(1, 'days').endOf('day').toDate();

    switch (dateRange) {
        case 'Today':
            currentStartDate = moment().startOf('day').toDate();
            currentEndDate = moment().endOf('day').toDate();
            previousStartDate = moment().subtract(1, 'days').startOf('day').toDate();
            previousEndDate = moment().subtract(1, 'days').endOf('day').toDate();
        break;

        case 'Yesterday':
            currentStartDate = moment().subtract(1, 'days').startOf('day').toDate();
            currentEndDate = moment().subtract(1, 'days').endOf('day').toDate();
            previousStartDate = moment().subtract(2, 'days').startOf('day').toDate();
            previousEndDate = moment().subtract(2, 'days').endOf('day').toDate();
        break;

        case 'This Week':
            currentStartDate = moment().startOf('week').toDate();
            currentEndDate = moment().endOf('day').toDate();
            previousStartDate = moment().subtract(1, 'week').startOf('week').toDate();
            previousEndDate = moment().subtract(1, 'week').endOf('week').toDate();
        break;

        case 'This Month':
            currentStartDate = moment().startOf('month').toDate();
            currentEndDate = moment().endOf('day').toDate();
            previousStartDate = moment().subtract(1, 'month').startOf('month').toDate();
            previousEndDate = moment().subtract(1, 'month').endOf('month').toDate();
        break;
        
        case 'Last 7 Days':
            currentStartDate = moment().subtract(6, 'days').startOf('day').toDate();
            currentEndDate = moment().endOf('day').toDate();
            previousStartDate = moment().subtract(13, 'days').startOf('day').toDate();
            previousEndDate = moment().subtract(7, 'days').endOf('day').toDate();
        break;

        case 'Last 14 Days':
            currentStartDate = moment().subtract(13, 'days').startOf('day').toDate();
            currentEndDate = moment().endOf('day').toDate();
            previousStartDate = moment().subtract(27, 'days').startOf('day').toDate();
            previousEndDate = moment().subtract(14, 'days').endOf('day').toDate();
        break;

        case 'Last 30 Days':
            currentStartDate = moment().subtract(29, 'days').startOf('day').toDate();
            currentEndDate = moment().endOf('day').toDate();
            previousStartDate = moment().subtract(59, 'days').startOf('day').toDate();
            previousEndDate = moment().subtract(30, 'days').endOf('day').toDate();
        break;

        case 'Last 90 Days':
            currentStartDate = moment().subtract(89, 'days').startOf('day').toDate();
            currentEndDate = moment().endOf('day').toDate();
            previousStartDate = moment().subtract(179, 'days').startOf('day').toDate();
            previousEndDate = moment().subtract(90, 'days').endOf('day').toDate();
        break;

        case 'Custom Range':
            if (dates && dates.length === 2) {
                const fromDate = moment(dates[0], "DD-MM-YYYY").startOf('day').toDate();
                const toDate = moment(dates[1], "DD-MM-YYYY").endOf('day').toDate();

                currentStartDate = fromDate;
                currentEndDate = toDate;

                const diffDays = moment(toDate).diff(moment(fromDate), 'days') + 1;
                previousStartDate = moment(fromDate).subtract(diffDays, 'days').startOf('day').toDate();
                previousEndDate = moment(toDate).subtract(diffDays, 'days').endOf('day').toDate();
            } else {
                currentStartDate = moment().startOf('day').toDate();
                currentEndDate = moment().endOf('day').toDate();
                previousStartDate = moment().subtract(1, 'days').startOf('day').toDate();
                previousEndDate = moment().subtract(1, 'days').endOf('day').toDate();
            }
            break;


        default:
            currentStartDate = moment().startOf('day').toDate();
            currentEndDate = moment().endOf('day').toDate();
            previousStartDate = moment().subtract(1, 'days').startOf('day').toDate();
            previousEndDate = moment().subtract(1, 'days').endOf('day').toDate();
    }

    return { currentStartDate, currentEndDate, previousStartDate, previousEndDate };
};


export async function getBranchOutletData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch, outlet } = req.user;
        const { from, to, preset, outletSegment, branchSegment } = req.query;

        const dateRange: string = String(preset) || 'Custom Range';
        const fromDate: string = String(from);
        const toDate: string = String(to);

        const { 
            currentStartDate, 
            currentEndDate, 
        } = await getDateRange(dateRange, [fromDate, toDate]);
        
        const branchDetails = await getBranchDetails(branch);
        const branchName: string = branchDetails ? branchDetails.name : null;

        const outletDetails = await getOutletDetails(outlet);
        const outletName: string = outletDetails ? outletDetails.name : null; 

        const currentOutletWiseSum = await dbHandler(
            collectionNames.saleMaster,
            'aggregate',
            [
                {
                    $match: {
                        outlet: new ObjectId(outlet),
                        "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                        active: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.outlets,
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
            ]
        );

        const currentBranchWiseSum = await dbHandler(
            collectionNames.saleMaster,
            'aggregate',
            [
                {
                    $match: {
                        branch: new ObjectId(branch),
                        "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                        active: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.branches,
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
            ]
        );

        const currentOutletWiseCollectionSum = await dbHandler(
            collectionNames.billMaster,
            'aggregate',
            [
                {
                    $match: {
                        outlet: new ObjectId(outlet),
                        "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                        active: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.outlets,
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
            ]
        );

        const currentBranchWiseCollectionSum = await dbHandler(
            collectionNames.billMaster,
            'aggregate',
            [
                {
                    $match: {
                        branch: new ObjectId(branch),
                        "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                        active: true
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.branches,
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
            ]
        );

        return res.status(requestCode.SUCCESS)
            .send({ 
                branchName,
                outletName,
                currentOutletWiseSum,
                currentBranchWiseSum,
                currentOutletWiseCollectionSum,
                currentBranchWiseCollectionSum
            });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function getBranchOutletPatientData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch, outlet } = req.user;
        const { from, to, preset, segment } = req.query;

        const dateRange: string = String(preset) || 'Custom Range';
        const fromDate: string = String(from);
        const toDate: string = String(to);

        const { 
            currentStartDate, 
            currentEndDate, 
        } = await getDateRange(dateRange, [fromDate, toDate]);
        
        const branchDetails = await getBranchDetails(branch);
        const branchName: string = branchDetails ? branchDetails.name : null;

        const outletDetails = await getOutletDetails(outlet);
        const outletName: string = outletDetails ? outletDetails.name : null; ; 

        let match: any =  {
            outlet: new ObjectId(outlet),
            "created.date": { $gte: currentStartDate, $lte: currentEndDate },
            active: true
        }
        if (segment === 'branch') {
            match =  {
                branch: new ObjectId(branch),
                "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                active: true
            }
        }

        const branchOutletPatientData = await dbHandler(
            collectionNames.salePatientVisit,
            'aggregate',
            [
                {
                    $match: match
                },
                {
                    $lookup: {
                        from: collectionNames.saleMaster,
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
                        from: collectionNames.billMaster,
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
                        from: collectionNames.saleItems,
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
                        from: collectionNames.items,
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
                        from: collectionNames.billDetails,
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
                        from: collectionNames.salePatientMaster,
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
                        from: collectionNames.genders,
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
                        from: collectionNames.doctors,
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
                        from: collectionNames.places,
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
                        from: collectionNames.titles,
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
                        from: collectionNames.branches,
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
                        from: collectionNames.outlets,
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
            ]
        );
        
        console.log(branchOutletPatientData)

        return res.status(requestCode.SUCCESS)
            .send({ 
                branchName,
                outletName,
                branchOutletPatientData
            });
    } catch (error) {
        console.log(error)
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};