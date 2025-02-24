import { Alert, AutoComplete, Button, Card, Col, Descriptions, Divider, Form, Input, 
    InputNumber, Modal, Popconfirm, Popover, Row, Select, Skeleton, Space, Tooltip, 
    Typography,
    Watermark} from "antd";
import { inject, observer } from "mobx-react";
import Utility from "../../Global/Utility";
import { CloseSquareFilled, DeleteOutlined, DiffOutlined, DownloadOutlined, ExclamationCircleOutlined, 
    FilePdfOutlined, InfoCircleOutlined, MinusOutlined, PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import { t } from "i18next";
import CountryList from "../../Global/CountryList";
import Constant from "../../Global/Constant";
import globalStore from "../../Store/globalStore";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import Notification from "../../Global/Notification";
import saleStore from "../../Store/saleStore";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import AmountToWords from "../../Components/AmountToWords";
import html2pdf from "html2pdf.js";
import PreviewPdf from "../../Components/PreviewPdf";
import type { BaseSelectRef } from 'rc-select';
import TotalShow from "./TotalShow";
import PaymentsIcon from '@mui/icons-material/Payments';
import { Mandatory } from "../../Components/Mandatory";
import ConfirmModal from "../../Components/ConfirmModal";
import InvoicePanel from "./InvoicePanel";

interface MasterData {
    titles: any[];
    genders: any[];
    paymentTypes: any[];
};

interface AddedItems {
    itemName: string;
    itemId: string;
    batchNo: any[];
    qty: number;
};

const { Text, Title } = Typography;

function Sale() {

    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [paymentForm] = Form.useForm();
    const [paymentRemarksForm] = Form.useForm();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const saleItemRef = useRef<BaseSelectRef>(null);
    const [masterData,setMasterData] = useState<MasterData>({
        titles: [],
        genders: [],
        paymentTypes: []
    });
    const [items, setItems] = useState<any[]>([]);
    const [stockItems, setStockItems] = useState<any[]>([]);
    const [stockPopover, setStockPopover] = useState<any>({
        itemId: null,
        itemName: null
    });
    const [batchNos, setBatchNos] = useState<any[]>([]);
    const [patientDetails, setPatientDetails] = useState<any>({
        mobileCode: Constant.countryDialCode || null,
        mobileNo: null,
        title: null,
        titleName: null,
        fullName: null,
        place: null,
        gender: null,
        doctor: null,
        age: {
            years: null,
            months: null,
            days: null
        },
    });
    const [addedItem, setAddedItem] = useState<AddedItems | null>(null);
    const [addedItems, setAddedItems] = useState<AddedItems[]>([]);
    const [maxQty, setMaxQty] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<any>(null);
    const [itemInput, setItemInput] = useState('');
    const [totalPopover, setTotalPopover] = useState<{
        qty: boolean;
        discount: boolean;
    }>({
        qty: false,
        discount: false
    });
    let billItemsSlNo = 1;
    const [totals, setTotals] = useState({
        totalAmount: 0,
        discountAmount: 0,
        grandTotal: 0,
        roundedGrandTotal: 0,
        roundoffGrandTotal: 0,
    });
    const [previewModal, setPreviewModal] = useState<{
        open: boolean;
        link: string | null;
        fileName: string | null;
    }>({
        open: false,
        link: null,
        fileName: null
    });
    const [editCell, setEditCell] = useState<any>(null); 
    const [tempValue, setTempValue] = useState<string | number>('');
    const [paymentAmount, setPaymentAmount] = useState({
        total: 0,
        balance: 0
    });
    const [confirmModalProps, setConfirmModalProps] = useState<{
        open: boolean;
        content: ReactElement
    }>({
        open: false,
        content: <></>
    });
    const [isInvoiceGenerated, setIsInvoiceGenerated] = useState<boolean>(false);
    const [invoiceNo, setInvoiceNo] = useState(() => `IN${String(new Date().getFullYear()).slice(-2)}${String(new Date().getFullYear() + 1).slice(-2)}xxxxxxxxx`);

    useEffect(() => {
        getMasters();
    }, []);

    useEffect(() => {
        let totalAmount = 0;
        let discountAmount = 0;
        let grandTotal = 0;

        addedItems.forEach(item => {
            item.batchNo.forEach(batch => {
                const batchTotalAmount = batch.totalAmount + batch.taxAmount;
                totalAmount += batchTotalAmount;
                discountAmount += batch.discountAmount || 0;
                grandTotal += (batchTotalAmount - (batch.discountAmount || 0));
            });
        });

        const { 
            roundedValue, 
            roundoffValue 
        } = Utility.roundTo(grandTotal, 0);

        setTotals({
            totalAmount: totalAmount,
            discountAmount: discountAmount,
            grandTotal: grandTotal,
            roundedGrandTotal: roundedValue,
            roundoffGrandTotal: roundoffValue
        });
        paymentForm.setFieldsValue({ 'sale-payment-amount': roundedValue });
        setPaymentAmount(prev => ({ ...prev, total: roundedValue }));
    }, [addedItems]);

    const { i18n } = useTranslation();
    useEffect(() => {
        i18n.changeLanguage(globalStore.language);
    }, [globalStore.language]);

    useEffect(() => {
        if (masterData.paymentTypes.length > 0) {
          paymentForm.setFieldsValue({
            'sale-payment-mode': masterData.paymentTypes[0].type,
          });
        }
    }, [masterData.paymentTypes, paymentForm]);

    useEffect(() => {
        if (masterData.genders.length > 0) {
          form.setFieldsValue({
            'sale-gender': masterData.genders[0]._id,
          });
        }
        if (masterData.titles.length > 0) {
            form.setFieldsValue({
              'sale-title': masterData.titles[0]._id,
            });
        }
    }, [masterData.genders, form, masterData.titles]);

    const getMasters = async () => {
        globalStore.setLoading(true);
        try {
            await saleStore.getMasterData();
            setMasterData(saleStore);
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('defaultErrorMessage')
            });
        } finally {
            setTimeout(() => {
                globalStore.setLoading(false);
            }, 500);
        }
    };

    const getItems = async (value: any) => {
        try {
            if (value) {
                await saleStore.getItems(value);
                const groupedData = saleStore?.items.reduce((acc: any, item: any) => {
                    const itemId = item?.itemsData?._id;
                
                    if (!acc[itemId]) {
                        acc[itemId] = {
                            _id: itemId,
                            name: item?.itemsData?.name,
                            genericName: item?.genericData?.name,
                            risk: {
                                name: item?.riskData?.name,
                                color: item?.riskData?.color,
                            },
                            totalQty: 0,
                            totalFreeQty: 0,
                            stockId: item?._id
                        };
                    }

                    acc[itemId].totalQty += Number(item?.totalQty);
                    acc[itemId].totalFreeQty += Number(item?.totalFreeQty);
                
                    return acc;
                }, {});
                
                const itemsData = Object.values(groupedData).map((item: any) => ({
                    _id: item._id,
                    name: item.name,
                    genericName: item.genericName,
                    risk: item.risk,
                    stock: item.totalQty + item.totalFreeQty,
                    stockId: item.stockId,
                }));
                
                setItems(itemsData);

                const groupedStockItems = saleStore?.items.reduce((acc: any, item: any) => {
                    const outletId = item?.outletsData?._id;
                    const itemId = item?.itemsData?._id;
                
                    if (!acc[outletId]) {
                        acc[outletId] = {
                            _id: outletId,
                            outlet: item?.outletsData?.name,
                            items: {} 
                        };
                    }

                    if (!acc[outletId].items[itemId]) {
                        acc[outletId].items[itemId] = {
                            _id: itemId,
                            itemName: item?.itemsData?.name,
                            totalQty: 0,
                            totalFreeQty: 0,
                            stockId: item._id,
                        };
                    }

                    acc[outletId].items[itemId].totalQty += Number(item?.totalQty);
                    acc[outletId].items[itemId].totalFreeQty += Number(item?.totalFreeQty);
                
                    return acc;
                }, {});

                const stockItemsData = Object.values(groupedStockItems).flatMap((outlet: any) =>
                    Object.values(outlet.items).map((item: any) => ({
                        outletId: outlet._id,
                        outlet: outlet.outlet,
                        itemId: item._id,
                        itemName: item.itemName,
                        stock: item.totalQty + item.totalFreeQty,
                        stockId: item.stockId,
                    }))
                );

                setStockItems(stockItemsData)
            } else {
                setItems([]);
            }
        } catch (error) {
            setItems([]);
        }
    };

    const getTotalStockByItemId = (itemId: string) => {
        return stockItems
            ?.filter(item => item.itemId === itemId)
            .reduce((total, item) => total + (Number(item?.stock) || 0), 0);
    };
    
    const handleItemSelect = (value: string, key: string) => {
        setItemInput(value);
        setStockPopover({
            itemId: null,
            itemName: null
        });
        setTotalAmount(null);
        form.setFieldsValue({ 'sale-qty': undefined });
        form.setFieldsValue({ 'sale-discount': undefined });

        const qtyElement = document.getElementById('form-sale_sale-qty') as HTMLElement;
        setTimeout(() => {
            qtyElement?.focus();
        }, 100);

        const filteredItems = saleStore?.items
        .filter((item: any) => item.itemsData._id === key)
        .map((item: any) => ({
            itemId: item.itemsData._id,
            batchNo: item.batchNo,
            stock: Number(item?.totalQty) + Number(item?.totalFreeQty),
            expiry: item.expiry,
            mrpPerQty: item.mrpPerQty,
            hsnNo: item.hsnNo,
            rackNo: item.rackNo,
            unit: item.unitData.name,
            tax: item.tax,
            taxForFree: item.taxForFree,
            stockId: item._id
        })).sort((a, b) => dayjs(a.expiry).unix() - dayjs(b.expiry).unix());

        setBatchNos(filteredItems);
        if (filteredItems.length > 0) {
            form.setFieldsValue({ 'sale-batch-no': filteredItems[0].batchNo });
        }

        const totalStock: number = filteredItems.reduce((sum, batch) => sum + batch.stock, 0);
        setMaxQty(totalStock);

        const selectedItem: any = saleStore?.items.find((item: any) => item?.itemsData?._id === key);

        if (selectedItem) {
            const { name: itemName } = selectedItem.itemsData;
    
            setAddedItem(
                {
                    ...addedItem,
                    itemName,
                    itemId: key,
                    batchNo: [],
                    qty: 0
                }
            );
        }
    };

    const handleSearch = (searchText: string) => {
        setTotalAmount(null);
        if (searchText) {
            getItems(searchText);
            setItemInput(searchText);
        } else {
            setItems([]);
            setBatchNos([]);
            setItemInput('');
            form.setFieldsValue({ 'sale-batch-no': undefined });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const key = event.key;
        const options = items?.map((item, index) => ({
            key: item?._id,
            value: item?.name,
            item: item
        }));

        let currentIndex = options.findIndex(option => option.key === stockPopover.itemId);
    
        if (key === 'ArrowDown') {
            currentIndex = (currentIndex + 1) % options.length;
        } else if (key === 'ArrowUp') {
            currentIndex = (currentIndex - 1 + options.length) % options.length;
        }

        if (currentIndex >= 0 && options[currentIndex]) {
            const selectedItem = options[currentIndex].item;
            setStockPopover({
                itemId: selectedItem?._id,
                itemName: selectedItem?.name
            });
        } else {
            setStockPopover({
                itemId: null,
                itemName: null,
            });
        }
    };    

    const isPatientDetailsNotEmpty = (details: any) => {
        return Object.entries(details || {}).some(([key, value]) => 
            key !== 'mobileCode' && 
            value !== null && 
            (typeof value !== 'object' || 
            Object.values(value).some(subValue => subValue !== null))
        );
    };

    const handleQtyChange = (value: any) => {
        const qty: number = Number(value);
        const selectedItem: any = saleStore?.items.find((item: any) => item?.itemsData?._id === addedItem?.itemId);
       
        if (selectedItem) {
            let remainingQty = qty;
            const newBatchNos: any[] = [];
    
            const matchingBatches = batchNos.filter(batch => batch.itemId === addedItem?.itemId);
            const totalStock = matchingBatches.reduce((acc, batch) => acc + batch.stock, 0);

            let discountAmount = 0;
            const discountValue = (document.getElementById('sale-discount-input') as HTMLInputElement)?.value;
        
            if (discountValue) {
                if (discountValue.includes('%')) {
                    const percentageValue = parseFloat(discountValue.replace('%', '').trim());
                    if (!isNaN(percentageValue)) {
                        const totalAmount = addedItem?.batchNo.reduce((acc, batch) => acc + batch.totalAmount, 0);
                        discountAmount = Math.round(((totalAmount * percentageValue) / 100) * 
                                        Math.pow(10, Constant.roundOffs.sale.discount)) 
                                        / Math.pow(10, Constant.roundOffs.sale.discount);
                    }
                } else {
                    const fixedDiscountValue = parseFloat(discountValue.trim());
                    if (!isNaN(fixedDiscountValue)) {
                        discountAmount = fixedDiscountValue;
                    }
                }
            }

            if (qty <= totalStock) {
                for (const batch of matchingBatches) {
                    if (remainingQty <= 0) break;
    
                    const coveredStock = Math.min(remainingQty, batch.stock);
                    const mrpPerQty: number = batch?.mrpPerQty || 0;
                    const expiry = dayjs(batch?.expiry).format('MM/YYYY') || '';
                    const hsnNo = batch?.hsnNo || '';
                    const rackNo = batch?.rackNo || '';
                    const unit = batch?.unit || '';
                    const tax = batch?.tax || null;
                    const taxForFree = batch?.taxForFree || null;
                    const stock = batch.stock || 0;
                    const remainingTotalAmount = (coveredStock * mrpPerQty) - discountAmount;

                    let taxAmount: number = 0;
                    let rate: number = 0;

                    if (tax?.inclusive) {
                        const totalAmount = coveredStock * mrpPerQty;
                        if (tax.taxType === 'percentage') {
                            taxAmount = Math.round(((totalAmount - discountAmount) * 
                                        (Number(tax.taxValue) / (100 + Number(tax.taxValue)))) * 
                                        Math.pow(10, Constant.roundOffs.sale.tax)) 
                                        / Math.pow(10, Constant.roundOffs.sale.tax);
                            rate = Math.round((mrpPerQty / (1 + Number(tax.taxValue) / 100)) * 
                                    Math.pow(10, Constant.roundOffs.sale.amount)) / 
                                    Math.pow(10, Constant.roundOffs.sale.amount);
                        } else {
                            const fixedTaxValue = tax.taxValue * coveredStock;
                            taxAmount = remainingTotalAmount > 0 
                                ? Math.round((fixedTaxValue * remainingTotalAmount) / totalAmount)
                                : 0;
                            rate = Math.round((mrpPerQty - (tax.taxValue)) * 
                                    Math.pow(10, Constant.roundOffs.sale.amount)) / 
                                    Math.pow(10, Constant.roundOffs.sale.amount);
                        }
                    } else {
                        if (tax?.taxType === 'percentage') {
                            taxAmount = Math.round(((((coveredStock * mrpPerQty) - discountAmount) * 
                                        (Number(tax.taxValue))) / 100) * 
                                        Math.pow(10, Constant.roundOffs.sale.tax)) 
                                        / Math.pow(10, Constant.roundOffs.sale.tax);
                        } else {
                            taxAmount = tax.taxValue * coveredStock;
                        }
                        rate = mrpPerQty;
                    }

                    const totalAmount = Math.round((coveredStock * (tax?.inclusive ? rate : mrpPerQty )) * 
                                        Math.pow(10, Constant.roundOffs.sale.amount)) 
                                        / Math.pow(10, Constant.roundOffs.sale.amount);

                    newBatchNos.push({
                        batch: batch.batchNo,
                        coveredStock,
                        totalAmount,
                        taxAmount,
                        expiry,
                        hsnNo,
                        rackNo,
                        unit,
                        tax,
                        taxForFree,
                        rate,
                        stock,
                        stockId: batch.stockId,
                    });

                    remainingQty -= coveredStock;
                }

                form.setFields([{ name: 'sale-qty', errors: [] }]);
            } else {
                form.setFields([
                    {
                        name: 'sale-qty',
                        errors: [t('qtyExeedStockError')],
                    },
                ]);
            }
    
            setAddedItem({
                itemName: addedItem?.itemName || "",
                itemId: addedItem?.itemId || "",
                qty,
                batchNo: newBatchNos
            });

            const totalAmount = newBatchNos
                    .reduce((acc, batch) => {
                        return acc + (batch.totalAmount || 0);
                    }, 0);
            const totalTaxAmount = newBatchNos
                    .reduce((acc, batch) => {
                        return acc + (batch.taxAmount || 0);
                    }, 0);
            setTotalAmount({
                amount: totalAmount,
                tax: totalTaxAmount,
                discount: totalAmount < discountAmount ? totalAmount : discountAmount,
            });
            setTotalPopover({
                qty: true,
                discount: false
            });
        }
        if (!value) {
            setTotalAmount(null);
            setTotalPopover({
                qty: false,
                discount: false
            });
        }
    };

    const addItem = () => {
        const errors = form.getFieldsError();
        const fieldsToCheck = ["sale-discount", "sale-batch-no", "sale-qty", "sale-item"];
        const hasErrors = fieldsToCheck.some(fieldName => {
            const fieldError = errors.find(error => error.name[0] === fieldName);
            return fieldError && fieldError.errors.length > 0;
        });
        if (hasErrors) {
            return;
        }
        setTotalAmount(null);
        if (!addedItem) {
            form.setFields([
                {
                    name: 'sale-item',
                    errors: [t('itemError')],
                },
            ]);
        } else if (addedItem?.qty === 0) {
            form.setFields([
                {
                    name: 'sale-qty',
                    errors: [t('qtyError')],
                },
            ]);
        } else {
            const isItemAlreadyAdded = addedItems.some(item => item.itemId === addedItem.itemId);
            if (isItemAlreadyAdded) {
                form.setFields([
                    {
                        name: 'sale-item',
                        errors: [t('itemAlreadyAddedError')],
                    },
                ]);
            } else {
                form.setFields([
                    { name: 'sale-item', errors: [] },
                    { name: 'sale-qty', errors: [] },
                ]);
                setAddedItems(prevItems => [...prevItems, addedItem]);
            }
            setAddedItem(null);
            form.resetFields(['sale-item', 'sale-qty', 'sale-batch-no', 'sale-discount']);
            setTimeout(() => {
                saleItemRef?.current?.focus();
            }, 200);
            setItemInput('');
            setItems([]);
        }
    };

    const handleItemDiscount = (value: string) => {
        let discountAmount = 0;
        
        if (value.includes('%')) {
            const percentageValue = parseFloat(value.replace('%', '').trim());
            if (!isNaN(percentageValue)) {
                const totalAmount = addedItem?.batchNo.reduce((acc, batch) => acc + batch.totalAmount, 0);
                discountAmount = Math.round(((totalAmount * percentageValue) / 100) * 
                                Math.pow(10, Constant.roundOffs.sale.discount)) 
                                / Math.pow(10, Constant.roundOffs.sale.discount);
            }
        } else {
            const fixedDiscountValue = parseFloat(value.trim());
            if (!isNaN(fixedDiscountValue)) {
                discountAmount = fixedDiscountValue;
            }
        }

        const totalBatchAmount = addedItem?.batchNo.reduce((acc, batch) => acc + batch.totalAmount, 0) || 1;
        addedItem?.batchNo.forEach(batch => {
            const batchProportion = batch.totalAmount / totalBatchAmount;
            batch.discountAmount = Math.round((discountAmount * batchProportion) * 
                                Math.pow(10, Constant.roundOffs.sale.discount)) 
                                / Math.pow(10, Constant.roundOffs.sale.discount);
            const totalAmount = batch.totalAmount - (batch.discountAmount || 0);

            if (batch.tax.taxType === 'percentage') {
                batch.taxAmount = Math.round((totalAmount * (Number(batch.tax.taxValue) / 
                            (100 + Number(batch.tax.taxValue)))) * 
                            Math.pow(10, Constant.roundOffs.sale.tax)) 
                            / Math.pow(10, Constant.roundOffs.sale.tax);
            } else {
                const fixedTaxValue = batch.tax.taxValue * (batch.coveredStock || 1);
                batch.taxAmount = totalAmount > 0 
                    ? (fixedTaxValue * totalAmount) / batch.totalAmount 
                    : 0;
            }
        });
        const totalTaxAmount = addedItem?.batchNo.reduce((acc, batch) => acc + batch.taxAmount, 0) || 0;

        setAddedItem({
            ...addedItem!
        });
        setTotalAmount({ 
            ...totalAmount, 
            discount: totalAmount.amount < discountAmount ? totalAmount.amount : discountAmount, 
            tax: totalAmount.amount < discountAmount ? 0 : totalTaxAmount,
        });
    };

    const handleClearItem = () => {
        setItemInput('');
        setAddedItem(null);
        form.setFieldsValue({ 'sale-item': undefined });
        form.setFieldsValue({ 'sale-batch-no': undefined });
        form.setFieldsValue({ 'sale-qty': undefined });
        form.setFieldsValue({ 'sale-discount': undefined });
        setItemInput('');
        setItems([]);
    };

    const handlePrintPdf = () => {
        const fileName = 'Invoice.pdf';
        const element = invoiceRef.current;
        if (!element) return;
    
        const options = {
          margin: 0.5,
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a5', orientation: 'landscape' },
        };
    
        html2pdf()
          .from(element)
          .set(options)
          .toPdf()
          .get('pdf')
          .then((pdf: any) => {
            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            let iframe = document.getElementById('pdf-print-frame') as HTMLIFrameElement;
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'pdf-print-frame';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            iframe.src = pdfUrl;
            iframe.onload = () => {
                iframe.contentWindow?.print();
            };
          })
          .catch((error: any) => {
            console.error('Error printing PDF:', error);
          });
    };

    const handlePreviewPdf = () => {
        globalStore.setLoading(true);
        const fileName = 'Invoice.pdf';
        const element = invoiceRef.current;
        if (!element) return;
    
        const options = {
          margin: 0.5,
          filename: 'fileName',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        };
    
        html2pdf()
          .from(element)
          .set(options)
          .toPdf()
          .get('pdf')
          .then((pdf: any) => {
            const pdfUrl = pdf.output('bloburl');
            setPreviewModal({
                open: true,
                link: pdfUrl,
                fileName
            });
          })
          .catch((error: any) => {
            console.error('Error generating PDF link:', error);
          }).finally(() => {
            globalStore.setLoading(false);
          });
    };

    const handleDoubleClick = (
        itemIndex: number, 
        batchIndex: number, 
        field: any, 
        currentValue: any
    ) => {
        setEditCell({ itemIndex, batchIndex, field });
        if (!tempValue || tempValue === '') {
            editForm.setFieldValue(field+'-'+itemIndex+'-'+batchIndex, currentValue);
            setTempValue(currentValue);
        }
    };

    const handleBlur = (
        event: any, 
        itemIndex: number, 
        batchIndex: number, 
        field: any,
        stock: number
    ) => {
        let value = event.currentTarget.value;
        const updatedItems = [...addedItems];
        const currentBatch = updatedItems[itemIndex].batchNo[batchIndex];
        if (field === 'coveredStock') {
            value = value ? parseFloat(value) : 1;
            if (stock < value) {
                editForm.setFields([
                    { 
                        name: field+'-'+itemIndex+'-'+batchIndex, 
                        errors: [t('maxError')+' '+stock] 
                    },
                ]);
                return;
            } else if (value < 1) {
                editForm.setFields([
                    { 
                        name: field+'-'+itemIndex+'-'+batchIndex, 
                        errors: [t('minError')+' 1'] 
                    },
                ]);
                return;
            }
            currentBatch[field] = value;
            currentBatch.totalAmount = Math.round((value * currentBatch.rate) * 
                                    Math.pow(10, Constant.roundOffs.sale.amount)) 
                                    / Math.pow(10, Constant.roundOffs.sale.amount);
            if ((currentBatch.discountAmount || 0) > currentBatch.totalAmount) {
                currentBatch.discountAmount = currentBatch.totalAmount;
            }

            const taxValue = currentBatch.tax.taxValue || 0;
            const taxType = currentBatch.tax.taxType;
            let taxAmount: number = 0;
            
            if (taxType === 'percentage') {
                taxAmount = Math.round(((currentBatch.totalAmount - (currentBatch.discountAmount || 0)) * 
                            (Number(taxValue) / (100 + Number(taxValue)))) * 
                            Math.pow(10, Constant.roundOffs.sale.tax)) 
                            / Math.pow(10, Constant.roundOffs.sale.tax);
            } else {
                taxAmount = taxValue;
            }
            currentBatch.taxAmount = taxAmount * (currentBatch.coveredStock || 1);

        }
        if (field === 'discount') {
            value = value || '0';
            let discountAmount: number = 0;
            if (value.includes('%')) {
                const percentageValue = parseFloat(value.replace('%', '').trim());
                if (!isNaN(percentageValue)) {
                    const totalAmount = currentBatch.totalAmount || 0;
                    discountAmount = Math.round(((totalAmount * percentageValue) / 100) * 
                                    Math.pow(10, Constant.roundOffs.sale.discount)) 
                                    / Math.pow(10, Constant.roundOffs.sale.discount);
                }
            } else {
                const fixedDiscountValue = parseFloat(value.trim());
                if (!isNaN(fixedDiscountValue)) {
                    discountAmount = fixedDiscountValue;
                }
            }
            if (discountAmount > currentBatch.totalAmount) {
                discountAmount = currentBatch.totalAmount;
            }

            const taxValue = currentBatch.tax.taxValue || 0;
            const taxType = currentBatch.tax.taxType;
            let taxAmount: number = 0;
            
            if (taxType === 'percentage') {
                taxAmount = Math.round(((currentBatch.totalAmount - discountAmount) * 
                            (Number(taxValue) / (100 + Number(taxValue)))) * 
                            Math.pow(10, Constant.roundOffs.sale.tax)) 
                            / Math.pow(10, Constant.roundOffs.sale.tax);
            } else {
                taxAmount = taxValue;
            }
            currentBatch.taxAmount = taxAmount * (currentBatch.coveredStock || 1);
            currentBatch['discountAmount'] = discountAmount;
        }
        setAddedItems(updatedItems);
        setEditCell(null);
        setTempValue('');
    };

    const deleteItem = (itemIndex: number, batchIndex: number) => {
        const updatedItems = [...addedItems];
        if (updatedItems[itemIndex] && updatedItems[itemIndex].batchNo[batchIndex]) {
            updatedItems[itemIndex].batchNo.splice(batchIndex, 1);

            if (updatedItems[itemIndex].batchNo.length === 0) {
                updatedItems.splice(itemIndex, 1);
            }
        }
        setAddedItems(updatedItems);
    };

    const handlePaymentAamountChange = (value: number | null) => {
        const formValues = paymentForm.getFieldsValue();
        const salePaymentAmount = formValues["sale-payment-amount"] || 0;
        const formSalePaymentList = formValues["form-sale-payment-list"];
        let newTotalValue = salePaymentAmount;
        if (Array.isArray(formSalePaymentList) && formSalePaymentList.length > 0) {
            const listSum = formSalePaymentList.reduce(
                (sum, item) => sum + (item.amount || 0),
                0
            );
            newTotalValue += listSum;
        }
        const balance = (totals.roundedGrandTotal - newTotalValue) || 0;
        setPaymentAmount({ balance, total: newTotalValue });
        console.log(formValues)
    };

    const handleDuplicatePaymentMode = (value: string) => {
        const fieldValues = { ...paymentForm.getFieldsValue() };
        const paymentList = fieldValues['form-sale-payment-list'];
        const allModes: string[] = [];
        const updatedFields: any[] = [];
    
        if (fieldValues['sale-payment-mode']) {
            allModes.push(fieldValues['sale-payment-mode']);
        }
        if (paymentList && Array.isArray(paymentList)) {
            paymentList.forEach((item: any) => {
                if (item.mode) {
                    allModes.push(item.mode);
                }
            });
        }

        const duplicateModes = allModes.filter(
            (mode, index) => allModes.indexOf(mode) !== index
        );

        if (duplicateModes.includes(fieldValues['sale-payment-mode'])) {
            updatedFields.push({
                name: 'sale-payment-mode',
                errors: [t('duplicatePaymentMode')],
            });
        } else {
            updatedFields.push({
                name: 'sale-payment-mode',
                errors: [],
            });
        }

        if (paymentList && Array.isArray(paymentList)) {
            paymentList.forEach((item: any, index: number) => {
                if (duplicateModes.includes(item.mode)) {
                    updatedFields.push({
                        name: ['form-sale-payment-list', index, 'mode'],
                        errors: [t('duplicatePaymentMode')],
                    });
                } else {
                    updatedFields.push({
                        name: ['form-sale-payment-list', index, 'mode'],
                        errors: [],
                    });
                }
            });
        }

        if (updatedFields.length > 0) {
            paymentForm.setFields(updatedFields);
        }
    };
    
    const getPaymentTypeName = (mode: string) => {
        const paymentType = masterData.paymentTypes.find((type) => type.type === mode);
        return paymentType ? paymentType.name : mode;
    };

    const handlePay = async () => {
        const billTotal: number = totals.roundedGrandTotal || 0;
        const payTotal: number = paymentAmount.total || 0;
        const balance: number = paymentAmount.balance || 0;
        const fieldValues = { ...paymentForm.getFieldsValue() };
      
        let hasErrors = false;

        if (payTotal > billTotal || balance < 0) {
          paymentForm.setFields([
            {
              name: 'sale-pay-button',
              errors: [t('payAmountGreaterMessage')],
            },
          ]);
          hasErrors = true;
        }

        if (fieldValues['sale-payment-amount'] < 0) {
          paymentForm.setFields([
            {
              name: 'sale-payment-amount',
              errors: [t('amountEmpty')],
            },
          ]);
          hasErrors = true;
        }
      
        const paymentList = fieldValues['form-sale-payment-list'];
        const allModes: string[] = [];

        if (fieldValues['sale-payment-mode']) {
          allModes.push(fieldValues['sale-payment-mode']);
        }
      
        if (paymentList && Array.isArray(paymentList)) {
          paymentList.forEach((item: any, index: number) => {
            if (!item.amount || item.amount <= 0) {
              hasErrors = true;
              paymentForm.setFields([
                {
                  name: ['form-sale-payment-list', index, 'amount'],
                  errors: [t('amountEmpty')],
                },
              ]);
            }
      
            if (item.mode) {
              allModes.push(item.mode);
            }
          });
        }

        const duplicateModes = allModes.filter(
          (mode, index) => allModes.indexOf(mode) !== index
        );
      
        if (duplicateModes.length > 0) {
          hasErrors = true;

          if (duplicateModes.includes(fieldValues['sale-payment-mode'])) {
            paymentForm.setFields([
              {
                name: 'sale-payment-mode',
                errors: [t('duplicatePaymentMode')],
              },
            ]);
          }

          if (paymentList && Array.isArray(paymentList)) {
            paymentList.forEach((item: any, index: number) => {
              if (duplicateModes.includes(item.mode)) {
                paymentForm.setFields([
                  {
                    name: ['form-sale-payment-list', index, 'mode'],
                    errors: [t('duplicatePaymentMode')],
                  },
                ]);
              }
            });
          }
        }

        if (hasErrors) {
          return;
        }

        console.log(masterData.paymentTypes)
        console.log(fieldValues)

        const paymentAmounts: Record<string, number> = {};
        if (fieldValues["sale-payment-mode"] && fieldValues["sale-payment-amount"]) {
            paymentAmounts[fieldValues["sale-payment-mode"]] = fieldValues["sale-payment-amount"];
        }

        if (fieldValues["form-sale-payment-list"] && Array.isArray(fieldValues["form-sale-payment-list"])) {
            fieldValues["form-sale-payment-list"].forEach((item: { mode: string; amount: number }) => {
              if (item.mode && item.amount) {
                paymentAmounts[item.mode] = item.amount;
              }
            });
        }

        const additionalFields = allModes.map((mode) => {
            const typeName = getPaymentTypeName(mode);
            const amount = paymentAmounts[mode];
          if (mode !== 'cash') {
            return (
                <React.Fragment key={`${mode}`}>
                    <Divider 
                    orientation="left" 
                    plain 
                    orientationMargin="1"
                    style={{
                        marginTop: 0,
                        marginBottom: 5
                    }}
                    >
                        <Text strong type="secondary">
                            {typeName} : {(Constant.currencySymbol || Constant.currencyShort) + ' '}
                            {amount.toFixed(Constant.roundOffs.sale.amount)}
                        </Text>
                    </Divider>
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <Form.Item
                        style={{
                            marginBottom: 5
                        }}
                        id={`${mode}-transaction-no`}
                        name={`${mode}-transaction-no`}
                        >
                            <Input
                            placeholder={t('transactionNoText')}
                            name={`${mode}-transaction-no-input`}
                            maxLength={30}
                            />
                        </Form.Item>
                    </Col>
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <Form.Item
                        style={{ marginBottom: 10 }}
                        id={`${mode}-remarks`}
                        name={`${mode}-remarks`}
                        >
                            <Input.TextArea
                            placeholder={t('remarksText')}
                            name={`${mode}-remarks-input`}
                            rows={2}
                            maxLength={100}
                            style={{
                                resize: 'none'
                            }}
                            />
                        </Form.Item>
                    </Col>
                </React.Fragment>
            );
          }
      
          return (
            <Col lg={24} md={24} sm={24} xs={24} key={`${mode}`}>
                <Divider 
                orientation="left" 
                plain 
                orientationMargin="1"
                style={{
                    marginTop: 0,
                    marginBottom: 5
                }}
                >
                    <Text strong type="secondary">
                        {typeName} : {(Constant.currencySymbol || Constant.currencyShort) + ' '}
                        {amount.toFixed(Constant.roundOffs.sale.amount)}
                    </Text>
                </Divider>
                <Form.Item
                style={{ marginBottom: 10 }}
                id={`${mode}-remarks`}
                name={`${mode}-remarks`}
                >
                <Input.TextArea
                    placeholder={t('remarksText')}
                    name={`${mode}-remarks-input`}
                    rows={2}
                    maxLength={100}
                    style={{
                        resize: 'none'
                    }}
                />
                </Form.Item>
            </Col>
          );
        });

        setConfirmModalProps({
          open: true,
          content: (
            <Form 
            autoFocus
            form={paymentRemarksForm}
            id="form-sale-remarks"
            onKeyDown={(event) => Utility.handleEnterKey(event, 'form-sale-remarks')}
            style={{ marginBottom: 10 }}
            >
                <Row gutter={[4, 4]}>
                    {additionalFields}
                </Row>
            </Form>
          ),
        });
      };      

    const handleConfirmPayment = async () => {
        const patientDetails = form.getFieldsValue();
        const paymentRemarks = paymentRemarksForm.getFieldsValue();
        const paymentDetails = paymentForm.getFieldsValue();
        const params = new URLSearchParams(window.location.search);
        const saleMasterId = params.get('smid');
        try {
            const result = await saleStore.confirmPayment({patientDetails, paymentDetails, paymentRemarks, saleMasterId});
            paymentRemarksForm.resetFields();
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('defaultErrorMessage')
            });
        } finally {
            setTimeout(() => {
                globalStore.setLoading(false);
            }, 500);
        }
    };

    const handleGenerateInvoice = async () => {
        globalStore.setLoading(true);
        try {
            const data = { addedItems, patientDetails, totals };
            const result = await saleStore.generateInvoice(data);
            const invoiceNumber = result?.data?.invoiceNumber;
            const saleMasterId = result?.data?.saleMasterId;

            setInvoiceNo(invoiceNumber);
            setIsInvoiceGenerated(true);

            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('smid', saleMasterId);
            window.history.pushState({}, '', newUrl.toString());

            Notification.success({
                message: t('success'),
                description: t('invoiceGeneratedSuccessfully')
            });
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('defaultErrorMessage')
            });
        } finally {
            setTimeout(() => {
                globalStore.setLoading(false);
            }, 500);
        }
    };

    return (
        <>
            <PreviewPdf
                open={previewModal?.open}
                setOpen={(isOpen) => setPreviewModal((prev: any) => ({ ...prev, open: isOpen }))}
                pdfUrl={previewModal?.link}
                fileName={previewModal?.fileName}
            />
            <ConfirmModal
            title={t('confirmPaymentText')}
            content={confirmModalProps.content}
            visible={confirmModalProps.open}
            onOk={handleConfirmPayment}
            onCancel={() => setConfirmModalProps({
                open: false,
                content: <></>
            })}
            />
            <InvoicePanel />
            <Row gutter={[4, 4]}>
                <Col lg={10} md={10} sm={24} xs={24}>
                    <Form
                        form={form}
                        name='form-sale'
                        id='form-sale'
                        initialValues={{ remember: true }}
                        // onFinish={onFinish}
                        // onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        onKeyDown={(event) => Utility.handleEnterKey(event, 'form-sale')}
                        layout="vertical"
                    >
                        <Col lg={24} md={24} sm={24} xs={24}>
                            <Card>
                            <Row gutter={[16, 4]}>
                                <Col lg={24} md={24} sm={24} xs={24}>
                                <Form.Item
                                    label={
                                        <>
                                            {t('mobileNumberText')}
                                            <Tooltip placement="top" 
                                            title={t('saleMobileNumberTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    required
                                >
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Form.Item
                                        initialValue={Constant.countryDialCode}
                                        name='sale-mobile-code'
                                        id="sale-mobile-code"
                                        rules={[
                                            {
                                                required: true,
                                                message: t('countryCodeEmpty'),
                                            },
                                        ]}
                                        style={{ 
                                            width: globalStore.screenSize.lg || globalStore.screenSize.md ? 
                                            '55%' : '50%',
                                            marginBottom: 0
                                        }}
                                        >
                                            <Select 
                                            options={CountryList.map(country => ({
                                                value: country.dialCode,
                                                label: (
                                                    <span>
                                                        {country.flag} &nbsp;{country.dialCode}
                                                    </span>
                                                )
                                            }))}
                                            onChange={(value) => {
                                                setPatientDetails({ ...patientDetails, mobileCode: value })
                                            }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                        style={{ width: '100%', marginBottom: 0 }}
                                        name='sale-mobile-number'
                                        id="sale-mobile-number"
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    if (!value) {
                                                        return Promise.reject(t('mobileNumberEmpty'));
                                                    } 
                                                    if (value.toString().length !== 10) {
                                                        return Promise.reject(t('mobileNumberLength'));
                                                    }
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                        >
                                            <InputNumber
                                            autoFocus
                                            placeholder={t('mobileNumberText')}
                                            style={{ width: '100%' }}
                                            maxLength={10}
                                            minLength={10}
                                            max={9999999999}
                                            min={1}
                                            onKeyDown={(e) => {
                                                const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 
                                                    'Enter', 'ArrowLeft', 'ArrowRight'];
                                                const isNumber = /^[1-9]\d*$/;
                                                
                                                if (
                                                    !allowedKeys.includes(e.key) &&
                                                    (e.key.length > 1 || !/^[0-9]$/.test(e.key) || 
                                                    (e.currentTarget.value === '' && e.key === '0'))
                                                ) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(value) => {
                                                setPatientDetails({ ...patientDetails, mobileNo: value })
                                            }}
                                            />
                                        </Form.Item>
                                    </Space.Compact>
                                    </Form.Item>
                                </Col>
                                <Col lg={8} md={8} sm={8} xs={8}>
                                    <Form.Item
                                    label={
                                        <>
                                            {t('titleText')}
                                            <Tooltip placement="top" 
                                            title={t('saleTitleTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    name='sale-title'
                                    id="sale-title"
                                    rules={[
                                        {
                                            required: true,
                                            message: t('titleEmpty'),
                                        },
                                    ]}
                                    >
                                        <Select options={masterData.titles.map((title: any) => ({
                                            value: title?._id,
                                            label: title?.name
                                        }))}
                                        placeholder={t('titleText')}
                                        onChange={(value, option: any) => {
                                            setPatientDetails({ 
                                                ...patientDetails, 
                                                title: value,
                                                titleName: option?.label
                                            })
                                        }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={16} md={16} sm={16} xs={16}>
                                    <Form.Item
                                    label={
                                        <>
                                            {t('fullNameText')}
                                            <Tooltip placement="top" 
                                            title={t('saleFullNameTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    name='sale-full-name'
                                    id="sale-full-name"
                                    rules={[
                                        {
                                            required: true,
                                            message: t('fullNameEmpty'),
                                        },
                                    ]}
                                    >
                                        <Input 
                                        placeholder={t('fullNameText')}
                                        onChange={(e) => {
                                            setPatientDetails({ ...patientDetails, fullName: e.currentTarget.value })
                                        }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={6} sm={24} xs={24}>
                                    <Form.Item
                                    label={
                                        <>
                                            {t('genderText')}
                                            <Tooltip placement="top" 
                                            title={t('saleGenderTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    name='sale-gender'
                                    id="sale-gender"
                                    rules={[
                                        {
                                            required: true,
                                            message: t('genderEmpty'),
                                        },
                                    ]}
                                    >
                                        <Select options={masterData.genders.map((title: any) => ({
                                            value: title?._id,
                                            label: title?.name
                                        }))}
                                        placeholder={t('genderText')}
                                        onChange={(value) => {
                                            setPatientDetails({ ...patientDetails, gender: value })
                                        }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={6} sm={8} xs={8}>
                                    <Form.Item
                                    label={
                                        <>
                                            {t('ageYearsText')}
                                            <Tooltip placement="top" 
                                            title={t('saleAgeYearsTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    name='sale-age-years'
                                    id="sale-age-years"
                                    rules={[
                                        {
                                            required: true,
                                            message: t('ageYearsEmpty'),
                                        },
                                    ]}
                                    >
                                        <InputNumber
                                        placeholder={t('ageYearsText')}
                                        style={{ width: '100%' }}
                                        max={120}
                                        maxLength={3}
                                        min={0}
                                        onKeyDown={(e) => {
                                            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 
                                                'Enter', 'ArrowLeft', 'ArrowRight'];
                                            const isNumber = /^[1-9]\d*$/;
                                            
                                            if (
                                                !allowedKeys.includes(e.key) &&
                                                (e.key.length > 1 || !/^[0-9]$/.test(e.key))
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(value) => {
                                            setPatientDetails({ ...patientDetails, age: { years: value } })
                                        }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={6} sm={8} xs={8}>
                                    <Form.Item
                                    label={
                                        <>
                                            {t('ageMonthsText')}
                                            <Tooltip placement="top" 
                                            title={t('saleAgeMonthsTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    name='sale-age-months'
                                    id="sale-age-months"
                                    rules={[
                                        {
                                            required: true,
                                            message: t('ageMonthsEmpty'),
                                        },
                                    ]}
                                    >
                                        <InputNumber
                                        placeholder={t('ageMonthsText')}
                                        style={{ width: '100%' }}
                                        max={11}
                                        maxLength={2}
                                        min={0}
                                        onKeyDown={(e) => {
                                            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 
                                                'Enter', 'ArrowLeft', 'ArrowRight'];
                                            const isNumber = /^[1-9]\d*$/;
                                            
                                            if (
                                                !allowedKeys.includes(e.key) &&
                                                (e.key.length > 1 || !/^[0-9]$/.test(e.key))
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(value) => {
                                            setPatientDetails({ ...patientDetails, age: { months: value } })
                                        }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={6} sm={8} xs={8}>
                                    <Form.Item
                                    label={
                                        <>
                                            {t('ageDaysText')}
                                            <Tooltip placement="top" 
                                            title={t('saleAgeDaysTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    name='sale-age-days'
                                    id="sale-age-days"
                                    rules={[
                                        {
                                            required: true,
                                            message: t('ageDaysEmpty'),
                                        },
                                    ]}
                                    >
                                        <InputNumber
                                        placeholder={t('ageDaysText')}
                                        style={{ width: '100%' }}
                                        max={30}
                                        min={0}
                                        maxLength={2}
                                        onKeyDown={(e) => {
                                            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 
                                                'Enter', 'ArrowLeft', 'ArrowRight'];
                                            const isNumber = /^[1-9]\d*$/;
                                            
                                            if (
                                                !allowedKeys.includes(e.key) &&
                                                (e.key.length > 1 || !/^[0-9]$/.test(e.key))
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(value) => {
                                            setPatientDetails({ ...patientDetails, age: { days: value } })
                                        }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={12} md={12} sm={12} xs={12}>
                                <Form.Item
                                    label={
                                        <>
                                            {t('placeText')}
                                            <Tooltip placement="top" 
                                            title={t('salePlaceTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    name='sale-place'
                                    id="sale-place"
                                    >
                                        <Input
                                        placeholder={t('placeText')}
                                        onChange={(e) => {
                                            setPatientDetails({ ...patientDetails, place: e.currentTarget.value })
                                        }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={12} md={12} sm={12} xs={12}>
                                <Form.Item
                                    label={
                                        <>
                                            {t('doctorText')}
                                            <Tooltip placement="top" 
                                            title={t('saleDoctorTooltipText')}>
                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                            </Tooltip>
                                        </>
                                    }
                                    name='sale-doctor'
                                    id="sale-doctor"
                                    >
                                        <Input
                                        placeholder={t('doctorText')}
                                        onChange={(e) => {
                                            setPatientDetails({ ...patientDetails, doctor: e.currentTarget.value })
                                        }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Mandatory />
                            </Card>
                        </Col>
                        <Col lg={24} md={24} sm={24} xs={24}>
                            <Card>
                                <Row gutter={[16, 4]}>
                                    <Col lg={24} md={24} sm={24} xs={24}>
                                        <Form.Item
                                        label={
                                            <>
                                                {t('itemText')}
                                                <Tooltip placement="top" 
                                                title={t('saleItemTooltipText')}>
                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name='sale-item'
                                        id="sale-item"
                                        >
                                            <Popover
                                            title={stockPopover.itemName}
                                            overlayStyle={{ zIndex: 9999 }}
                                            arrow={false}
                                            content={
                                                <Descriptions 
                                                bordered 
                                                size="small" 
                                                layout="vertical">
                                                    {stockItems
                                                    ?.filter(stockItem => stockItem.itemId === stockPopover.itemId)
                                                    ?.map((item, index) => (
                                                        <React.Fragment key={item?._id+'-'+index}>
                                                            <Descriptions.Item 
                                                            label={t('outletText')}>
                                                                {item?.outlet}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item 
                                                            label={t('stockText')}>
                                                                {item?.stock}
                                                            </Descriptions.Item>
                                                        </React.Fragment>
                                                    ))}
                                                    <Descriptions.Item 
                                                    label={t('totalStockText')}>
                                                        {getTotalStockByItemId(stockPopover.itemId)}
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            }
                                            placement={
                                                (globalStore.screenSize.lg || globalStore.screenSize.lg) ?
                                                "right" : "top"}
                                            trigger={["hover", "focus", "click"]}
                                            open={stockPopover?.itemId || false}
                                            >
                                            <AutoComplete
                                                ref={saleItemRef}
                                                onClear={handleClearItem}
                                                value={itemInput}
                                                placeholder={t('typeItemText')}
                                                allowClear={{ clearIcon: <CloseSquareFilled /> }}
                                                options={items?.map((item, index) => ({
                                                    key: item?._id,
                                                    value: item?.name,
                                                    label: (
                                                        <div
                                                            onMouseEnter={() => {
                                                                setStockPopover({
                                                                    itemId: item?._id,
                                                                    itemName: item?.name
                                                                });
                                                            }}
                                                            onMouseLeave={() => {
                                                                setStockPopover({
                                                                    itemId: null,
                                                                    itemName: null
                                                                });
                                                            }}
                                                            key={item?._id}
                                                        >
                                                            <span style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                alignItems: 'center', 
                                                                width: '100%',
                                                                color: item?.risk?.color
                                                            }}>
                                                                <span style={{ 
                                                                    overflow: 'hidden', 
                                                                    textOverflow: 'ellipsis', 
                                                                    whiteSpace: 'nowrap' 
                                                                }}>
                                                                    {item?.name}{' '}
                                                                    <span style={{ fontSize: 12, color: 'gray' }}>
                                                                        {item?.genericName && `(${item?.genericName})`}
                                                                    </span>
                                                                </span>
                                                                <span style={{ fontSize: 12, marginLeft: 'auto' }}>
                                                                    {item?.stock}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    )
                                                }))}
                                                onSearch={handleSearch}
                                                onSelect={(value, option) => handleItemSelect(value, option.key)}
                                                onKeyDown={handleKeyDown}
                                            />
                                            </Popover>
                                        </Form.Item>
                                    </Col>
                                    <Col lg={8} md={8} sm={24} xs={24}>
                                        <Form.Item
                                        label={
                                            <>
                                                {t('quantityText')}
                                                <Tooltip placement="top" 
                                                title={t('saleQuantityTooltipText')}>
                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name='sale-qty'
                                        id="sale-qty"
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    if (value && value > maxQty) {
                                                        setTotalAmount(null);
                                                        setTotalPopover({
                                                            qty: false,
                                                            discount: false
                                                        });
                                                        return Promise.reject(
                                                            t('qtyExeedStockError') + ' (' + maxQty + ')'
                                                        );
                                                    }
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                        >
                                            <TotalShow
                                            isOpen={totalAmount ? totalPopover?.qty : false}
                                            totalAmount={totalAmount}
                                            >
                                            <InputNumber
                                                disabled={!addedItem?.itemId}
                                                placeholder={t('quantityText')}
                                                style={{ width: '100%' }}
                                                min={1}
                                                // max={maxQty}
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 
                                                        'Enter', 'ArrowLeft', 'ArrowRight'];
                                                    const isNumber = /^[1-9]\d*$/;
                                                    
                                                    if (
                                                        !allowedKeys.includes(e.key) &&
                                                        (e.key.length > 1 || !/^[0-9]$/.test(e.key) || 
                                                        (e.currentTarget.value === '' && e.key === '0'))
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={handleQtyChange}
                                                onFocus={() => {
                                                    setStockPopover({
                                                        itemId: null,
                                                        itemName: null
                                                    });
                                                    if (totalAmount) {
                                                        setTotalPopover({
                                                            qty: true,
                                                            discount: false
                                                        });
                                                    }
                                                }}
                                                onBlur={() => setTotalPopover({
                                                    qty: false,
                                                    discount: false
                                                })}
                                            />
                                            </TotalShow>
                                        </Form.Item>
                                    </Col>
                                    <Col lg={10} md={10} sm={24} xs={24}>
                                        <Form.Item
                                        label={
                                            <>
                                                {t('batchNoText')}
                                                <Tooltip placement="top" 
                                                title={t('saleBatchNoTooltipText')}>
                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name='sale-batch-no'
                                        id="sale-batch-no"
                                        >
                                            <Select
                                                disabled={!addedItem?.itemId}
                                                placeholder={t('batchNoText')}
                                                options={batchNos?.map(batch => ({
                                                    value: batch?.batchNo,
                                                    label: (
                                                        <span style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center', 
                                                            width: '100%',
                                                        }}>
                                                            <span style={{ 
                                                                overflow: 'hidden', 
                                                                textOverflow: 'ellipsis', 
                                                                whiteSpace: 'nowrap' 
                                                            }}>
                                                                {batch?.batchNo}{' '}
                                                                <span style={{ 
                                                                    fontSize: 12, 
                                                                    color: dayjs(batch?.expiry).isSame(dayjs(), 'month') && 
                                                                        dayjs(batch?.expiry).isSame(dayjs(), 'year') 
                                                                        ? 'red'
                                                                        : dayjs(batch?.expiry).isSame(dayjs().add(1, 'month'), 'month') 
                                                                        && dayjs(batch?.expiry).isSame(dayjs().add(1, 'year'), 'year') 
                                                                        ? 'orange'
                                                                        : 'green'
                                                                }}>
                                                                    {batch?.expiry && `(${dayjs(batch?.expiry).format('MMM YY')})`}
                                                                </span>
                                                            </span>
                                                            <span style={{ fontSize: 12, marginLeft: 'auto' }}>
                                                                {batch?.stock}
                                                            </span>
                                                        </span>
                                                    ),
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col lg={6} md={6} sm={24} xs={24}>
                                        <Form.Item
                                        label={
                                            <>
                                                {t('discountText')}
                                                <Tooltip placement="top" 
                                                title={t('saleDiscountTooltipText')}>
                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name='sale-discount'
                                        id="sale-discount"
                                        >
                                            <TotalShow
                                            isOpen={totalAmount ? totalPopover.discount : false}
                                            totalAmount={totalAmount}
                                            >
                                                <Input
                                                disabled={!addedItem?.qty || addedItem?.qty === 0}
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 
                                                        'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
                                                    const inputValue = e.currentTarget.value;
                                                    const lastChar = inputValue[inputValue.length - 1];
                                            
                                                    if (lastChar === '%' && e.key !== 'Backspace' && 
                                                        e.key !== 'Delete' && e.key !== 'ArrowLeft' && 
                                                        e.key !== 'ArrowRight') {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    if ((e.key === '.' && inputValue.includes('.')) || 
                                                        (e.key === '.' && lastChar === '%')) {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    if (
                                                        allowedKeys.includes(e.key) ||
                                                        (e.key === '.' && !inputValue.includes('.')) ||
                                                        (e.key >= '0' && e.key <= '9') ||
                                                        (e.key === '%' && !inputValue.includes('%'))
                                                    ) {
                                                        return;
                                                    }
                                                    e.preventDefault();
                                                }}
                                                placeholder={t('discountText')}
                                                onChange={(e) => {
                                                    const value = e.currentTarget.value;
                                                    handleItemDiscount(value);
                                                }}
                                                onFocus={() => {
                                                    if (totalAmount) {
                                                        setTotalPopover({
                                                            qty: false,
                                                            discount: true
                                                        });
                                                    }
                                                }}
                                                onBlur={() => setTotalPopover({
                                                    qty: false,
                                                    discount: false
                                                })}
                                                id="sale-discount-input"
                                                />
                                            </TotalShow>
                                        </Form.Item>
                                    </Col>
                                    <Col lg={24} md={24} sm={24} xs={24}>
                                        <Form.Item>
                                            <Button
                                            block
                                            color="primary"
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={addItem}
                                            >
                                                Add
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Form>
                </Col>
                <Col lg={14} md={14} sm={24} xs={24}>
                    <Card style={{ 
                        fontSize: 13,
                    }}
                    className="bill-card"
                    ref={invoiceRef}
                    hidden={addedItems.length === 0 && Object.entries(patientDetails)
                        .filter(([key]) => key !== "mobileCode")
                        .every(([_, value]) => 
                            !value || (typeof value === "object" && Object.values(value).every(v => !v))
                        )
                    }
                    >
                        <Watermark
                            content={isInvoiceGenerated ? undefined : [t('invoiceText').toLocaleUpperCase(), t('notGeneratedText')]}
                            font={{ fontSize: 15 }}
                            style={{
                                // width: '100%',
                                // overflow: 'auto',
                                // scrollbarWidth: 'thin',
                            }}
                        >
                            <Row gutter={[24, 4]} style={{ minWidth: '500px' }}>
                                <Col lg={14} md={14} sm={14} xs={14}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: '18%' }}>
                                                    {t('nameText')}
                                                </td>
                                                <td style={{ width: '2%' }}>:</td>
                                                <td style={{ width: '80%', wordBreak: 'break-word' }}>
                                                    {patientDetails?.fullName && (
                                                        <>
                                                            {(patientDetails?.titleName || '') + ' '}
                                                            {Utility.capitalizeWords(patientDetails?.fullName)}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ width: '18%' }}>
                                                    {t('mobileNoText')}
                                                </td>
                                                <td style={{ width: '2%' }}>:</td>
                                                <td style={{ width: '80%', wordBreak: 'break-word' }}>
                                                    {patientDetails?.mobileNo}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ width: '18%' }}>
                                                    {t('placeText')}
                                                </td>
                                                <td style={{ width: '2%' }}>:</td>
                                                <td style={{ width: '80%', wordBreak: 'break-word' }}>
                                                    {Utility.capitalizeWords(patientDetails?.place)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                                <Col lg={10} md={10} sm={10} xs={10}
                                style={{ textAlign: 'right' }}
                                >
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: '15%' }}>
                                                    {t('invoiceNoText')}
                                                </td>
                                                <td style={{ width: '2%' }}>:</td>
                                                <td style={{ width: '25%', wordBreak: 'break-word' }}>
                                                    {invoiceNo}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ width: '15%' }}>
                                                    {t('dateText')}
                                                </td>
                                                <td style={{ width: '2%' }}>:</td>
                                                <td style={{ width: '25%', wordBreak: 'break-word' }}>
                                                    {dayjs().format('DD/MM/YYYY')}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ width: '15%' }}>
                                                    {t('dateText')}
                                                </td>
                                                <td style={{ width: '2%' }}>:</td>
                                                <td style={{ width: '25%', wordBreak: 'break-word' }}>
                                                    {dayjs().format('DD/MM/YYYY')}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                            <Row gutter={0} style={{ minWidth: '500px' }}>
                                <Col lg={24} md={24} sm={24} xs={24}>
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{
                                                    width: '100%',
                                                    textAlign: 'center',
                                                    color: '#a1a1a1'
                                                }}>
                                                    {t('invoiceText').toUpperCase()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                            <Row gutter={0} style={{ minWidth: '500px' }}>
                                <Col lg={24} md={24} sm={24} xs={24}>
                                    {addedItems.length > 0 && (
                                        <table style={{ 
                                            width: '100%', 
                                            // minWidth: '400px',
                                            borderCollapse: 'collapse',
                                            borderTop: '0.5px solid #cbcbcb',
                                            borderBottom: '0.5px solid #cbcbcb'
                                        }}>
                                            <thead>
                                                <tr style={{ background: globalStore.darkTheme ? '#002140' : '#e8e8e8' }}>
                                                    <th style={{ 
                                                        width: '5%', 
                                                        padding: '4px', 
                                                        textAlign: 'left' 
                                                    }}>
                                                        #
                                                    </th>
                                                    <th style={{ 
                                                        width: '20%', 
                                                        padding: '4px', 
                                                        textAlign: 'left' 
                                                    }}>
                                                        {t('itemText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '15%', 
                                                        padding: '4px', 
                                                        textAlign: 'left' 
                                                    }}>
                                                        {t('batchText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '8%', 
                                                        padding: '4px', 
                                                        textAlign: 'left' 
                                                    }}>
                                                        {t('expiryText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '6%', 
                                                        padding: '4px', 
                                                        textAlign: 'right' 
                                                    }}>
                                                        {t('qtyText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '11%', 
                                                        padding: '4px', 
                                                        textAlign: 'right' 
                                                    }}>
                                                        {t('rateText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '12%', 
                                                        padding: '4px', 
                                                        textAlign: 'right' 
                                                    }}>
                                                        {t('amountText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '11%', 
                                                        padding: '4px', 
                                                        textAlign: 'right' 
                                                    }}>
                                                        {t('taxText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '5%', 
                                                        padding: '4px', 
                                                        textAlign: 'right' 
                                                    }}>
                                                        {t('discountText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '12%', 
                                                        padding: '4px', 
                                                        textAlign: 'right' 
                                                    }}>
                                                        {t('totalText')}
                                                    </th>
                                                    <th style={{ 
                                                        width: '12%', 
                                                        padding: '4px', 
                                                        textAlign: 'right' 
                                                    }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {addedItems?.map((item, itemIndex) => (
                                                    item?.batchNo?.map((batch, batchIndex) => (
                                                        <tr key={`${itemIndex}-${batchIndex}`}>
                                                            <td style={{ 
                                                                padding: '8px', 
                                                                fontSize: '12px' 
                                                            }}>
                                                                {billItemsSlNo++}
                                                            </td>
                                                            <td style={{ padding: '8px', fontSize: '12px' }}>
                                                                {item.itemName}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '8px', 
                                                                fontSize: '12px'
                                                            }}>
                                                                {batch.batch}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '8px', 
                                                                fontSize: '12px'
                                                            }}>
                                                                {batch.expiry}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '2px', 
                                                                fontSize: '12px', 
                                                                textAlign: 'right' 
                                                            }}
                                                            onDoubleClick={() => {
                                                                handleDoubleClick(
                                                                    itemIndex, 
                                                                    batchIndex, 
                                                                    'coveredStock', 
                                                                    batch.coveredStock
                                                                );
                                                            }}
                                                            >
                                                            {editCell?.itemIndex === itemIndex && 
                                                            editCell?.batchIndex === batchIndex && 
                                                            editCell?.field === 'coveredStock' ? (
                                                                <Form
                                                                form={editForm}
                                                                >
                                                                <Form.Item
                                                                id={"coveredStock-"+itemIndex+"-"+batchIndex}
                                                                name={"coveredStock-"+itemIndex+"-"+batchIndex}
                                                                style={{ margin: 0 }}
                                                                >
                                                                    <InputNumber
                                                                    autoFocus
                                                                    min={1}
                                                                    max={batch.stock || 1}
                                                                    onKeyDown={(e) => {
                                                                        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 
                                                                            'Enter', 'ArrowLeft', 'ArrowRight'];                                                                
                                                                        if (
                                                                            !allowedKeys.includes(e.key) &&
                                                                            (e.key.length > 1 || !/^[0-9]$/.test(e.key) || 
                                                                            (e.currentTarget.value === '' && e.key === '0'))
                                                                        ) {
                                                                            e.preventDefault();
                                                                        }
                                                                        if (e.key === 'Enter') {
                                                                            handleBlur(
                                                                                e,
                                                                                itemIndex, 
                                                                                batchIndex, 
                                                                                'coveredStock',
                                                                                batch.stock
                                                                            );
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        handleBlur(
                                                                            e,
                                                                            itemIndex, 
                                                                            batchIndex, 
                                                                            'coveredStock',
                                                                            batch.stock
                                                                        );
                                                                    }}
                                                                    value={tempValue}
                                                                    size="small"
                                                                    style={{ width: 60 }}
                                                                    onChange={(value) => setTempValue(value as number)}
                                                                    />
                                                                </Form.Item>
                                                                </Form>
                                                                ) : (
                                                                    batch.coveredStock
                                                                )}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '8px', 
                                                                fontSize: '12px',
                                                                textAlign: 'right'
                                                            }}>
                                                                {batch?.rate
                                                                    ?.toFixed(Constant.roundOffs.sale.amount)}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '8px', 
                                                                fontSize: '12px',
                                                                textAlign: 'right'
                                                            }}>
                                                                {batch?.totalAmount
                                                                    ?.toFixed(Constant.roundOffs.sale.amount)}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '8px', 
                                                                fontSize: '12px',
                                                                textAlign: 'right'
                                                            }}>
                                                                {batch?.taxAmount
                                                                    ?.toFixed(Constant.roundOffs.sale.tax)}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '2px', 
                                                                fontSize: '12px',
                                                                textAlign: 'right'
                                                            }}
                                                            onDoubleClick={() => {
                                                                handleDoubleClick(
                                                                    itemIndex, 
                                                                    batchIndex, 
                                                                    'discount', 
                                                                    batch.discountAmount
                                                                );
                                                            }}
                                                            >
                                                            {editCell?.itemIndex === itemIndex && 
                                                            editCell?.batchIndex === batchIndex && 
                                                            editCell?.field === 'discount' ? (
                                                                <Form
                                                                form={editForm}
                                                                >
                                                                <Form.Item
                                                                id={"discount-"+itemIndex+"-"+batchIndex}
                                                                name={"discount-"+itemIndex+"-"+batchIndex}
                                                                style={{ margin: 0 }}
                                                                >
                                                                    <Input
                                                                    autoFocus
                                                                    min={1}
                                                                    max={batch.stock || 1}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleBlur(
                                                                                e,
                                                                                itemIndex, 
                                                                                batchIndex, 
                                                                                'discount',
                                                                                batch.stock
                                                                            );
                                                                        }
                                                                        const allowedKeys = ['Backspace', 'Delete', 'Tab', 
                                                                            'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
                                                                        const inputValue = e.currentTarget.value;
                                                                        const lastChar = inputValue[inputValue.length - 1];
                                                                
                                                                        if (lastChar === '%' && e.key !== 'Backspace' && 
                                                                            e.key !== 'Delete' && e.key !== 'ArrowLeft' && 
                                                                            e.key !== 'ArrowRight') {
                                                                            e.preventDefault();
                                                                            return;
                                                                        }
                                                                        if ((e.key === '.' && inputValue.includes('.')) || 
                                                                            (e.key === '.' && lastChar === '%')) {
                                                                            e.preventDefault();
                                                                            return;
                                                                        }
                                                                        if (
                                                                            allowedKeys.includes(e.key) ||
                                                                            (e.key === '.' && !inputValue.includes('.')) ||
                                                                            (e.key >= '0' && e.key <= '9') ||
                                                                            (e.key === '%' && !inputValue.includes('%'))
                                                                        ) {
                                                                            return;
                                                                        }
                                                                        e.preventDefault();
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        handleBlur(
                                                                            e,
                                                                            itemIndex, 
                                                                            batchIndex, 
                                                                            'discount',
                                                                            batch.stock
                                                                        );
                                                                    }}
                                                                    value={tempValue}
                                                                    size="small"
                                                                    style={{ width: 60 }}
                                                                    onChange={(e) => setTempValue(e.currentTarget.value)}
                                                                    />
                                                                </Form.Item>
                                                                </Form>
                                                                ) : (
                                                                    batch?.discountAmount
                                                                        ?.toFixed(Constant.roundOffs.sale.discount) ||
                                                                    (0).toFixed(Constant.roundOffs.sale.discount)
                                                                )}
                                                            </td>
                                                            <td style={{ 
                                                                padding: '8px', 
                                                                fontSize: '12px',
                                                                textAlign: 'right'
                                                            }}>
                                                                {((batch.totalAmount - (batch?.discountAmount || 0)) + batch.taxAmount)
                                                                    ?.toFixed(Constant.roundOffs.sale.amount)}
                                                            </td>
                                                            <td>
                                                                <Popconfirm
                                                                    title={
                                                                        t('deleteText')
                                                                    }
                                                                    description={item.itemName +
                                                                        ' [' + batch.batch + ']'}
                                                                    onConfirm={() => deleteItem(itemIndex, batchIndex)}
                                                                    okText={t('yesText')}
                                                                    cancelText={t('noText')}
                                                                    placement="left"
                                                                    okType="danger"
                                                                >
                                                                    <Button
                                                                    size="small"
                                                                    type="text"
                                                                    icon={<DeleteOutlined />}
                                                                    danger
                                                                    />
                                                                </Popconfirm>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </Col>                
                            </Row>
                            <Row gutter={[24,0]} style={{ minWidth: '500px' }}>
                                <Col lg={16} md={16} sm={16} xs={16}>
                                    {/* <span style={{ fontSize: 12 }}>
                                        Mode of payment(s) : Cash
                                    </span> */}
                                </Col>
                                <Col lg={8} md={8} sm={8} xs={8}>
                                    <table style={{ 
                                        width: '100%', 
                                        // minWidth: '200px',
                                        textAlign: 'right',
                                        fontSize: 12
                                    }}>
                                        <tbody>
                                            <tr>
                                                <td style={{
                                                    fontWeight: 600
                                                }}>
                                                    {t('totalText')} :
                                                </td>
                                                <td style={{
                                                    fontWeight: 600
                                                }}>
                                                    {totals?.totalAmount
                                                        ?.toFixed(Constant.roundOffs.sale.amount)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{
                                                    fontWeight: 600
                                                }}>
                                                    {t('discountText')} :
                                                </td>
                                                <td style={{
                                                    fontWeight: 600
                                                }}>
                                                    {totals?.discountAmount
                                                        ?.toFixed(Constant.roundOffs.sale.discount)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{
                                                    fontWeight: 100
                                                }}>
                                                    {t('roundOffText')} :
                                                </td>
                                                <td style={{
                                                    fontWeight: 100
                                                }}>
                                                    {totals?.roundoffGrandTotal
                                                        ?.toFixed(Constant.roundOffs.sale.amount)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{
                                                    fontWeight: 600,
                                                    fontSize: 14
                                                }}>
                                                    {t('grandTotalText')} :
                                                </td>
                                                <td style={{
                                                    fontWeight: 600,
                                                    fontSize: 13
                                                }}>
                                                    {totals?.roundedGrandTotal
                                                        ?.toFixed(Constant.roundOffs.sale.amount)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <AmountToWords amount={
                                        totals?.roundedGrandTotal
                                        ?.toFixed(Constant.roundOffs.sale.amount)
                                    }
                                    />
                                </Col>
                            </Row>
                    </Watermark>
                    </Card>
                    <Card
                    hidden={addedItems.length === 0 && Object.entries(patientDetails)
                        .filter(([key]) => key !== "mobileCode")
                        .every(([_, value]) => 
                            !value || (typeof value === "object" && Object.values(value).every(v => !v))
                        )
                    }
                    >
                        <Row gutter={[16, 8]} >
                            <Col lg={8} md={8} sm={24} xs={24}>
                                <Button 
                                onClick={handleGenerateInvoice}
                                icon={<DiffOutlined />}
                                block
                                variant="outlined"
                                color="primary"
                                disabled={isInvoiceGenerated}
                                >
                                    {t('generateInvoiceText')}
                                </Button>
                            </Col>
                            <Col lg={8} md={8} sm={12} xs={12}>
                                <Button 
                                block
                                onClick={handlePreviewPdf}
                                icon={<FilePdfOutlined />}
                                type="dashed"
                                disabled={!isInvoiceGenerated}
                                >
                                    {t('previewText')}
                                </Button>
                            </Col>
                            <Col lg={8} md={8} sm={12} xs={12}>
                                <Button 
                                block
                                onClick={handlePrintPdf}
                                icon={<PrinterOutlined />}
                                disabled={!isInvoiceGenerated}
                                variant="outlined"
                                >
                                    {t('printText')}
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    <Card
                    hidden={addedItems.length === 0 && Object.entries(patientDetails)
                        .filter(([key]) => key !== "mobileCode")
                        .every(([_, value]) => 
                            !value || (typeof value === "object" && Object.values(value).every(v => !v))
                        )
                    }
                    >
                        <Form
                            form={paymentForm}
                            name='form-payment'
                            id='form-payment'
                            initialValues={{ remember: true }}
                            // onFinish={onFinish}
                            // onFinishFailed={onFinishFailed}
                            autoComplete="off"
                            onKeyDown={(event) => Utility.handleEnterKey(event, 'form-payment')}
                            layout="vertical"
                            disabled={!isInvoiceGenerated}
                        >
                            <Row gutter={[16, 4]} >
                                <Col lg={12} md={12} sm={10} xs={10}>
                                    <Form.Item
                                        label={
                                            <>
                                                {t('recieveAsText')}
                                                <Tooltip placement="top" 
                                                title={t('saleRecieveAsTooltipText')}>
                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name="sale-payment-mode"
                                        id="sale-payment-mode"
                                        rules={[
                                            {
                                                required: true,
                                                message: t('paymentModeEmpty'),
                                            },
                                        ]}
                                    >
                                        {masterData.paymentTypes.length > 0 ? (
                                            <Select
                                                options={masterData.paymentTypes.map((type: any) => ({
                                                    value: type?.type,
                                                    label: type?.name
                                                }))}
                                                onChange={handleDuplicatePaymentMode}
                                            />
                                        ) : (
                                            <Skeleton.Input block />
                                        )} 
                                    </Form.Item>
                                </Col>
                                <Col lg={10} md={10} sm={10} xs={10}>
                                    <Form.Item
                                        label={
                                            <>
                                                {t('amountReceivedText')}
                                                <Tooltip placement="top" 
                                                title={t('saleAmountReceivedTextTooltipText')}>
                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name="sale-payment-amount"
                                        id="sale-payment-amount"
                                        rules={[
                                            {
                                                required: true,
                                                message: t('amountEmpty'),
                                            },
                                        ]}
                                        initialValue={totals.roundedGrandTotal}
                                    >
                                            <InputNumber
                                                autoFocus
                                                placeholder={t('amountReceivedText')}
                                                style={{ width: '100%' }}
                                                min={0}
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 
                                                        'Enter', 'ArrowLeft', 'ArrowRight'];
                                                    const isNumber = /^[1-9]\d*$/;
                                                    
                                                    if (
                                                        !allowedKeys.includes(e.key) &&
                                                        (e.key.length > 1 || !/^[0-9]$/.test(e.key))
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                value={totals.roundedGrandTotal}
                                                prefix={Constant.currencySymbol || Constant.currencyShort}
                                                onChange={handlePaymentAamountChange}
                                            />   
                                    </Form.Item>
                                </Col>
                                <Col lg={2} md={2} sm={4} xs={4}>
                                    <Form.Item
                                    label=" "
                                    >
                                        <Button icon={<MinusOutlined />} 
                                        disabled
                                        block 
                                        variant="dashed"
                                        color="danger"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={24} md={24} sm={24} xs={24}>
                                    <Form.List name="form-sale-payment-list">
                                        {(fields, { add, remove }) => (
                                            <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <Row gutter={16} key={key}>
                                                    <Col lg={12} md={12} sm={10} xs={10}>
                                                        <Form.Item
                                                        label={
                                                            <>
                                                                {t('recieveAsText')}
                                                                <Tooltip placement="top" 
                                                                title={t('saleRecieveAsTooltipText')}>
                                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                                </Tooltip>
                                                            </>
                                                        }
                                                        {...restField}
                                                        name={[name, 'mode']}
                                                        rules={[{ 
                                                            required: true, 
                                                            message: t('paymentModeEmpty')
                                                        }]}
                                                        >
                                                            {masterData.paymentTypes.length > 0 ? (
                                                                <Select
                                                                    options={masterData.paymentTypes.map((type: any) => ({
                                                                        value: type?.type,
                                                                        label: type?.name
                                                                    }))}
                                                                    onChange={handleDuplicatePaymentMode}
                                                                />
                                                            ) : (
                                                                <Skeleton.Input block />
                                                            )}
                                                        </Form.Item>
                                                    </Col>
                                                    <Col lg={10} md={10} sm={10} xs={10}>
                                                        <Form.Item
                                                        label={
                                                            <>
                                                                {t('amountReceivedText')}
                                                                <Tooltip placement="top" 
                                                                title={t('saleAmountReceivedTextTooltipText')}>
                                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                                </Tooltip>
                                                            </>
                                                        }
                                                        {...restField}
                                                        name={[name, 'amount']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('amountEmpty'),
                                                            },
                                                        ]}
                                                        >
                                                            <InputNumber
                                                                autoFocus
                                                                placeholder={t('amountReceivedText')}
                                                                style={{ width: '100%' }}
                                                                min={0}
                                                                onKeyDown={(e) => {
                                                                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 
                                                                        'Enter', 'ArrowLeft', 'ArrowRight'];
                                                                    const isNumber = /^[1-9]\d*$/;
                                                                    
                                                                    if (
                                                                        !allowedKeys.includes(e.key) &&
                                                                        (e.key.length > 1 || !/^[0-9]$/.test(e.key))
                                                                    ) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                prefix={Constant.currencySymbol || Constant.currencyShort}
                                                                onChange={handlePaymentAamountChange}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col lg={2} md={2} sm={4} xs={4}>
                                                        <Form.Item
                                                        label=" "
                                                        >
                                                            <Button icon={<MinusOutlined />} 
                                                            onClick={() => remove(name)}
                                                            block 
                                                            variant="dashed"
                                                            color="danger"
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            ))}
                                            <Divider style={{ marginTop: '-5px' }} />
                                            <Row gutter={[16, 0]} justify='end' style={{ marginTop: '-10px' }}>
                                                <Col lg={24} md={24} sm={24} xs={24} style={{ textAlign: 'right' }}>
                                                    <Space style={{ marginTop: '-30px' }}>
                                                        <Title level={5} type="secondary">{t('totalText')} : </Title>
                                                        <Title level={5}>{paymentAmount.total.toFixed(Constant.roundOffs.sale.amount)}</Title>
                                                    </Space>
                                                </Col>
                                                <Col lg={24} md={24} sm={24} xs={24} style={{ textAlign: 'right' }}>
                                                    <Space style={{ marginTop: '-30px' }}>
                                                        <Title level={5} type="secondary">{t('balanceText')} : </Title>
                                                        <Title level={5}>{paymentAmount.balance.toFixed(Constant.roundOffs.sale.amount)}</Title>
                                                    </Space>
                                                </Col>
                                            </Row>
                                            <Divider style={{ marginTop: '0px' }} />
                                            <Row gutter={[16, 0]} >
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item>
                                                        <Button 
                                                        variant="dashed"
                                                        color="primary"
                                                        onClick={() => {
                                                            const index = fields.length || 0;
                                                            add({
                                                                mode: masterData.paymentTypes.length > 0
                                                                  ? masterData.paymentTypes[index+1].type
                                                                  : undefined,
                                                                amount: undefined,
                                                            })
                                                        }}
                                                        block icon={<PlusOutlined />}
                                                        >
                                                        {t('addAnotherPaymentText')}
                                                        </Button>
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                <Form.Item
                                                    id="sale-pay-button"
                                                    name="sale-pay-button"
                                                    validateStatus={paymentAmount.balance < 0 ? 'error' : undefined}
                                                    help={paymentAmount.balance < 0 ? t('payAmountGreaterMessage') : undefined}
                                                >
                                                    <Button 
                                                    color="primary" 
                                                    variant="solid"
                                                    block
                                                    // icon={<PaymentsIcon fontSize="small" />}
                                                    disabled={!isInvoiceGenerated || paymentAmount.balance < 0}
                                                    onClick={handlePay}
                                                    >
                                                        {t('payText')} <b>{(Constant.currencySymbol || Constant.currencyShort) + ' '}
                                                            {paymentAmount.total.toFixed(Constant.roundOffs.sale.amount)}</b>
                                                    </Button>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            </>
                                        )}
                                    </Form.List>
                                </Col>
                            </Row>
                        </Form>
                        <Mandatory marginTop={globalStore.screenSize.lg || globalStore.screenSize.lg ? 0 : 20} />
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default inject('globalStore')(observer(Sale));