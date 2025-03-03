"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaxes = getTaxes;
exports.addTax = addTax;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
const mongodb_1 = require("mongodb");
async function getTaxes(req, res) {
    try {
        const taxes = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.taxes, 'aggregate', [
            {
                $match: { active: true || false }
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
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ taxes });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function addTax(req, res) {
    try {
        const { 'tax-branch': taxBranches, 'tax-name': taxName, 'tax-value': taxValue, 'tax-type': taxType, 'form-sub-tax-list': subTaxes } = req.body;
        const { userId } = req.user;
        let modifiedSubTaxes = null;
        if (subTaxes && subTaxes.length > 0) {
            modifiedSubTaxes = subTaxes.map((tax) => ({
                ...tax,
                _id: new mongodb_1.ObjectId()
            }));
        }
        const existingItem = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.taxes, 'findOne', {
            name: taxName,
            active: true
        });
        if (!existingItem) {
            const taxBranchIds = taxBranches.map((id) => new mongodb_1.ObjectId(id));
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.taxes, 'insertOne', {
                name: taxName,
                value: Number(taxValue),
                type: taxType,
                subTaxes: modifiedSubTaxes,
                branches: (taxBranchIds === null || taxBranchIds === void 0 ? void 0 : taxBranchIds.length) > 0 ? taxBranchIds : null,
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
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'taxAlreadyExist', constants_1.msg.taxAlreadyExist) });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
