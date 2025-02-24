import { ObjectId } from "mongodb";
import { collectionNames } from "../helpers/constants";
import logger from "../helpers/logger";
import { dbHandler } from "../config/dbConfig";

export async function getBranchDetails(
    branch: string | ObjectId
): Promise<any> {
    try {
        const branchDetails = await dbHandler(
            collectionNames.branches,
            'findOne',
            {
                _id: new ObjectId(branch)
            },
            {
                projection: { name: 1, _id: 0 }
            }
        );
        
        return branchDetails;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getOutletDetails(
    outlet: string | ObjectId
): Promise<any> {
    try {
        const outletDetails = await dbHandler(
            collectionNames.outlets,
            'findOne',
            {
                _id: new ObjectId(outlet)
            },
            {
                projection: { name: 1, _id: 0 }
            }
        );
        
        return outletDetails;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getCurrentOutletWiseSum(
    branch: string | ObjectId,
    branchName: string,
    currentStartDate: Date,
    currentEndDate: Date,
): Promise<any> {
    try {
        const currentOutletWiseSum = await dbHandler(
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
                        from: collectionNames.outlets,
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
                        branch: new ObjectId(branch),
                        branchName
                    }
                }
            ]
        );
        
        return currentOutletWiseSum;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getPreviousOutletWiseSum(
    branch: string | ObjectId,
    branchName: string,
    previousStartDate: Date,
    previousEndDate: Date,
): Promise<any> {
    try {
        const previousOutletWiseSum = await dbHandler(
            collectionNames.saleMaster,
            'aggregate',
            [
                {
                    $match: {
                        branch: new ObjectId(branch),
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
                        from: collectionNames.outlets,
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
                        branch: new ObjectId(branch),
                        branchName
                    }
                }
            ]
        );
        
        return previousOutletWiseSum;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getCurrentCollectionSum(
    branch: string | ObjectId,
    branchName: string,
    currentStartDate: Date,
    currentEndDate: Date,
): Promise<any> {
    try {
        const currentCollectionSum = await dbHandler(
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
                    $group: {
                        _id: '$outlet',
                        totalPaidAmount: { $sum: "$totalPaidAmount" }
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.outlets,
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
                        branch: new ObjectId(branch),
                        branchName
                    }
                }
            ]
        );
        
        return currentCollectionSum;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getPreviousCollectionSum(
    branch: string | ObjectId,
    branchName: string,
    previousStartDate: Date,
    previousEndDate: Date,
): Promise<any> {
    try {
        const previousCollectionSum = await dbHandler(
            collectionNames.billMaster,
            'aggregate',
            [
                {
                    $match: {
                        branch: new ObjectId(branch),
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
                        from: collectionNames.outlets,
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
                        branch: new ObjectId(branch),
                        branchName
                    }
                }
            ]
        );
        
        return previousCollectionSum;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getCurrentBranchPatientCount(
    branch: string | ObjectId,
    currentStartDate: Date,
    currentEndDate: Date,
): Promise<any> {
    try {
        const currentBranchPatientCount = await dbHandler(
            collectionNames.salePatientVisit,
            'countDocuments', 
            { 
                branch: new ObjectId(branch),
                "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                active: true
            }
        );

        return currentBranchPatientCount;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getPreviousBranchPatientCount(
    branch: string | ObjectId,
    previousStartDate: Date,
    previousEndDate: Date,
): Promise<any> {
    try {
        const previousBranchPatientCount = await dbHandler(
            collectionNames.salePatientVisit,
            'countDocuments', 
            { 
                branch: new ObjectId(branch),
                "created.date": { $gte: previousStartDate, $lte: previousEndDate },
                active: true
            }
        );

        return previousBranchPatientCount;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getCurrentOutletPatientCount(
    outlet: string | ObjectId,
    currentStartDate: Date,
    currentEndDate: Date,
): Promise<any> {
    try {
        const currentOutletPatientCount = await dbHandler(
            collectionNames.salePatientVisit,
            'countDocuments', 
            { 
                outlet: new ObjectId(outlet),
                "created.date": { $gte: currentStartDate, $lte: currentEndDate },
                active: true
            }
        );

        return currentOutletPatientCount;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

export async function getPreviousOutletPatientCount(
    outlet: string | ObjectId,
    previousStartDate: Date,
    previousEndDate: Date,
): Promise<any> {
    try {
        const previousOutletPatientCount = await dbHandler(
            collectionNames.salePatientVisit,
            'countDocuments', 
            { 
                outlet: new ObjectId(outlet),
                "created.date": { $gte: previousStartDate, $lte: previousEndDate },
                active: true
            }
        );

        return previousOutletPatientCount;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
};

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