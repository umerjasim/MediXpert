"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMasterData = getMasterData;
exports.addPurchaseEntry = addPurchaseEntry;
exports.getApprovePurchaseEntry = getApprovePurchaseEntry;
exports.approvePurchaseEntry = approvePurchaseEntry;
exports.getPurchaseEntryItems = getPurchaseEntryItems;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
const mongodb_1 = require("mongodb");
const utility_1 = require("../utility/utility");
async function getMasterData(req, res) {
    try {
        const { branch } = req.user;
        const items = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.items, 'aggregate', [
            {
                $match: {
                    active: true,
                    branches: new mongodb_1.ObjectId(branch)
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.itemMaster,
                    localField: 'masterId',
                    foreignField: '_id',
                    as: 'masterTypesData'
                }
            },
            {
                $unwind: {
                    path: '$masterTypesData',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);
        const manufacturers = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.manufacturers, 'find', {
            active: true,
            branches: new mongodb_1.ObjectId(branch)
        });
        const qtyUnits = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemQtyUnit, 'find', {
            active: true
        });
        const taxes = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.taxes, 'find', {
            active: true,
            branches: new mongodb_1.ObjectId(branch)
        });
        const outlets = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.outlets, 'find', {
            active: true,
            branchId: new mongodb_1.ObjectId(branch)
        });
        const suppliers = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemSuppliers, 'find', {
            active: true,
            branches: new mongodb_1.ObjectId(branch)
        });
        const purchaseFormTypes = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseFormTypes, 'find', {
            active: true,
            branches: new mongodb_1.ObjectId(branch)
        });
        const purchaseTypes = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseTypes, 'find', {
            active: true,
            branches: new mongodb_1.ObjectId(branch)
        });
        return res.status(constants_1.requestCode.SUCCESS)
            .send({
            items,
            manufacturers,
            qtyUnits,
            outlets,
            taxes,
            suppliers,
            purchaseFormTypes,
            purchaseTypes
        });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function generateGRN() {
    try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const currentFinancialYear = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
        const keyWord = constants_1.numberKeyWords.grnNo || 'GRN';
        const keyWordLength = keyWord.length;
        const grnNos = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseEntries, 'findOne', {}, {
            projection: { grnNo: 1 },
            sort: { "created.date": -1 }
        });
        if (grnNos === null || grnNos === void 0 ? void 0 : grnNos.grnNo) {
            const existingYear = grnNos.grnNo.slice(keyWord + 4, 7);
            let nextSerial;
            if (existingYear === currentFinancialYear) {
                const existingSerial = parseInt(grnNos.grnNo.slice(keyWord + 4), 10);
                nextSerial = (existingSerial + 1).toString().padStart(8, '0');
            }
            else {
                nextSerial = constants_1.numberKeyWords.grnNoStart;
            }
            return `${constants_1.numberKeyWords.grnNo}${currentFinancialYear}${nextSerial}`;
        }
        else {
            return `${constants_1.numberKeyWords.grnNo}${currentFinancialYear}${constants_1.numberKeyWords.grnNoStart}`;
        }
    }
    catch (error) {
        throw error;
    }
}
async function addPurchaseEntry(req, res) {
    var _a, _b, _c;
    try {
        const { userId } = req === null || req === void 0 ? void 0 : req.user;
        const form1Values = ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.form1Values) || {};
        const form2Values = ((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.form2Values) || {};
        const itemsData = ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.resultData) || [];
        const { 'purchase-entry-branch': branch, 'purchase-entry-outlet': outlet, 'purchase-entry-supplier': supplier, 'purchase-entry-form-type': formType, 'purchase-entry-type': type, 'purchase-entry-order-no': purachseOrderNo, 'purchase-entry-invoice-no': invoiceNo, 'purchase-entry-invoice-date': invoiceDate, 'purchase-entry-date': entryDate } = form1Values;
        const { 'purchase-entry-taxable-amount': taxableAmount, 'purchase-entry-non-taxable-amount': nonTaxableAmount, 'purchase-entry-added-discount': addedDiscount, 'purchase-entry-extra-discount': extraDiscount, 'purchase-entry-total-tax-amount': totalTaxAmount, 'purchase-entry-total-amount': totalAmount, 'purchase-entry-round-off': roundOff, 'purchase-entry-net-invoice-amount': netInvoiceAmount, 'purchase-entry-remarks': remarks, 'purchase-entry-total-mrp': totalMrp } = form2Values;
        const taxData = [];
        Object.keys(form2Values).forEach((key) => {
            if (key.startsWith('purchase-entry-amount-for-tax-')) {
                const index = key.split('-').pop();
                const taxAmount = form2Values[key];
                const taxSplitKey = `purchase-entry-tax-split-tax-${index}`;
                if (taxSplitKey in form2Values) {
                    const taxSplit = form2Values[taxSplitKey];
                    taxData.push({
                        taxAmount,
                        taxSplit
                    });
                }
            }
        });
        const grn = await generateGRN();
        const purachseEntries = {
            _id: new mongodb_1.ObjectId(),
            grnNo: grn,
            branchId: new mongodb_1.ObjectId(branch),
            outletId: new mongodb_1.ObjectId(outlet),
            supplierId: new mongodb_1.ObjectId(supplier),
            formTypeId: new mongodb_1.ObjectId(formType),
            purchaseTypeId: new mongodb_1.ObjectId(type),
            purachseOrderNo: purachseOrderNo || null,
            invoiceNo: invoiceNo,
            invoiceDate: new Date(invoiceDate),
            entryDate: new Date(entryDate),
            remarks: remarks,
            attachementId: null,
            active: true,
            approved: {
                status: false,
                by: null,
                on: null,
                date: null,
            },
            created: {
                by: new mongodb_1.ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date(),
            },
            modified: {
                by: null,
                on: null,
                date: null,
            }
        };
        const insertedEntryId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseEntries, 'insertOne', purachseEntries);
        const entryId = insertedEntryId.insertedId;
        const purchaseEntryAmounts = {
            _id: new mongodb_1.ObjectId(),
            purchaseEntryId: entryId,
            taxableAmount: taxableAmount,
            nonTaxableAmount: nonTaxableAmount,
            itemsDiscount: addedDiscount,
            extraDiscount: extraDiscount,
            totalTaxAmount: totalTaxAmount,
            totalAmount: totalAmount,
            totalMrp: totalMrp,
            roundOff: roundOff,
            netInvoiceAmount: netInvoiceAmount,
            taxSplit: taxData.length > 0 ? taxData : null,
            active: true,
            created: {
                by: new mongodb_1.ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date(),
            },
            modified: {
                by: null,
                on: null,
                date: null,
            }
        };
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseEntryAmounts, 'insertOne', purchaseEntryAmounts);
        const purchaseEntryItems = await Promise.all(itemsData.map(async (item) => {
            const manufacturer = {
                _id: new mongodb_1.ObjectId(),
                name: item === null || item === void 0 ? void 0 : item.manufacturer,
                contact: {
                    mail: null,
                    mobile: null,
                },
                address: {
                    line1: null,
                    line2: null,
                    place: null,
                    pin: null
                },
                gst: null,
                licence: null,
                branches: [new mongodb_1.ObjectId(branch)],
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
            };
            const insertedManufacturerId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.manufacturers, 'checkAndInsert', {
                name: item === null || item === void 0 ? void 0 : item.manufacturer
            }, manufacturer);
            const manufacturerId = insertedManufacturerId === null || insertedManufacturerId === void 0 ? void 0 : insertedManufacturerId.insertedId;
            const items = {
                _id: new mongodb_1.ObjectId(),
                purchaseEntryId: entryId,
                itemId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.itemName),
                manufacturerId: new mongodb_1.ObjectId(manufacturerId),
                hsnNo: item === null || item === void 0 ? void 0 : item.hsnNo,
                batchNo: item === null || item === void 0 ? void 0 : item.batchNo,
                rackNo: item === null || item === void 0 ? void 0 : item.rackNo,
                expiry: new Date(item === null || item === void 0 ? void 0 : item.expiry) || null,
                pack: item === null || item === void 0 ? void 0 : item.pack,
                packUnitId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.packUnit),
                qty: item === null || item === void 0 ? void 0 : item.qty,
                totalQty: item === null || item === void 0 ? void 0 : item.totalQty,
                freeQty: item === null || item === void 0 ? void 0 : item.freeQty,
                totalFreeQty: item === null || item === void 0 ? void 0 : item.totalFreeQty,
                rate: item === null || item === void 0 ? void 0 : item.rate,
                totalCost: item === null || item === void 0 ? void 0 : item.totalCost,
                costPerQty: item === null || item === void 0 ? void 0 : item.costPerQty,
                mrp: item === null || item === void 0 ? void 0 : item.mrp,
                mrpPerQty: item === null || item === void 0 ? void 0 : item.mrpPerQty,
                discount: item === null || item === void 0 ? void 0 : item.discount,
                discountAmount: item === null || item === void 0 ? void 0 : item.discountAmount,
                totalAmount: item === null || item === void 0 ? void 0 : item.totalAmount,
                taxId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.tax),
                taxInclusive: item === null || item === void 0 ? void 0 : item.taxInclusive,
                taxIdForFree: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.taxOnFree) || null,
                margin: (item === null || item === void 0 ? void 0 : item.margin) || null,
                ptr: (item === null || item === void 0 ? void 0 : item.ptr) || null,
                outletId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.outlet),
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
            };
            return items;
        }));
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseEntryItems, 'insertMany', purchaseEntryItems);
        const itemsStock = await Promise.all(itemsData.map(async (item) => {
            var _a, _b, _c;
            const tax = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.taxes, 'findOne', {
                _id: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.tax)
            });
            let taxForFree = {};
            if (item === null || item === void 0 ? void 0 : item.taxIdForFree) {
                taxForFree = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.taxes, 'findOne', {
                    _id: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.taxIdForFree)
                });
            }
            const stock = {
                _id: new mongodb_1.ObjectId(),
                purchaseId: entryId,
                transferId: null,
                itemId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.itemName),
                branchId: new mongodb_1.ObjectId(branch),
                outletId: new mongodb_1.ObjectId(outlet),
                hsnNo: item === null || item === void 0 ? void 0 : item.hsnNo,
                batchNo: item === null || item === void 0 ? void 0 : item.batchNo,
                rackNo: item === null || item === void 0 ? void 0 : item.rackNo,
                expiry: new Date(item === null || item === void 0 ? void 0 : item.expiry) || null,
                pack: item === null || item === void 0 ? void 0 : item.pack,
                packUnitId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.packUnit),
                qty: item === null || item === void 0 ? void 0 : item.qty,
                totalQty: item === null || item === void 0 ? void 0 : item.totalQty,
                freeQty: item === null || item === void 0 ? void 0 : item.freeQty,
                totalFreeQty: item === null || item === void 0 ? void 0 : item.totalFreeQty,
                rate: item === null || item === void 0 ? void 0 : item.rate,
                totalCost: item === null || item === void 0 ? void 0 : item.totalCost,
                costPerQty: item === null || item === void 0 ? void 0 : item.costPerQty,
                mrp: item === null || item === void 0 ? void 0 : item.mrp,
                mrpPerQty: item === null || item === void 0 ? void 0 : item.mrpPerQty,
                discount: item === null || item === void 0 ? void 0 : item.discount,
                discountAmount: item === null || item === void 0 ? void 0 : item.discountAmount,
                totalAmount: item === null || item === void 0 ? void 0 : item.totalAmount,
                margin: (item === null || item === void 0 ? void 0 : item.margin) || null,
                ptr: (item === null || item === void 0 ? void 0 : item.ptr) || null,
                tax: {
                    taxId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.tax),
                    taxType: tax === null || tax === void 0 ? void 0 : tax.type,
                    taxValue: tax === null || tax === void 0 ? void 0 : tax.value,
                    inclusive: (item === null || item === void 0 ? void 0 : item.taxInclusive) || false,
                    subTaxes: ((_a = tax === null || tax === void 0 ? void 0 : tax.subTaxes) === null || _a === void 0 ? void 0 : _a.length) > 0 ? tax === null || tax === void 0 ? void 0 : tax.subTaxes : null,
                },
                taxForFree: (item === null || item === void 0 ? void 0 : item.taxIdForFree) ? {
                    taxId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.taxIdForFree),
                    taxType: taxForFree === null || taxForFree === void 0 ? void 0 : taxForFree.type,
                    taxValue: taxForFree === null || taxForFree === void 0 ? void 0 : taxForFree.value,
                    inclusive: taxForFree === null || taxForFree === void 0 ? void 0 : taxForFree.taxInclusive,
                    subTaxes: ((_b = taxForFree === null || taxForFree === void 0 ? void 0 : taxForFree.subTaxes) === null || _b === void 0 ? void 0 : _b.length) > 0 ? taxForFree === null || taxForFree === void 0 ? void 0 : taxForFree.subTaxes : null,
                } : {
                    taxId: new mongodb_1.ObjectId(item === null || item === void 0 ? void 0 : item.tax),
                    taxType: tax === null || tax === void 0 ? void 0 : tax.type,
                    taxValue: tax === null || tax === void 0 ? void 0 : tax.value,
                    inclusive: (item === null || item === void 0 ? void 0 : item.taxInclusive) || false,
                    subTaxes: ((_c = tax === null || tax === void 0 ? void 0 : tax.subTaxes) === null || _c === void 0 ? void 0 : _c.length) > 0 ? tax === null || tax === void 0 ? void 0 : tax.subTaxes : null,
                },
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
                },
            };
            return stock;
        }));
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemsStockTemp, 'insertMany', itemsStock);
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ message: (0, i18n_1.geti18nResponse)(req, 'success', constants_1.msg.success), grn });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function getApprovePurchaseEntry(req, res) {
    try {
        const { branch } = req === null || req === void 0 ? void 0 : req.user;
        const { from, to } = req === null || req === void 0 ? void 0 : req.query;
        const fromDate = (0, utility_1.parseDate)(from, 'DD-MM-YYYY', true);
        const toDate = (0, utility_1.parseDate)(to, 'DD-MM-YYYY', false);
        const approvePurchaseEntry = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseEntries, 'aggregate', [
            {
                $match: {
                    active: true,
                    branchId: new mongodb_1.ObjectId(branch),
                    'created.date': { $gte: fromDate, $lte: toDate }
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.itemSuppliers,
                    localField: 'supplierId',
                    foreignField: '_id',
                    as: 'suppliersData'
                }
            },
            {
                $unwind: {
                    path: '$suppliersData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.purchaseEntryAmounts,
                    localField: '_id',
                    foreignField: 'purchaseEntryId',
                    as: 'amountsData'
                }
            },
            {
                $unwind: {
                    path: '$amountsData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.users,
                    localField: 'created.by',
                    foreignField: 'userId',
                    as: 'createdData'
                }
            },
            {
                $unwind: {
                    path: '$createdData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.users,
                    localField: 'approved.by',
                    foreignField: 'userId',
                    as: 'approvedData'
                }
            },
            {
                $unwind: {
                    path: '$approvedData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    grnNo: 1,
                    invoiceNo: 1,
                    invoiceDate: 1,
                    'suppliersData.name': 1,
                    'amountsData.netInvoiceAmount': 1,
                    'created.date': 1,
                    'createdData.name': 1,
                    'approved.status': 1,
                    'approvedData.name': 1,
                    'approved.date': 1,
                    remarks: 1,
                    'amountsData.itemsDiscount': 1,
                    'amountsData.extraDiscount': 1,
                    'amountsData.totalMrp': 1
                }
            }
        ]);
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ approvePurchaseEntry });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function approvePurchaseEntry(req, res) {
    try {
        const { userId } = req === null || req === void 0 ? void 0 : req.user;
        const { purchaseEntryId } = req === null || req === void 0 ? void 0 : req.body;
        const tempStockItems = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemsStockTemp, 'find', {
            purchaseId: new mongodb_1.ObjectId(purchaseEntryId),
            active: true
        });
        if (tempStockItems && tempStockItems.length > 0) {
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemsStock, 'insertMany', tempStockItems);
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemsStockTemp, 'updateMany', {
                purchaseId: new mongodb_1.ObjectId(purchaseEntryId)
            }, {
                $set: {
                    active: false
                }
            });
        }
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseEntries, 'updateOne', { _id: new mongodb_1.ObjectId(purchaseEntryId) }, {
            $set: {
                approved: {
                    status: true,
                    by: new mongodb_1.ObjectId(userId),
                    on: new Date().toLocaleString(),
                    date: new Date()
                }
            }
        });
        return res.status(constants_1.requestCode.SUCCESS).send((0, i18n_1.geti18nResponse)(req, 'success', constants_1.msg.success));
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function getPurchaseEntryItems(req, res) {
    try {
        const { entryId } = req === null || req === void 0 ? void 0 : req.params;
        const purchaseEntryItems = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.purchaseEntryItems, 'aggregate', [
            {
                $match: {
                    purchaseEntryId: new mongodb_1.ObjectId(entryId)
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.items,
                    localField: 'itemId',
                    foreignField: '_id',
                    as: 'itemsData'
                }
            },
            {
                $unwind: {
                    path: '$itemsData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.manufacturers,
                    localField: 'manufacturerId',
                    foreignField: '_id',
                    as: 'manufacturerData'
                }
            },
            {
                $unwind: {
                    path: '$manufacturerData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.itemQtyUnit,
                    localField: 'packUnitId',
                    foreignField: '_id',
                    as: 'unitData'
                }
            },
            {
                $unwind: {
                    path: '$unitData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.taxes,
                    localField: 'taxId',
                    foreignField: '_id',
                    as: 'taxData'
                }
            },
            {
                $unwind: {
                    path: '$taxData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.taxes,
                    localField: 'taxIdForFree',
                    foreignField: '_id',
                    as: 'freeTaxData'
                }
            },
            {
                $unwind: {
                    path: '$freeTaxData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: 'outletId',
                    foreignField: '_id',
                    as: 'outletData'
                }
            },
            {
                $unwind: {
                    path: '$outletData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'itemsData.name': 1,
                    'manufacturerData.name': 1,
                    hsnNo: 1,
                    rackNo: 1,
                    expiry: 1,
                    pack: 1,
                    'unitData.name': 1,
                    qty: 1,
                    totalQty: 1,
                    freeQty: 1,
                    totalFreeQty: 1,
                    rate: 1,
                    totalCost: 1,
                    costPerQty: 1,
                    mrp: 1,
                    mrpPerQty: 1,
                    discount: 1,
                    discountAmount: 1,
                    totalAmount: 1,
                    'taxData.name': 1,
                    'taxData.value': 1,
                    'taxData.type': 1,
                    taxInclusive: 1,
                    'freeTaxData.name': 1,
                    'freeTaxData.value': 1,
                    'freeTaxData.type': 1,
                    margin: 1,
                    ptr: 1,
                    'outletData.name': 1,
                    batchNo: 1
                }
            }
        ]);
        return res.status(constants_1.requestCode.SUCCESS).send({ purchaseEntryItems });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
