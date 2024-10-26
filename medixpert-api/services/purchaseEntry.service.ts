import { UserRequest } from "../helpers/jwt";
import { Response } from "express";
import logger from "../helpers/logger";
import { collectionNames, msg, requestCode } from "../helpers/constants";
import { geti18nResponse } from "../i18n";
import { dbHandler } from "../config/dbConfig";
import { ObjectId } from "mongodb";
import { ItemsStock, Manufacturers, PurchaseEntries, PurchaseEntryAmounts, PurchaseEntryItems } from "../config/dbTypes";

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
            const existingYear = grnNos.grnNo.slice(3, 7);
            let nextSerial;

            if (existingYear === currentFinancialYear) {
                const existingSerial = parseInt(grnNos.grnNo.slice(7), 10);
                nextSerial = (existingSerial + 1).toString().padStart(8, '0');
            } else {
                nextSerial = '00000001';
            }

            return `GRN${currentFinancialYear}${nextSerial}`;
        } else {
            return `GRN${currentFinancialYear}00000001`;
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
            'purchase-entry-remarks': remarks
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

            const stock: ItemsStock = {
                _id: new ObjectId(),
                purchaseId: entryId,
                itemId: new ObjectId(item?.itemName),
                branchId: new ObjectId(branch),
                outletId: new ObjectId(outlet),
                stock: item?.totalQty,
                transferId: null,
                isFree: false,
                price: {
                    itemCost: item?.costPerQty,
                    itemPrice: item?.mrpPerQty,
                    itemMRP: item?.mrpPerQty
                },
                tax: {
                    taxId: new ObjectId(item?.tax),
                    taxType: tax?.type,
                    taxValue: tax?.value,
                    inclusive: item?.taxInclusive,
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

        const freeItemsStock: PurchaseEntryItems[] = (await Promise.all(itemsData.map(async (item: any) => {
            if (item?.totalFreeQty && item?.totalFreeQty !== 0) {
                let tax = null;
                if (item?.taxOnFree) {
                    tax = await dbHandler(
                        collectionNames.taxes,
                        'findOne',
                        {
                            _id: new ObjectId(item?.taxOnFree)
                        }
                    );
                }
        
                const stock: ItemsStock = {
                    _id: new ObjectId(),
                    purchaseId: entryId,
                    itemId: new ObjectId(item?.itemName),
                    branchId: new ObjectId(branch),
                    outletId: new ObjectId(outlet),
                    stock: item?.totalFreeQty,
                    transferId: null,
                    isFree: true,
                    price: {
                        itemCost: item?.costPerQty,
                        itemPrice: item?.mrpPerQty,
                        itemMRP: item?.mrpPerQty
                    },
                    tax: {
                        taxId: item?.taxOnFree ? new ObjectId(item?.taxOnFree) : null,
                        taxType: tax ? tax?.type : null,
                        taxValue: tax ? tax?.value : null,
                        inclusive: item?.taxInclusive,
                        subTaxes: tax && tax?.subTaxes?.length > 0 ? tax.subTaxes : null,
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
            }
            
            return null;
        }))).filter(Boolean);

        if (freeItemsStock.length > 0) {
            await dbHandler(
                collectionNames.itemsStockTemp,
                'insertMany',
                freeItemsStock
            );
        }

        return res.status(requestCode.SUCCESS)
            .send({ message: geti18nResponse(req, 'success', msg.success), grn });
    } catch (error) {
        logger.error(error.stack);
        return res.status(requestCode.SERVER_ERROR)
            .send({ error: geti18nResponse(req, 'unknownError', msg.unknownError) });
    }
};
