"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuppliers = getSuppliers;
exports.addSupplier = addSupplier;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
const mongodb_1 = require("mongodb");
async function getSuppliers(req, res) {
    try {
        const suppliers = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemSuppliers, 'aggregate', [
            {
                $match: { active: true }
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
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ suppliers });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function addSupplier(req, res) {
    try {
        const { userId } = req === null || req === void 0 ? void 0 : req.user;
        const { 'supplier-branch': supplierBranches, 'supplier-name': supplierName, 'supplier-gst': supplierGSTNo, 'supplier-licence-no': supplierLicenceNo, 'supplier-email': supplierEmail, 'supplier-mobile-no': supplierMobileNo, 'supplier-address-line-1': supplierAddress1, 'supplier-address-line-2': supplierAddress2, 'supplier-place': supplierPlace, 'supplier-zip-code': supplierZip } = req.body;
        const existingItem = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemSuppliers, 'findOne', {
            name: supplierName,
            active: true
        });
        if (!existingItem) {
            const supplierBranchIds = supplierBranches.map((id) => new mongodb_1.ObjectId(id));
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemSuppliers, 'insertOne', {
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
                branches: (supplierBranchIds === null || supplierBranchIds === void 0 ? void 0 : supplierBranchIds.length) > 0 ? supplierBranchIds : null,
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
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'supplierAlreadyExist', constants_1.msg.supplierAlreadyExist) });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
