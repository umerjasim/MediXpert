import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";

export async function getSuppliers(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const suppliers = await dbHandler(collectionNames.itemSuppliers, 'aggregate', [
            {
                $match: { active: true }
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
                    _id: 1,
                    name: 1,
                    contact: 1,
                    address: 1,
                    gst: 1,
                    licence: 1,
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

        return res.status(requestCode.SUCCESS)
            .send({ suppliers });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function addSupplier(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { userId } = req?.user;
        const {
            'supplier-branch': supplierBranches,
            'supplier-name': supplierName,
            'supplier-gst': supplierGSTNo,
            'supplier-licence-no': supplierLicenceNo,
            'supplier-email': supplierEmail,
            'supplier-mobile-no': supplierMobileNo,
            'supplier-address-line-1': supplierAddress1,
            'supplier-address-line-2': supplierAddress2,
            'supplier-place': supplierPlace,
            'supplier-zip-code': supplierZip
        } = req.body;

        const existingItem = await dbHandler(
            collectionNames.itemSuppliers,
            'findOne',
            {
                name: supplierName,
                active: true
            }
        );

        if (!existingItem) {
            const supplierBranchIds = supplierBranches.map((id: string) => new ObjectId(id));
            await dbHandler(
                collectionNames.itemSuppliers,
                'insertOne',
                {
                    name: supplierName,
                    contact: {
                        mail: supplierEmail || null,
                        mobile: supplierMobileNo || null,
                    },
                    address: {
                        line1: supplierAddress1 || null,
                        line2: supplierAddress2 || null,
                        place: supplierPlace || null,
                        pin: supplierZip || null,
                    },
                    gst: supplierGSTNo || null,
                    licence: supplierLicenceNo || null,
                    branches: supplierBranchIds?.length > 0 ? supplierBranchIds : null,
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
            .send({ error: geti18nResponse(req, 'supplierAlreadyExist', msg.supplierAlreadyExist) });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};