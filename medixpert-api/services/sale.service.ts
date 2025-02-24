import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, numberKeyWords, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { client, dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";
import { BillDetails, BillMaster, BillPaymentMode, Doctors, Places, SaleBill, SaleInvoice, 
    SaleItems, SaleMaster, SalePatientMaster, SalePatientVisit } from "../config/dbTypes";
import { calculateDateOfBirth, decrypt, encrypt } from "../utility/utility";
import moment from "moment";

export async function getMasterData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch } = req.user;
        
        const titles = await dbHandler(
            collectionNames.titles,
            'find',
            { active: true },
            {
                projection: {
                    name: 1,
                    genderId: 1
                }
            }
        );

        const genders = await dbHandler(
            collectionNames.genders,
            'find',
            { active: true },
            {
                projection: {
                    name: 1,
                    code: 1
                }
            }
        );

        const paymentTypes = await dbHandler(
            collectionNames.paymentTypes,
            'find',
            { active: true, branches: new ObjectId(branch) },
            {
                projection: {
                    name: 1,
                    type: 1
                }
            }
        );

        return res.status(requestCode.SUCCESS)
            .send({ 
                titles,
                genders,
                paymentTypes
            });
   } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function getItems(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch } = req?.user;
        const { item } = req?.params;
        
        const items = await dbHandler(
            collectionNames.itemsStock,
            'aggregate',
            [
                {
                    $match: {
                        active: true,
                        branchId: new ObjectId(branch)
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.items,
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
                        from: collectionNames.outlets,
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
                        from: collectionNames.genericNames,
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
                        from: collectionNames.itemQtyUnit,
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
                        from: collectionNames.itemRisk,
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
            ]
        );

        return res.status(requestCode.SUCCESS)
            .send({ 
                items
            });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function generateInvoice(
    req: UserRequest,
    res: Response
): Promise<any> {
    const session = await client.startSession();
    try {
        await session.startTransaction();

        const { branch, userId, outlet } = req.user;
        const { addedItems, patientDetails, totals } = req.body;

        const invoiceNumber = await generateInvoiceNumber();
        const { totalAmount, discountAmount, grandTotal, roundedGrandTotal, roundoffGrandTotal } = totals;
        const { mobileCode, mobileNo, title, fullName, place, gender, doctor, age } = patientDetails;

        const dob: Date = await calculateDateOfBirth(age);
        let placeId: ObjectId | null = null;
        let doctorId: ObjectId | null = null;
        const uniquePatientId: number = await generatePatientId();
        const patientVisitId: number = await generateVisitId();

        if (place) {
            const placeData: Places = {
                _id: new ObjectId,
                name: place,
                pin: null,
                branch: new ObjectId(branch),
                outlet: new ObjectId(outlet),
                active: true,
                created: {
                    by: new ObjectId(userId),
                    on: new Date().toLocaleString(),
                    date: new Date()
                },
                modified: {
                    by: null,
                    on: null,
                    date: null
                }
            };

            const insertedPlaceId = await dbHandler(collectionNames.places, 'checkAndInsert', { name: place }, placeData);
            placeId = insertedPlaceId?.insertedId;
        }

        if (doctor) {
            const doctorData: Doctors = {
                _id: new ObjectId(),
                title: null,
                fullName: doctor,
                qualification: null,
                branch: new ObjectId(branch),
                outlet: new ObjectId(outlet),
                active: true,
                created: {
                    by: new ObjectId(userId),
                    on: new Date().toLocaleString(),
                    date: new Date()
                },
                modified: {
                    by: null,
                    on: null,
                    date: null
                }
            };

            const insertedDoctorId = await dbHandler(collectionNames.doctors, 'checkAndInsert', { fullName: doctor }, doctorData);
            doctorId = insertedDoctorId?.insertedId;
        }

        const saleMasterData: SaleMaster = {
            _id: new ObjectId(),
            patientVisitId: null,
            invoiceNo: invoiceNumber,
            totalAmount: totalAmount,
            discountAmount: discountAmount,
            grandTotal: grandTotal,
            roundedGrandTotal: roundedGrandTotal,
            roundoffGrandTotal: roundoffGrandTotal,
            branch: new ObjectId(branch),
            outlet: new ObjectId(outlet),
            active: true,
            created: {
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };

        const insertedSaleMasterId = await dbHandler(collectionNames.saleMaster, 'insertOne', saleMasterData);
        const saleMasterId: ObjectId = insertedSaleMasterId.insertedId;

        const patientMasterData: SalePatientMaster = {
            _id: new ObjectId(),
            patientId: uniquePatientId,
            mobileCode: mobileCode,
            mobileNo: mobileNo,
            title: new ObjectId(title),
            fullName: fullName,
            place: new ObjectId(placeId),
            gender: new ObjectId(gender),
            doctor: new ObjectId(doctorId),
            age: { 
                years: age.years || null, 
                months: age.months || null, 
                days: age.days || null
            },
            dob: dob,
            branch: new ObjectId(branch),
            outlet: new ObjectId(outlet),
            active: true,
            created: {
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };

        const insertedPatientId = await dbHandler(collectionNames.salePatientMaster, 'insertOne', patientMasterData);
        const patientId: ObjectId = insertedPatientId.insertedId;

        const noStockItems: any[] = [];
        const saleItemsDataArray: SaleItems[] = [];
        for (const item of addedItems || []) {
            const { itemId, itemName, batchNo, qty } = item;
            if (batchNo && batchNo.length > 0) {
                for (const batchItem of batchNo) {
                    const {
                        batch, coveredStock, totalAmount, taxAmount, expiry, hsnNo,
                        rackNo, unit, tax, rate,
                        stockId, discountAmount
                    } = batchItem;
                    const { taxId, taxType, taxValue, inclusive, subTaxes } = tax;

                    const stockData = await dbHandler(collectionNames.itemsStock, 'findOne', { _id: new ObjectId(stockId) });

                    let balanceStock = stockData ? stockData.totalQty - coveredStock : 0;
                    if (balanceStock < 0) {
                        noStockItems.push({
                            itemId,
                            itemName,
                            batch,
                            qty,
                            currentStock: stockData?.totalQty || 0
                        });
                    } else {
                        await dbHandler(collectionNames.itemsStock, 'updateOne', { _id: new ObjectId(stockId) }, {
                            $set: { totalQty: balanceStock }
                        });

                        const saleItemsData: SaleItems = {
                            _id: new ObjectId(),
                            saleMasterId,
                            itemId: new ObjectId(itemId),
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
                                taxId: new ObjectId(taxId),
                                taxType,
                                taxValue,
                                inclusive,
                                subTaxes: (subTaxes || []).map((subTax: any) => ({
                                    name: subTax.name,
                                    value: subTax.value,
                                    type: subTax.type,
                                    id: new ObjectId(subTax._id),
                                }))
                            },
                            branch: new ObjectId(branch),
                            outlet: new ObjectId(outlet),
                            active: true,
                            created: {
                                by: new ObjectId(userId),
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
            await dbHandler(collectionNames.saleMaster, 'deleteOne', { _id: saleMasterId });
            await dbHandler(collectionNames.salePatientMaster, 'deleteOne', { _id: patientId });

            await session.abortTransaction();
            session.endSession();

            return res.status(requestCode.UNAUTHORIZED).send({
                error: geti18nResponse(req, 'unknownError', msg.unknownError),
                noStockItems
            });
        }

        for (const saleItemsData of saleItemsDataArray) {
            await dbHandler(collectionNames.saleItems, 'insertOne', saleItemsData);
        }

        const salePatientVisitData: SalePatientVisit = {
            _id: new ObjectId(),
            patientMasterId: new ObjectId(patientId),
            patientVisitId,
            saleMasterId: new ObjectId(saleMasterId),
            branch: new ObjectId(branch),
            outlet: new ObjectId(outlet),
            active: true,
            created: {
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };

        const insertedVisitId = await dbHandler(collectionNames.salePatientVisit, 'insertOne', salePatientVisitData);
        const visitId: ObjectId = insertedVisitId.insertedId;

        if (visitId) {
            await dbHandler(collectionNames.saleMaster, 'updateOne', { _id: new ObjectId(saleMasterId) }, {
                $set: { patientVisitId: visitId }
            });
        }

        const saleInvoiceData: SaleInvoice = {
            _id: new ObjectId(),
            saleMasterId,
            html: null,
            active: true,
            created: {
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };

        await dbHandler(collectionNames.saleInvoice, 'insertOne', saleInvoiceData);

        const encryptedSaleMasterId: string = encrypt(String(saleMasterId));

        await session.commitTransaction();
        session.endSession();

        return res.status(requestCode.SUCCESS)
            .send({ message: geti18nResponse(req, 'success', msg.success), invoiceNumber, saleMasterId: encryptedSaleMasterId });
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        session.endSession();

        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
}

async function generateInvoiceNumber() {
    try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const currentFinancialYear = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
        const keyWord: string = numberKeyWords.invoiceNo || 'IN';
        const keyWordLength: number = keyWord.length;

        const invoiceNos = await dbHandler(
            collectionNames.saleMaster,
            'findOne',
            {},
            {
                projection: { invoiceNo: 1 },
                sort: { "created.date": -1 }
            }
        );

        if (invoiceNos?.invoiceNo) {
            const existingYear = invoiceNos.invoiceNo.slice(keyWordLength, keyWordLength + 4);
            let nextSerial;

            if (existingYear === currentFinancialYear) {
                const existingSerial = parseInt(invoiceNos.invoiceNo.slice(keyWordLength + 4), 10);
                nextSerial = (existingSerial + 1).toString().padStart(8, '0');
            } else {
                nextSerial = numberKeyWords.invoiceNoStart;
            }
            return `${numberKeyWords.invoiceNo}${currentFinancialYear}${nextSerial}`;
        } else {
            return `${numberKeyWords.invoiceNo}${currentFinancialYear}${numberKeyWords.invoiceNoStart}`;
        }
    } catch (error) {
        throw error;
    }
}

async function generatePatientId(): Promise<number> {
    const currentYear = new Date().getFullYear();
    let uniqueId: number = 0;
    let isUnique = false;

    while (!isUnique) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        uniqueId = Number(`${currentYear}${randomDigits}`);

        const existingId = await dbHandler(
            collectionNames.salePatientMaster, 
            'findOne', 
            { patientId: uniqueId }
        );

        if (!existingId) {
            isUnique = true;
        }
    }

    return uniqueId;
}

async function generateVisitId(): Promise<number> {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();
    
    const record = await dbHandler(
        collectionNames.salePatientVisit,
        'findOne',
        {
            "created.date": { $gte: startOfDay, $lte: endOfDay }
        },
        {
            sort: { "created.date": -1 }
        }
    );

    let count = 1;
    if (record) {
        const lastCount = parseInt(record.patientVisitId.toString().slice(-6), 10);
        count = lastCount + 1;
    } 

    const formattedCount = count.toString().padStart(6, '0');

    return Number(`${datePrefix}${formattedCount}`);
}

export async function confirmPayment(
    req: UserRequest,
    res: Response
): Promise<any> {
    const session = await client.startSession();
    try {
        await session.startTransaction();

        const { branch, userId, outlet } = req.user;
        const { patientDetails, paymentDetails, paymentRemarks, saleMasterId } = req.body;
        const { 'form-sale-payment-list': paymentList = [] } = paymentDetails;
        const decryptedSaleMasterId: string = decrypt(saleMasterId);
        const billNo: string = await generateBillNumber();

        const mainMode = paymentDetails['sale-payment-mode'];
        const mainAmount = paymentDetails['sale-payment-amount'];
        const mainTransactionNo = paymentRemarks[`${mainMode}-transaction-no`] || null;
        const mainRemarks = paymentRemarks[`${mainMode}-remarks`] || null;

        const billPaymentModes: BillPaymentMode[] = [
            {
                mode: mainMode,
                amount: mainAmount,
                transactionNo: mainTransactionNo,
                remarks: mainRemarks,
                isMain: true,
            },
            ...(Array.isArray(paymentList) && paymentList.length > 0
            ? paymentList.map(({ mode, amount }: { mode: string; amount: number }) => ({
                  mode,
                  amount,
                  transactionNo: paymentRemarks?.[`${mode}-transaction-no`] || null,
                  remarks: paymentRemarks?.[`${mode}-remarks`] || null,
                  isMain: false,
              }))
            : [])
        ];

        const totalPaidAmount: number = billPaymentModes.reduce((sum, payment) => sum + payment.amount, 0);

        const billMasterData: BillMaster = {
            _id: new ObjectId(),
            saleMasterId: new ObjectId(decryptedSaleMasterId),
            billNo,
            totalPaidAmount,
            branch: new ObjectId(branch),
            outlet: new ObjectId(outlet),
            active: true,
            created: {
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };

        const insertedBillMasterId = await dbHandler(
            collectionNames.billMaster,
            'insertOne',
            billMasterData
        );
        const billMasterId: ObjectId = insertedBillMasterId.insertedId;

        const billDetailsData: BillDetails = {
            _id: new ObjectId(),
            billMasterId,
            paidAmount: totalPaidAmount,
            paymentModes: billPaymentModes,
            branch: new ObjectId(branch),
            outlet: new ObjectId(outlet),
            active: true,
            created: {
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };

        await dbHandler(
            collectionNames.billDetails,
            'insertOne',
            billDetailsData
        );

        const saleBillData: SaleBill = {
            _id: new ObjectId(),
            billMasterId,
            html: null,
            active: true,
            created: {
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };

        await dbHandler(collectionNames.saleBill, 'insertOne', saleBillData);

        const encryptedBillMasterId: string = encrypt(String(billMasterId));
        
        await session.commitTransaction();
        session.endSession();

        return res.status(requestCode.SUCCESS)
            .send({ message: geti18nResponse(req, 'success', msg.success), billNo, billMasterId: encryptedBillMasterId });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
}

async function generateBillNumber() {
    try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const currentFinancialYear = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
        const keyWord: string = numberKeyWords.billNo || 'BL';
        const keyWordLength: number = keyWord.length;

        const billNos = await dbHandler(
            collectionNames.billMaster,
            'findOne',
            {},
            {
                projection: { billNo: 1 },
                sort: { "created.date": -1 }
            }
        );

        if (billNos?.billNo) {
            const existingYear = billNos.billNo.slice(keyWordLength, keyWordLength + 4);
            let nextSerial;

            if (existingYear === currentFinancialYear) {
                const existingSerial = parseInt(billNos.billNo.slice(keyWordLength + 4), 10);
                nextSerial = (existingSerial + 1).toString().padStart(8, '0');
            } else {
                nextSerial = numberKeyWords.billNoStart;
            }
            return `${numberKeyWords.billNo}${currentFinancialYear}${nextSerial}`;
        } else {
            return `${numberKeyWords.billNo}${currentFinancialYear}${numberKeyWords.billNoStart}`;
        }
    } catch (error) {
        throw error;
    }
}