import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, numberKeyWords, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";
import { ItemsStock, Manufacturers, PurchaseEntries, PurchaseEntryAmounts, PurchaseEntryItems } from "../config/dbTypes";
import dayjs from "dayjs";
import { parseDate } from "../utility/utility";

export async function getMasterData(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch } = req.user;

        const items = await dbHandler(
            collectionNames.items,
            'aggregate',
            [
                {
                    $match: {
                        active: true,
                        branches: new ObjectId(branch)
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.itemMaster, 
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
            ]
        );        

        const manufacturers = await dbHandler(
            collectionNames.manufacturers,
            'find',
            {
                active: true,
                branches: new ObjectId(branch)
            }
        );

        const qtyUnits = await dbHandler(
            collectionNames.itemQtyUnit,
            'find',
            {
                active: true
            }
        );

        const taxes = await dbHandler(
            collectionNames.taxes,
            'find',
            {
                active: true,
                branches: new ObjectId(branch)
            }
        );

        const outlets = await dbHandler(
            collectionNames.outlets,
            'find',
            {
                active: true,
                branchId: new ObjectId(branch)
            }
        );

        const suppliers = await dbHandler(
            collectionNames.itemSuppliers,
            'find',
            {
                active: true,
                branches: new ObjectId(branch)
            }
        );

        const purchaseFormTypes = await dbHandler(
            collectionNames.purchaseFormTypes,
            'find',
            {
                active: true,
                branches: new ObjectId(branch)
            }
        );

        const purchaseTypes = await dbHandler(
            collectionNames.purchaseTypes,
            'find',
            {
                active: true,
                branches: new ObjectId(branch)
            }
        );
        
        return res.status(requestCode.SUCCESS)
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
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

async function generateGRN() {
    try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const currentFinancialYear = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
        const keyWord: string = numberKeyWords.grnNo || 'GRN';
        const keyWordLength: number = keyWord.length;

        const grnNos = await dbHandler(
            collectionNames.purchaseEntries,
            'findOne',
            {},
            {
                projection: { grnNo: 1 },
                sort: { "created.date": -1 }
            }
        );

        if (grnNos?.grnNo) {
            const existingYear = grnNos.grnNo.slice(keyWord + 4, 7);
            let nextSerial;

            if (existingYear === currentFinancialYear) {
                const existingSerial = parseInt(grnNos.grnNo.slice(keyWord + 4), 10);
                nextSerial = (existingSerial + 1).toString().padStart(8, '0');
            } else {
                nextSerial = numberKeyWords.grnNoStart;
            }

            return `${numberKeyWords.grnNo}${currentFinancialYear}${nextSerial}`;
        } else {
            return `${numberKeyWords.grnNo}${currentFinancialYear}${numberKeyWords.grnNoStart}`;
        }
    } catch (error) {
        throw error;
    }
}

export async function addPurchaseEntry(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { userId } = req?.user;
        const form1Values = req?.body?.form1Values || {};
        const form2Values = req?.body?.form2Values || {};
        const itemsData = req?.body?.resultData || [];
        const {
            'purchase-entry-branch': branch,
            'purchase-entry-outlet': outlet,
            'purchase-entry-supplier': supplier,
            'purchase-entry-form-type': formType,
            'purchase-entry-type': type,
            'purchase-entry-order-no': purachseOrderNo,
            'purchase-entry-invoice-no': invoiceNo,
            'purchase-entry-invoice-date': invoiceDate,
            'purchase-entry-date': entryDate
        } = form1Values;
        const {
            'purchase-entry-taxable-amount': taxableAmount,
            'purchase-entry-non-taxable-amount': nonTaxableAmount,
            'purchase-entry-added-discount': addedDiscount,
            'purchase-entry-extra-discount': extraDiscount,
            'purchase-entry-total-tax-amount': totalTaxAmount,
            'purchase-entry-total-amount': totalAmount,
            'purchase-entry-round-off': roundOff,
            'purchase-entry-net-invoice-amount': netInvoiceAmount,
            'purchase-entry-remarks': remarks,
            'purchase-entry-total-mrp': totalMrp
        } = form2Values;

        const taxData: any[] = [];
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

        const purachseEntries: PurchaseEntries = {
            _id: new ObjectId(),
            grnNo: grn,
            branchId: new ObjectId(branch),
            outletId: new ObjectId(outlet),
            supplierId: new ObjectId(supplier),
            formTypeId: new ObjectId(formType),
            purchaseTypeId: new ObjectId(type),
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
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date(),
            },
            modified: {
                by: null,
                on: null,
                date: null,
            }
        };

        const insertedEntryId = await dbHandler(
            collectionNames.purchaseEntries,
            'insertOne',
            purachseEntries
        );
        const entryId = insertedEntryId.insertedId;

        const purchaseEntryAmounts: PurchaseEntryAmounts = {
            _id: new ObjectId(),
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
                by: new ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date(),
            },
            modified: {
                by: null,
                on: null,
                date: null,
            }
        };

        await dbHandler(
            collectionNames.purchaseEntryAmounts,
            'insertOne',
            purchaseEntryAmounts
        );
        
        const purchaseEntryItems: PurchaseEntryItems[] = await Promise.all(itemsData.map(async (item: any) => {
            const manufacturer: Manufacturers = {
                _id: new ObjectId(),
                name: item?.manufacturer,
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
                branches: [new ObjectId(branch)],
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

            const insertedManufacturerId = await dbHandler(
                collectionNames.manufacturers,
                'checkAndInsert',
                {
                    name: item?.manufacturer
                },
                manufacturer
            );

            const manufacturerId = insertedManufacturerId?.insertedId;

            const items: PurchaseEntryItems = {
                _id: new ObjectId(),
                purchaseEntryId: entryId,
                itemId: new ObjectId(item?.itemName),
                manufacturerId: new ObjectId(manufacturerId),
                hsnNo: item?.hsnNo,
                batchNo: item?.batchNo,
                rackNo: item?.rackNo,
                expiry: new Date(item?.expiry) || null,
                pack: item?.pack,
                packUnitId: new ObjectId(item?.packUnit),
                qty: item?.qty,
                totalQty: item?.totalQty,
                freeQty: item?.freeQty,
                totalFreeQty: item?.totalFreeQty,
                rate: item?.rate,
                totalCost: item?.totalCost,
                costPerQty: item?.costPerQty,
                mrp: item?.mrp,
                mrpPerQty: item?.mrpPerQty,
                discount: item?.discount,
                discountAmount: item?.discountAmount,
                totalAmount: item?.totalAmount,
                taxId: new ObjectId(item?.tax),
                taxInclusive: item?.taxInclusive,
                taxIdForFree: new ObjectId(item?.taxOnFree) || null,
                margin: item?.margin || null,
                ptr: item?.ptr || null,
                outletId: new ObjectId(item?.outlet),
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
            
            return items;
        }));

        await dbHandler(
            collectionNames.purchaseEntryItems,
            'insertMany',
            purchaseEntryItems
        );

        const itemsStock: PurchaseEntryItems[] = await Promise.all(itemsData.map(async (item: any) => {
            const tax = await dbHandler(
                collectionNames.taxes,
                'findOne',
                {
                    _id: new ObjectId(item?.tax)
                }
            );

            let taxForFree: any = {};
            if (item?.taxIdForFree) {
                taxForFree = await dbHandler(
                    collectionNames.taxes,
                    'findOne',
                    {
                        _id: new ObjectId(item?.taxIdForFree)
                    }
                );
            }

            const stock: ItemsStock = {
                _id: new ObjectId(),
                purchaseId: entryId,
                transferId: null,
                itemId: new ObjectId(item?.itemName),
                branchId: new ObjectId(branch),
                outletId: new ObjectId(outlet),
                hsnNo: item?.hsnNo,
                batchNo: item?.batchNo,
                rackNo: item?.rackNo,
                expiry: new Date(item?.expiry) || null,
                pack: item?.pack,
                packUnitId: new ObjectId(item?.packUnit),
                qty: item?.qty,
                totalQty: item?.totalQty,
                freeQty: item?.freeQty,
                totalFreeQty: item?.totalFreeQty,
                rate: item?.rate,
                totalCost: item?.totalCost,
                costPerQty: item?.costPerQty,
                mrp: item?.mrp,
                mrpPerQty: item?.mrpPerQty,
                discount: item?.discount,
                discountAmount: item?.discountAmount,
                totalAmount: item?.totalAmount,
                margin: item?.margin || null,
                ptr: item?.ptr || null,
                tax: {
                    taxId: new ObjectId(item?.tax),
                    taxType: tax?.type,
                    taxValue: tax?.value,
                    inclusive: item?.taxInclusive || false,
                    subTaxes: tax?.subTaxes?.length > 0 ? tax?.subTaxes : null,
                },
                taxForFree: item?.taxIdForFree ? {
                    taxId: new ObjectId(item?.taxIdForFree),
                    taxType: taxForFree?.type,
                    taxValue: taxForFree?.value,
                    inclusive: taxForFree?.taxInclusive,
                    subTaxes: taxForFree?.subTaxes?.length > 0 ? taxForFree?.subTaxes : null,
                } : {
                    taxId: new ObjectId(item?.tax),
                    taxType: tax?.type,
                    taxValue: tax?.value,
                    inclusive: item?.taxInclusive || false,
                    subTaxes: tax?.subTaxes?.length > 0 ? tax?.subTaxes : null,
                },
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
                },
            };

            return stock;
        }));

        await dbHandler(
            collectionNames.itemsStockTemp,
            'insertMany',
            itemsStock
        );

        return res.status(requestCode.SUCCESS)
            .send({ message: geti18nResponse(req, 'success', msg.success), grn });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function getApprovePurchaseEntry(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { branch } = req?.user;
        const { from, to } = req?.query;
        const fromDate = parseDate(from as string, 'DD-MM-YYYY', true);
        const toDate = parseDate(to as string, 'DD-MM-YYYY', false);

        const approvePurchaseEntry = await dbHandler(
            collectionNames.purchaseEntries,
            'aggregate',
            [
                {
                    $match: {
                        active: true,
                        branchId: new ObjectId(branch),
                        'created.date': { $gte: fromDate, $lte: toDate }
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.itemSuppliers, 
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
                        from: collectionNames.purchaseEntryAmounts, 
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
                        from: collectionNames.users, 
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
                        from: collectionNames.users, 
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
            ]
        );

        return res.status(requestCode.SUCCESS)
            .send({ approvePurchaseEntry });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function approvePurchaseEntry(
    req: UserRequest,
    res: Response
): Promise<any> {
    
    try {
        const { userId } = req?.user;
        const { purchaseEntryId } = req?.body;

        const tempStockItems = await dbHandler(
            collectionNames.itemsStockTemp,
            'find',
            { 
                purchaseId: new ObjectId(purchaseEntryId),
                active: true
            }
        );

        if (tempStockItems && tempStockItems.length > 0) {
            await dbHandler(
                collectionNames.itemsStock,
                'insertMany',
                tempStockItems
            );

            await dbHandler(
                collectionNames.itemsStockTemp,
                'updateMany',
                { 
                    purchaseId: new ObjectId(purchaseEntryId)
                },
                {
                    $set: {
                        active: false
                    }
                }
            );
        }

        await dbHandler(
            collectionNames.purchaseEntries,
            'updateOne',
            { _id: new ObjectId(purchaseEntryId) },
            {
                $set: {
                  approved: {
                    status: true,
                    by: new ObjectId(userId),
                    on: new Date().toLocaleString(),
                    date: new Date()
                  }
                }
            },
        );

        return res.status(requestCode.SUCCESS).send(geti18nResponse(req, 'success', msg.success));
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};

export async function getPurchaseEntryItems(
    req: UserRequest,
    res: Response
): Promise<any> {
    try {
        const { entryId } = req?.params;
        const purchaseEntryItems = await dbHandler(
            collectionNames.purchaseEntryItems,
            'aggregate',
            [
                {
                    $match: {
                        purchaseEntryId: new ObjectId(entryId)
                    }
                },
                {
                    $lookup: {
                        from: collectionNames.items, 
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
                        from: collectionNames.manufacturers, 
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
                        from: collectionNames.itemQtyUnit, 
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
                        from: collectionNames.taxes, 
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
                        from: collectionNames.taxes, 
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
                        from: collectionNames.outlets, 
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
            ]
        );

        return res.status(requestCode.SUCCESS).send({ purchaseEntryItems });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};