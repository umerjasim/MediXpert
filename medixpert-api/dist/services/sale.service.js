"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMasterData = getMasterData;
exports.getItems = getItems;
exports.generateInvoice = generateInvoice;
exports.confirmPayment = confirmPayment;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
const mongodb_1 = require("mongodb");
const utility_1 = require("../utility/utility");
const moment_1 = __importDefault(require("moment"));
async function getMasterData(req, res) {
    try {
        const { branch } = req.user;
        const titles = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.titles, 'find', { active: true }, {
            projection: {
                name: 1,
                genderId: 1
            }
        });
        const genders = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.genders, 'find', { active: true }, {
            projection: {
                name: 1,
                code: 1
            }
        });
        const paymentTypes = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.paymentTypes, 'find', { active: true, branches: new mongodb_1.ObjectId(branch) }, {
            projection: {
                name: 1,
                type: 1
            }
        });
        return res.status(constants_1.requestCode.SUCCESS)
            .send({
            titles,
            genders,
            paymentTypes
        });
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
        const { branch } = req === null || req === void 0 ? void 0 : req.user;
        const { item } = req === null || req === void 0 ? void 0 : req.params;
        const items = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemsStock, 'aggregate', [
            {
                $match: {
                    active: true,
                    branchId: new mongodb_1.ObjectId(branch)
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.items,
                    localField: 'itemId',
                    foreignField: '_id',
                    as: 'itemsData'
                },
            },
            {
                $unwind: {
                    path: '$itemsData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.outlets,
                    localField: 'outletId',
                    foreignField: '_id',
                    as: 'outletsData'
                },
            },
            {
                $unwind: {
                    path: '$outletsData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.genericNames,
                    localField: 'itemsData.genericId',
                    foreignField: '_id',
                    as: 'genericData'
                },
            },
            {
                $unwind: {
                    path: '$genericData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        { 'itemsData.name': { $regex: item, $options: 'i' } },
                        { 'genericData.name': { $regex: item, $options: 'i' } }
                    ]
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.itemQtyUnit,
                    localField: 'itemsData.qtyUnitId',
                    foreignField: '_id',
                    as: 'unitData'
                },
            },
            {
                $unwind: {
                    path: '$unitData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.itemRisk,
                    localField: 'itemsData.riskId',
                    foreignField: '_id',
                    as: 'riskData'
                },
            },
            {
                $unwind: {
                    path: '$riskData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    hsnNo: 1,
                    batchNo: 1,
                    rackNo: 1,
                    expiry: 1,
                    totalQty: 1,
                    totalFreeQty: 1,
                    mrpPerQty: 1,
                    'itemsData.name': 1,
                    'itemsData._id': 1,
                    'genericData.name': 1,
                    'outletsData.name': 1,
                    'outletsData._id': 1,
                    'unitData.name': 1,
                    'riskData.name': 1,
                    'riskData.color': 1,
                    tax: 1,
                    taxForFree: 1
                }
            }
        ]);
        return res.status(constants_1.requestCode.SUCCESS)
            .send({
            items
        });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function generateInvoice(req, res) {
    const session = await dbConfig_1.client.startSession();
    try {
        await session.startTransaction();
        const { branch, userId, outlet } = req.user;
        const { addedItems, patientDetails, totals } = req.body;
        const invoiceNumber = await generateInvoiceNumber();
        const { totalAmount, discountAmount, grandTotal, roundedGrandTotal, roundoffGrandTotal } = totals;
        const { mobileCode, mobileNo, title, fullName, place, gender, doctor, age } = patientDetails;
        const dob = await (0, utility_1.calculateDateOfBirth)(age);
        let placeId = null;
        let doctorId = null;
        const uniquePatientId = await generatePatientId();
        const patientVisitId = await generateVisitId();
        if (place) {
            const placeData = {
                _id: new mongodb_1.ObjectId,
                name: place,
                pin: null,
                branch: new mongodb_1.ObjectId(branch),
                outlet: new mongodb_1.ObjectId(outlet),
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
            const insertedPlaceId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.places, 'checkAndInsert', { name: place }, placeData);
            placeId = insertedPlaceId === null || insertedPlaceId === void 0 ? void 0 : insertedPlaceId.insertedId;
        }
        if (doctor) {
            const doctorData = {
                _id: new mongodb_1.ObjectId(),
                title: null,
                fullName: doctor,
                qualification: null,
                branch: new mongodb_1.ObjectId(branch),
                outlet: new mongodb_1.ObjectId(outlet),
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
            const insertedDoctorId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.doctors, 'checkAndInsert', { fullName: doctor }, doctorData);
            doctorId = insertedDoctorId === null || insertedDoctorId === void 0 ? void 0 : insertedDoctorId.insertedId;
        }
        const saleMasterData = {
            _id: new mongodb_1.ObjectId(),
            patientVisitId: null,
            invoiceNo: invoiceNumber,
            totalAmount: totalAmount,
            discountAmount: discountAmount,
            grandTotal: grandTotal,
            roundedGrandTotal: roundedGrandTotal,
            roundoffGrandTotal: roundoffGrandTotal,
            branch: new mongodb_1.ObjectId(branch),
            outlet: new mongodb_1.ObjectId(outlet),
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
        const insertedSaleMasterId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleMaster, 'insertOne', saleMasterData);
        const saleMasterId = insertedSaleMasterId.insertedId;
        const patientMasterData = {
            _id: new mongodb_1.ObjectId(),
            patientId: uniquePatientId,
            mobileCode: mobileCode,
            mobileNo: mobileNo,
            title: new mongodb_1.ObjectId(title),
            fullName: fullName,
            place: new mongodb_1.ObjectId(placeId),
            gender: new mongodb_1.ObjectId(gender),
            doctor: new mongodb_1.ObjectId(doctorId),
            age: {
                years: age.years || null,
                months: age.months || null,
                days: age.days || null
            },
            dob: dob,
            branch: new mongodb_1.ObjectId(branch),
            outlet: new mongodb_1.ObjectId(outlet),
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
        const insertedPatientId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientMaster, 'insertOne', patientMasterData);
        const patientId = insertedPatientId.insertedId;
        const noStockItems = [];
        const saleItemsDataArray = [];
        for (const item of addedItems || []) {
            const { itemId, itemName, batchNo, qty } = item;
            if (batchNo && batchNo.length > 0) {
                for (const batchItem of batchNo) {
                    const { batch, coveredStock, totalAmount, taxAmount, expiry, hsnNo, rackNo, unit, tax, rate, stockId, discountAmount } = batchItem;
                    const { taxId, taxType, taxValue, inclusive, subTaxes } = tax;
                    const stockData = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemsStock, 'findOne', { _id: new mongodb_1.ObjectId(stockId) });
                    let balanceStock = stockData ? stockData.totalQty - coveredStock : 0;
                    if (balanceStock < 0) {
                        noStockItems.push({
                            itemId,
                            itemName,
                            batch,
                            qty,
                            currentStock: (stockData === null || stockData === void 0 ? void 0 : stockData.totalQty) || 0
                        });
                    }
                    else {
                        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.itemsStock, 'updateOne', { _id: new mongodb_1.ObjectId(stockId) }, {
                            $set: { totalQty: balanceStock }
                        });
                        const saleItemsData = {
                            _id: new mongodb_1.ObjectId(),
                            saleMasterId,
                            itemId: new mongodb_1.ObjectId(itemId),
                            batchNo: batch,
                            qty: coveredStock,
                            amount: totalAmount,
                            expiry,
                            hsnNo,
                            rackNo,
                            unit,
                            rate,
                            balanceStock,
                            tax: {
                                taxId: new mongodb_1.ObjectId(taxId),
                                taxType,
                                taxValue,
                                inclusive,
                                subTaxes: (subTaxes || []).map((subTax) => ({
                                    name: subTax.name,
                                    value: subTax.value,
                                    type: subTax.type,
                                    id: new mongodb_1.ObjectId(subTax._id),
                                }))
                            },
                            branch: new mongodb_1.ObjectId(branch),
                            outlet: new mongodb_1.ObjectId(outlet),
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
                        saleItemsDataArray.push(saleItemsData);
                    }
                }
            }
        }
        if (noStockItems.length > 0) {
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleMaster, 'deleteOne', { _id: saleMasterId });
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientMaster, 'deleteOne', { _id: patientId });
            await session.abortTransaction();
            session.endSession();
            return res.status(constants_1.requestCode.UNAUTHORIZED).send({
                error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError),
                noStockItems
            });
        }
        for (const saleItemsData of saleItemsDataArray) {
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleItems, 'insertOne', saleItemsData);
        }
        const salePatientVisitData = {
            _id: new mongodb_1.ObjectId(),
            patientMasterId: new mongodb_1.ObjectId(patientId),
            patientVisitId,
            saleMasterId: new mongodb_1.ObjectId(saleMasterId),
            branch: new mongodb_1.ObjectId(branch),
            outlet: new mongodb_1.ObjectId(outlet),
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
        const insertedVisitId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientVisit, 'insertOne', salePatientVisitData);
        const visitId = insertedVisitId.insertedId;
        if (visitId) {
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleMaster, 'updateOne', { _id: new mongodb_1.ObjectId(saleMasterId) }, {
                $set: { patientVisitId: visitId }
            });
        }
        const saleInvoiceData = {
            _id: new mongodb_1.ObjectId(),
            saleMasterId,
            html: null,
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
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleInvoice, 'insertOne', saleInvoiceData);
        const encryptedSaleMasterId = (0, utility_1.encrypt)(String(saleMasterId));
        await session.commitTransaction();
        session.endSession();
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ message: (0, i18n_1.geti18nResponse)(req, 'success', constants_1.msg.success), invoiceNumber, saleMasterId: encryptedSaleMasterId });
    }
    catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
async function generateInvoiceNumber() {
    try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const currentFinancialYear = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
        const keyWord = constants_1.numberKeyWords.invoiceNo || 'IN';
        const keyWordLength = keyWord.length;
        const invoiceNos = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleMaster, 'findOne', {}, {
            projection: { invoiceNo: 1 },
            sort: { "created.date": -1 }
        });
        if (invoiceNos === null || invoiceNos === void 0 ? void 0 : invoiceNos.invoiceNo) {
            const existingYear = invoiceNos.invoiceNo.slice(keyWordLength, keyWordLength + 4);
            let nextSerial;
            if (existingYear === currentFinancialYear) {
                const existingSerial = parseInt(invoiceNos.invoiceNo.slice(keyWordLength + 4), 10);
                nextSerial = (existingSerial + 1).toString().padStart(8, '0');
            }
            else {
                nextSerial = constants_1.numberKeyWords.invoiceNoStart;
            }
            return `${constants_1.numberKeyWords.invoiceNo}${currentFinancialYear}${nextSerial}`;
        }
        else {
            return `${constants_1.numberKeyWords.invoiceNo}${currentFinancialYear}${constants_1.numberKeyWords.invoiceNoStart}`;
        }
    }
    catch (error) {
        throw error;
    }
}
async function generatePatientId() {
    const currentYear = new Date().getFullYear();
    let uniqueId = 0;
    let isUnique = false;
    while (!isUnique) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        uniqueId = Number(`${currentYear}${randomDigits}`);
        const existingId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientMaster, 'findOne', { patientId: uniqueId });
        if (!existingId) {
            isUnique = true;
        }
    }
    return uniqueId;
}
async function generateVisitId() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    const startOfDay = (0, moment_1.default)().startOf('day').toDate();
    const endOfDay = (0, moment_1.default)().endOf('day').toDate();
    const record = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.salePatientVisit, 'findOne', {
        "created.date": { $gte: startOfDay, $lte: endOfDay }
    }, {
        sort: { "created.date": -1 }
    });
    let count = 1;
    if (record) {
        const lastCount = parseInt(record.patientVisitId.toString().slice(-6), 10);
        count = lastCount + 1;
    }
    const formattedCount = count.toString().padStart(6, '0');
    return Number(`${datePrefix}${formattedCount}`);
}
async function confirmPayment(req, res) {
    const session = await dbConfig_1.client.startSession();
    try {
        await session.startTransaction();
        const { branch, userId, outlet } = req.user;
        const { patientDetails, paymentDetails, paymentRemarks, saleMasterId } = req.body;
        const { 'form-sale-payment-list': paymentList = [] } = paymentDetails;
        const decryptedSaleMasterId = (0, utility_1.decrypt)(saleMasterId);
        const billNo = await generateBillNumber();
        const mainMode = paymentDetails['sale-payment-mode'];
        const mainAmount = paymentDetails['sale-payment-amount'];
        const mainTransactionNo = paymentRemarks[`${mainMode}-transaction-no`] || null;
        const mainRemarks = paymentRemarks[`${mainMode}-remarks`] || null;
        const billPaymentModes = [
            {
                mode: mainMode,
                amount: mainAmount,
                transactionNo: mainTransactionNo,
                remarks: mainRemarks,
                isMain: true,
            },
            ...(Array.isArray(paymentList) && paymentList.length > 0
                ? paymentList.map(({ mode, amount }) => ({
                    mode,
                    amount,
                    transactionNo: (paymentRemarks === null || paymentRemarks === void 0 ? void 0 : paymentRemarks[`${mode}-transaction-no`]) || null,
                    remarks: (paymentRemarks === null || paymentRemarks === void 0 ? void 0 : paymentRemarks[`${mode}-remarks`]) || null,
                    isMain: false,
                }))
                : [])
        ];
        const totalPaidAmount = billPaymentModes.reduce((sum, payment) => sum + payment.amount, 0);
        const billMasterData = {
            _id: new mongodb_1.ObjectId(),
            saleMasterId: new mongodb_1.ObjectId(decryptedSaleMasterId),
            billNo,
            totalPaidAmount,
            branch: new mongodb_1.ObjectId(branch),
            outlet: new mongodb_1.ObjectId(outlet),
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
        const insertedBillMasterId = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.billMaster, 'insertOne', billMasterData);
        const billMasterId = insertedBillMasterId.insertedId;
        const billDetailsData = {
            _id: new mongodb_1.ObjectId(),
            billMasterId,
            paidAmount: totalPaidAmount,
            paymentModes: billPaymentModes,
            branch: new mongodb_1.ObjectId(branch),
            outlet: new mongodb_1.ObjectId(outlet),
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
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.billDetails, 'insertOne', billDetailsData);
        const saleBillData = {
            _id: new mongodb_1.ObjectId(),
            billMasterId,
            html: null,
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
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.saleBill, 'insertOne', saleBillData);
        const encryptedBillMasterId = (0, utility_1.encrypt)(String(billMasterId));
        await session.commitTransaction();
        session.endSession();
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ message: (0, i18n_1.geti18nResponse)(req, 'success', constants_1.msg.success), billNo, billMasterId: encryptedBillMasterId });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
async function generateBillNumber() {
    try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const currentFinancialYear = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
        const keyWord = constants_1.numberKeyWords.billNo || 'BL';
        const keyWordLength = keyWord.length;
        const billNos = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.billMaster, 'findOne', {}, {
            projection: { billNo: 1 },
            sort: { "created.date": -1 }
        });
        if (billNos === null || billNos === void 0 ? void 0 : billNos.billNo) {
            const existingYear = billNos.billNo.slice(keyWordLength, keyWordLength + 4);
            let nextSerial;
            if (existingYear === currentFinancialYear) {
                const existingSerial = parseInt(billNos.billNo.slice(keyWordLength + 4), 10);
                nextSerial = (existingSerial + 1).toString().padStart(8, '0');
            }
            else {
                nextSerial = constants_1.numberKeyWords.billNoStart;
            }
            return `${constants_1.numberKeyWords.billNo}${currentFinancialYear}${nextSerial}`;
        }
        else {
            return `${constants_1.numberKeyWords.billNo}${currentFinancialYear}${constants_1.numberKeyWords.billNoStart}`;
        }
    }
    catch (error) {
        throw error;
    }
}
