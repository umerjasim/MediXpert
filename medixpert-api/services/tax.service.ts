import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";

export async function getTaxes(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const taxes = await dbHandler(collectionNames.taxes, 'aggregate', [
            {
                $match: { active: true || false }
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
                    value: 1,
                    type: 1,
                    subTaxes: 1,
                    branches: 1,
                    active: 1,
                    branchNames: {
                        $map: {
                            input: '$branchDetails',
                            as: 'branch',
                            in: '$$branch.name'
                        }
                    }
                }
            }
        ]);        

        return res.status(requestCode.SUCCESS)
            .send({ taxes });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function addTax(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const {
            'tax-branch': taxBranches,
            'tax-name': taxName,
            'tax-value': taxValue,
            'tax-type': taxType,
            'form-sub-tax-list': subTaxes
        } = req.body;
        const { userId } = req.user;

        let modifiedSubTaxes = null;
        if (subTaxes && subTaxes.length > 0) {
            modifiedSubTaxes = subTaxes.map((tax: any) => ({
                ...tax,
                _id: new ObjectId()
            }));
        }

        const existingItem = await dbHandler(
            collectionNames.taxes,
            'findOne',
            {
                name: taxName,
                active: true
            }
        );

        if (!existingItem) {
            const taxBranchIds = taxBranches.map((id: string) => new ObjectId(id));
            await dbHandler(
                collectionNames.taxes,
                'insertOne',
                {
                    name: taxName,
                    value: Number(taxValue),
                    type: taxType,
                    subTaxes: modifiedSubTaxes,
                    branches: taxBranchIds?.length > 0 ? taxBranchIds : null,
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
            .send({ error: geti18nResponse(req, 'taxAlreadyExist', msg.taxAlreadyExist) });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};