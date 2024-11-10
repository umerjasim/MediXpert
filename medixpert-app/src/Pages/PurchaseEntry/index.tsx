import React from "react";
import { CopyOutlined, DeleteOutlined, DiffOutlined, InfoCircleOutlined, 
    MinusOutlined, PlusOutlined, 
    UploadOutlined} from "@ant-design/icons";
import { AutoComplete, Button, Card, Col, DatePicker, Form, Input, 
    InputNumber, Modal, Row, Select, Space, Switch, Table, TableProps, Tabs, 
    Tooltip, 
    Upload} from "antd";
import { createStyles } from "antd-style";
import { t } from "i18next";
import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";
import globalStore from "../../Store/globalStore";
import purchaseEntryStore from "../../Store/purchaseEntryStore";
import Notification from "../../Global/Notification";
import dayjs from "dayjs";
import Constant from "../../Global/Constant";
import { useTranslation } from "react-i18next";
import Utility from "../../Global/Utility";
import branchStore from "../../Store/branchStore";
import authStore from "../../Store/authStore";
import { Hidden } from "@mui/material";
import TextArea from "antd/es/input/TextArea";
import { UploadDragger } from "../../Components/UploadDragger";

const useStyle = createStyles(({ css, token }) => {
    const antCls = '.ant';
    return {
      customTable: css`
        ${antCls}-table {
          ${antCls}-table-container {
            ${antCls}-table-body,
            ${antCls}-table-content {
              scrollbar-width: thin;
              scrollbar-color: unset;
              scroll-behavior: smooth;
            }
          }
        }
      `,
    };
});

interface DataType {
    key: number;
    itemName: string;
    manufacturer: string;
    hsnNo: string | number;
    batchNo: string;
    rackNo?: string;
    expiry: string;
    pack: number;
    packUnit: string;
    qty: number;
    totalQty: number;
    freeQty?: number;
    totalFreeQty?: number;
    rate: number;
    totalCost: number;
    costPerQty: number;
    mrp: number;
    mrpPerQty: number;
    ptr?: number;
    discount?: string;
    totalAmount: number;
    tax: string;
    taxInclusive: boolean;
    taxOnFree: string;
    margin: number;
    outlet: string;
    discountAmount?: number;
}

interface ErrorFields {
    itemName: boolean;
    manufacturer: boolean;
    hsnNo: boolean;
    batchNo: boolean;
    expiry?: boolean;
    pack: boolean;
    packUnit: boolean;
    qty: boolean;
    // totalQty: boolean;
    rate: boolean;
    // totalCost: boolean;
    // costPerQty: boolean;
    mrp: boolean;
    // mrpPerQty: boolean;
    totalAmount: boolean;
    tax: boolean;
    outlet: boolean;
}

interface MasterData {
    items: any[];
    manufacturers: any[];
    qtyUnits: any[];
    taxes: any[];
    outlets: any[];
    suppliers: any[];
    purchaseFormTypes: any[];
    purchaseTypes: any[];
}

function PurchaseEntry() {

    const { styles } = useStyle();
    const [form1] = Form.useForm();
    const [form2] = Form.useForm();
    const user = authStore.currentUser;

    const [masterData, setMasterData] = useState<MasterData>({ 
        items: [],
        manufacturers: [],
        qtyUnits: [],
        taxes: [],
        outlets: [],
        suppliers: [],
        purchaseFormTypes: [],
        purchaseTypes: []
    });
    const [resultData, setResultData] = useState<DataType[]>([]);
    const [count, setCount] = useState<number>(1);
    const [rowData, setRowData] = useState<DataType[]>([{
        key: 0,
        itemName: '', 
        manufacturer: '', 
        hsnNo: '',
        batchNo: '',
        rackNo: '',
        expiry: '',
        pack: 0,
        packUnit: '',
        qty: 0,
        totalQty: 0,
        freeQty: 0,
        totalFreeQty: 0,
        rate: 0,
        totalCost: 0,
        costPerQty: 0,
        mrp: 0,
        mrpPerQty: 0,
        ptr: 0,
        discount: '',
        totalAmount: 0,
        tax: '',
        taxInclusive: false,
        taxOnFree: '',
        margin: 0,
        outlet: ''
    }]);
    const [errorFields, setErrorFields] = useState<ErrorFields[]>([]);
    const requiredFields: (keyof DataType)[] = [
        'itemName',
        'manufacturer',
        'hsnNo',
        'batchNo',
        'expiry',
        'pack',
        'packUnit',
        'qty',
        // 'totalQty',
        'rate',
        // 'totalCost',
        // 'costPerQty',
        'mrp',
        // 'mrpPerQty',
        'totalAmount',
        'tax',
        'outlet'
    ];
    const [mainOutlet, setMainOutlet] = useState<string>(user?.outlet as string);
    const [totalValues, setTotalValues] = useState({
        taxableAmount: 0,
        nonTaxableAmount: 0,
        addedDiscount: 0,
        extraDiscount: 0,
        totalAmount: 0,
        roundOff: 0,
        netInvoiceAmount: 0,
        totalTaxAmount: 0,
        totalAfterDiscount: 0,
        totalBeforeDiscount: 0,
        totalMrp: 0
    });
    const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>([]);
    const [selectedTaxes, setSelectedTaxes] = useState<any[]>([]);
    const [isDrug, setIsDrug] = useState<boolean[]>([]);
    const [expiryWarn, setExpiryWarn] = useState<boolean[]>([]);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>();
    const [grn, setGrn] = useState({
        no: null,
        copy: false
    });

    const { i18n } = useTranslation();
    useEffect(() => {
        i18n.changeLanguage(globalStore.language);
    }, [globalStore.language]);

    useEffect(() => {
        getMasterData();
    }, []);

    useEffect(() => {
        if (masterData?.purchaseFormTypes && masterData.purchaseFormTypes.length > 0) {
          form1.setFieldsValue({
            'purchase-entry-form-type': masterData.purchaseFormTypes[0]?._id,
          });
        }
        if (masterData?.purchaseTypes && masterData.purchaseTypes.length > 0) {
            form1.setFieldsValue({
              'purchase-entry-type': masterData.purchaseTypes[0]?._id,
            });
          }
      }, [masterData, form1]);

      useEffect(() => {
        const fieldsToUpdate: { [key: string]: number } = {
            'purchase-entry-taxable-amount': totalValues.taxableAmount,
            'purchase-entry-non-taxable-amount': totalValues.nonTaxableAmount,
            'purchase-entry-added-discount': totalValues.addedDiscount,
            'purchase-entry-extra-discount': totalValues.extraDiscount,
            'purchase-entry-total-amount': totalValues.totalAmount,
            'purchase-entry-round-off': totalValues.roundOff,
            'purchase-entry-net-invoice-amount': totalValues.netInvoiceAmount,
            'purchase-entry-total-tax-amount': totalValues.totalTaxAmount,
            'purchase-entry-total-mrp': totalValues.totalMrp,
        };
        // selectedTaxes.forEach((tax, index) => {
        //     fieldsToUpdate[`purchase-entry-amount-for-tax-${index}`] = 0;
        //     fieldsToUpdate[`purchase-entry-tax-split-tax-${index}`] = 0;
        // });
        form2.setFieldsValue(fieldsToUpdate);
    }, [selectedTaxes, totalValues, form2]);
    

    const getMasterData = async () => {
        globalStore.setLoading(true);
        try {
            await purchaseEntryStore.getMasterData();
            setMasterData(purchaseEntryStore);
            const data: DataType[] = [{
                key: 0,
                itemName: '', 
                manufacturer: '', 
                hsnNo: '',
                batchNo: '',
                rackNo: '',
                expiry: '',
                pack: 0,
                packUnit: '',
                qty: 0,
                totalQty: 0,
                freeQty: 0,
                totalFreeQty: 0,
                rate: 0,
                totalCost: 0,
                costPerQty: 0,
                mrp: 0,
                mrpPerQty: 0,
                ptr: 0,
                discount: '',
                totalAmount: 0,
                tax: '',
                taxInclusive: false,
                taxOnFree: '',
                margin: 0,
                outlet: ''
            }];
            setRowData(data);
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

    const handleEnterKey = (event: React.KeyboardEvent, dataIndex?: string, rowIndex?: number) => {
        const focusableElements = Array.from(
            document.querySelectorAll('input, select, textarea, button, [tabindex]:not([tabindex="-1"])')
        ) as HTMLElement[];
    
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            let previousIndex = currentIndex - 1;

            while (previousIndex >= 0) {
                const previousElement = focusableElements[previousIndex] as HTMLElement;
                if (
                    (previousElement instanceof HTMLInputElement || 
                     previousElement instanceof HTMLButtonElement || 
                     previousElement instanceof HTMLSelectElement || 
                     previousElement instanceof HTMLTextAreaElement) &&
                    !previousElement.disabled
                ) {
                    break;
                }
                previousIndex--;
            }

            if (previousIndex >= 0) {
                focusableElements[previousIndex].focus();
    
                const scrollableContainer = document.querySelector('.ant-table-body') as HTMLElement;
                if (scrollableContainer && focusableElements[previousIndex]) {
                    const elementRect = focusableElements[previousIndex].getBoundingClientRect();
                    const containerRect = scrollableContainer.getBoundingClientRect();
    
                    const extraScrollPadding = globalStore.screenSize.lg || globalStore.screenSize.md ?
                            120 : 40;
    
                    if (elementRect.left < containerRect.left) {
                        scrollableContainer.scrollLeft -= 
                            containerRect.left - elementRect.left + extraScrollPadding;
                    }
                }
            }
            return;
        }
        const errorSpan = document.getElementById(`error-${dataIndex}-${rowIndex}`) as HTMLElement;

        if (
            dataIndex &&
            requiredFields.includes(dataIndex as keyof DataType) &&
            !resultData[rowIndex as number]?.[dataIndex as keyof DataType]
        ) {
            errorSpan.innerText = t(`${dataIndex}Empty`);
            errorSpan.style.visibility = 'visible';

            setErrorFields((prevState = []) => {
                const updatedErrors = [...prevState];
                if (!updatedErrors[rowIndex as number]) {
                    updatedErrors[rowIndex as number] = {} as ErrorFields;
                }
                updatedErrors[rowIndex as number][dataIndex as keyof ErrorFields] = true;
                return updatedErrors;
            });

            if (dataIndex === 'expiry') {
                if (isDrug.length && !isDrug[rowIndex as number]) {
                    errorSpan.innerText = t('mandatoryFieldText');
                    errorSpan.style.visibility = 'hidden';

                    errorFields[rowIndex as number]['expiry' as keyof ErrorFields] = false;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else {
            errorSpan.innerText = t('mandatoryFieldText');
            errorSpan.style.visibility = 'hidden';

            setErrorFields((prevState = []) => {
                const updatedErrors = [...prevState];
                if (!updatedErrors[rowIndex as number]) {
                    updatedErrors[rowIndex as number] = {} as ErrorFields;
                }
                updatedErrors[rowIndex as number][dataIndex as keyof ErrorFields] = false;
                return updatedErrors;
            });
        }

        const selectElement = (event.currentTarget as HTMLElement).closest('.ant-select');
        const isDropdownOpen = selectElement && selectElement
                .classList.contains('ant-select-open');
        const switchElement = (event.currentTarget as HTMLElement)
                .querySelector('button[role="switch"]') as HTMLElement;

        if (event.key === 'Enter' && event.shiftKey) {
            if (selectElement) {
                event.preventDefault();
                const selectTrigger = selectElement
                    .querySelector('.ant-select-selector') as HTMLElement;
                if (selectTrigger) {
                    selectTrigger.click();
                }
                return;
            }
            if (switchElement) {
                if (switchElement.classList.contains('ant-switch-checked')) {
                    switchElement.classList.remove('ant-switch-checked');
                } else {
                    switchElement.classList.add('ant-switch-checked');
                }
                return;
            }
        }
    
        if (isDropdownOpen && (
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp' ||
            event.key === 'Enter'
        )) {
            return;
        }
    
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault();
            event.stopPropagation();
    
            let nextIndex = currentIndex + 1;

            while (nextIndex < focusableElements.length) {
                const nextElement = focusableElements[nextIndex] as HTMLElement;
                if (
                    (nextElement instanceof HTMLInputElement || 
                     nextElement instanceof HTMLButtonElement || 
                     nextElement instanceof HTMLSelectElement || 
                     nextElement instanceof HTMLTextAreaElement) && 
                    !nextElement.disabled
                ) {
                    break;
                }
                nextIndex++;
            }
    
            if (nextIndex < focusableElements.length) {
                focusableElements[nextIndex].focus();
    
                const scrollableContainer = document.querySelector('.ant-table-body') as HTMLElement;
                if (scrollableContainer && focusableElements[nextIndex]) {
                    const elementRect = focusableElements[nextIndex].getBoundingClientRect();
                    const containerRect = scrollableContainer.getBoundingClientRect();
    
                    const extraScrollPadding = globalStore.screenSize.lg || globalStore.screenSize.md ?
                            160 : 100;
    
                    if (elementRect.right > containerRect.right - 100 || 
                        elementRect.left < containerRect.left) {
                        scrollableContainer.scrollLeft += 
                            elementRect.right - containerRect.right + extraScrollPadding;
                    }
                }
            }
            
            if (currentIndex === focusableElements.length - 1 || dataIndex === 'outlet') {
                handleAddRow(rowIndex as number);
                focusableElements[currentIndex].click();
            }
        }
    };

    const handleValueChange = (index: number, dataIndex: string, value: any) => {
        const updatedRows = [...resultData];

        if (dataIndex !== 'outlet' && mainOutlet) {
            updatedRows[index] = { 
                ...updatedRows[index], 
                [dataIndex]: value,
                outlet: mainOutlet
            };
        } else {
            updatedRows[index] = { 
                ...updatedRows[index], 
                [dataIndex]: value 
            };
        }     
        setResultData(updatedRows);
    
        const currentRowErrors: any = errorFields[index] || {};
        const errorSpan = document.getElementById(`error-${dataIndex}-${index}`) as HTMLElement;
        let expiryWarn = false;

        if (dataIndex === 'expiry') {
            if (value) {
                const today = dayjs().startOf('day');
                const selectedDate = dayjs(value).startOf('day');
    
                if (selectedDate.isBefore(today)) {
                    currentRowErrors[dataIndex] = true;
                    expiryWarn = true;
                    if (errorSpan) {
                        errorSpan.style.color = 'orange';
                        errorSpan.innerText = t('pastExpiry');
                        errorSpan.style.visibility = 'visible';
                    }
                } else if (selectedDate.isSame(today)) {
                    currentRowErrors[dataIndex] = true;
                    expiryWarn = true;
                    if (errorSpan) {
                        errorSpan.style.color = 'orange';
                        errorSpan.innerText = t('expiryToday');
                        errorSpan.style.visibility = 'visible';
                    }
                } else {
                    currentRowErrors[dataIndex] = false;
                    expiryWarn = false;
                    if (errorSpan) {
                        errorSpan.style.color = 'red';
                        errorSpan.style.visibility = 'hidden';
                    }
                }
            } else {
                currentRowErrors[dataIndex] = true; 
                expiryWarn = false;
                if (errorSpan) {
                    errorSpan.style.color = 'red';
                    errorSpan.innerText = t(`${dataIndex}Empty`);
                    errorSpan.style.visibility = 'visible';
                }
            }
        } else if (requiredFields.includes(dataIndex as keyof DataType)) {
            if (value) {
                currentRowErrors[dataIndex] = false;
                expiryWarn = false;
                if (errorSpan) {
                    errorSpan.style.color = 'red';
                    errorSpan.innerText = t('mandatoryFieldText');
                    errorSpan.style.visibility = 'hidden';
                }
            } else {
                currentRowErrors[dataIndex] = true;
                expiryWarn = false;
                if (errorSpan) {
                    errorSpan.style.color = 'red';
                    errorSpan.innerText = t(`${dataIndex}Empty`);
                    errorSpan.style.visibility = 'visible';
                }
            }
        }
    
        const updatedErrors = [...errorFields];
        if (!updatedErrors[index]) {
            updatedErrors[index] = {} as ErrorFields;
        }

        updatedErrors[index] = { 
            ...updatedErrors[index], 
            [dataIndex]: currentRowErrors[dataIndex] 
        };
        setErrorFields(updatedErrors);
        setExpiryWarn((prev) => {
            const newArray = [...prev];
            newArray[index] = expiryWarn;
            return newArray;
        });
    };    

    const handleAddRow = (index: number) => {
        const isValid = validateRequiredFields(resultData);
    
        const updatedErrorFields = [...errorFields];
        if (!updatedErrorFields[index]) {
            updatedErrorFields[index] = {} as ErrorFields;
        }

        let hasErrors = false;
        let firstErrorField: keyof ErrorFields | null = null;

        Object.keys(updatedErrorFields[index]).forEach((key) => {
            if (!requiredFields.includes(key as keyof DataType)) {
                delete updatedErrorFields[index][key as keyof ErrorFields];
            }
        });

        requiredFields.forEach((fieldKey) => {
            const fieldValue = resultData[index]?.[fieldKey];

            const errorSpan = document
                .getElementById(`error-${fieldKey}-${index}`) as HTMLElement;   

            if (fieldKey === 'expiry' && isDrug.length && !isDrug[index]) {
                updatedErrorFields[index].expiry = false;
                if (errorSpan) {
                    errorSpan.style.visibility = 'hidden'; 
                }
                return;
            }

            if (!fieldValue) {
                updatedErrorFields[index][fieldKey as keyof ErrorFields] = true;
                if (errorSpan) {
                    errorSpan.innerText = t(`${fieldKey}Empty`);
                    errorSpan.style.visibility = 'visible';
                }
                hasErrors = true;

                if (!firstErrorField) {
                    firstErrorField = fieldKey as keyof ErrorFields;
                }
            } else {
                updatedErrorFields[index][fieldKey as keyof ErrorFields] = false;
                if (errorSpan) {
                    errorSpan.style.visibility = 'hidden';
                }
            }
        });

        setErrorFields(updatedErrorFields);

        if (resultData.length === 0 || hasErrors) {
            Notification.warn({
                message: t('warning'),
                description: t('fillRequiredFields')
            });

            if (firstErrorField) {
                const firstErrorInput = document
                    .getElementById(`input-${firstErrorField}-${rowData.length - 1}`) as HTMLInputElement;
                if (firstErrorInput) {
                    firstErrorInput.focus(); 
                    
                    const scrollableContainer = document
                        .querySelector('.ant-table-body') as HTMLElement;
                    if (scrollableContainer) {
                        const elementRect = firstErrorInput.getBoundingClientRect();
                        const containerRect = scrollableContainer.getBoundingClientRect();

                        const extraScrollPadding = globalStore.screenSize.lg || globalStore.screenSize.md ?
                                160 : 100;

                        if (elementRect.right > containerRect.right - 100 || 
                            elementRect.left < containerRect.left) {
                            scrollableContainer.scrollLeft += 
                                elementRect.right - containerRect.right + extraScrollPadding;
                        }
                    }
                }
            }
            return;
        }

        const newData: DataType = {
            key: count,
            itemName: '', 
            manufacturer: '', 
            hsnNo: '',
            batchNo: '',
            rackNo: '',
            expiry: '',
            pack: 0,
            packUnit: '',
            qty: 0,
            totalQty: 0,
            freeQty: 0,
            totalFreeQty: 0,
            rate: 0,
            totalCost: 0,
            costPerQty: 0,
            mrp: 0,
            mrpPerQty: 0,
            ptr: 0,
            discount: '',
            totalAmount: 0,
            tax: '',
            taxInclusive: false,
            taxOnFree: '',
            margin: 0,
            outlet: ''
        };
    
        setRowData([...rowData, newData]);
        setCount(count + 1);

        setTimeout(() => {
            const firstInput = document
                .getElementById(`input-itemName-${rowData.length}`) as HTMLInputElement;
            if (firstInput) {
                firstInput.focus();
    
                const scrollableContainer = document
                    .querySelector('.ant-table-body') as HTMLElement;
                if (scrollableContainer) {
                    const elementRect = firstInput.getBoundingClientRect();
                    const containerRect = scrollableContainer.getBoundingClientRect();
    
                    const extraScrollPadding = globalStore.screenSize.lg || globalStore.screenSize.md ?
                            160 : 100;
    
                    if (elementRect.right > containerRect.right - 100 || 
                            elementRect.left < containerRect.left) {
                        scrollableContainer.scrollLeft += 
                            elementRect.right - containerRect.right + extraScrollPadding;
                    }
                }
            }
        }, 0);
    };
    
    const handleRemoveRow = (index: number) => {
        if (rowData?.length === 1) {
            Notification.warn({
                message: t('warning'),
                description: t('cantDeleteLastRow')
            });
            return;
        }
        const updatedRowData = rowData.filter((_, i) => i !== index);
        setRowData(updatedRowData);
        setCount(count - 1);
    };

    const validateRequiredFields = (data: DataType[]): boolean => {
        let isValid = true;
    
        const initialErrorFields: any = {
            itemName: false,
            manufacturer: false,
            hsnNo: false,
            batchNo: false,
            expiry: false,
            pack: false,
            packUnit: false,
            qty: false,
            totalQty: false,
            rate: false,
            totalCost: false,
            costPerQty: false,
            mrp: false,
            mrpPerQty: false,
            totalAmount: false,
            tax: false,
            outlet: false
        };
    
        for (const item of data) {
            for (const field of requiredFields) {
                if (item[field] === undefined || 
                    item[field] === null || 
                    item[field] === '') {
                    initialErrorFields[field] = true;
                    isValid = false;
                }
            }
        }

        setErrorFields(initialErrorFields);
        return isValid;
    };

    const handleCalculations = (index: number, dataIndex: string, value: any) => {
        const updatedRows = [...resultData];
        updatedRows[index] = { ...updatedRows[index], [dataIndex]: value };
        setResultData(updatedRows);

        const foundObject: any = masterData?.qtyUnits?.
            find((unit: any) => unit?.name.toLowerCase() === 'number');

        const pack = updatedRows[index]?.pack;
        const packUnit = updatedRows[index]?.packUnit;
        const qty = updatedRows[index]?.qty;
        const rate = updatedRows[index]?.rate;
        const mrp = updatedRows[index]?.mrp;
        const tax = updatedRows[index]?.tax;
        const discount = updatedRows[index]?.discount;
        const taxInclusive = updatedRows[index]?.taxInclusive || false;
        const freeQty = updatedRows[index]?.freeQty || 0;
        // const totalFreeQty = updatedRows[index]?.totalFreeQty || 0;

        let totalQty: number = 0;
        let totalCost: number = 0;
        let totalCostNoRound: number = 0;
        let costPerQty: number = 0;
        let mrpPerQty: number = 0;
        let margin: number = 0;
        let ptr: number = 0;
        let totalAmount: number = 0;
        let calculatedTotalFreeQty: number = 0;

        if (pack && packUnit && qty) {
            totalQty = qty;
            if (foundObject?._id === packUnit) {
                totalQty = pack * qty;
            }
        }
        if (rate && qty) {
            totalCostNoRound = rate * qty;
            totalCost = Math.round(rate * qty * 
                        Math.pow(10, Constant.roundOffs.purchaseEntry.totalCost)) 
                        / Math.pow(10, Constant.roundOffs.purchaseEntry.totalCost);
        }
        if (totalCost !== 0 && totalQty !== 0) {
            costPerQty = Math.round((totalCost / totalQty) * 
                        Math.pow(10, Constant.roundOffs.purchaseEntry.costPerQty)) 
                        / Math.pow(10, Constant.roundOffs.purchaseEntry.costPerQty);
        }
        if (mrp && pack) {
            mrpPerQty = Math.round((mrp / pack) * 
                        Math.pow(10, Constant.roundOffs.purchaseEntry.mrpPerQty)) 
                        / Math.pow(10, Constant.roundOffs.purchaseEntry.mrpPerQty);
        }
        totalAmount = totalCost;
        let discountValue: number = 0;
        if (discount) {
            if (discount.includes('%')) {
                const percentage = parseFloat(discount.replace('%', '').trim());
                discountValue = Math.round(((percentage / 100) * totalCostNoRound) * 
                                Math.pow(10, Constant.roundOffs.purchaseEntry.discount)
                                / Math.pow(10, Constant.roundOffs.purchaseEntry.discount));
            } else {
                discountValue = typeof discount === 'string' ? parseFloat(discount) : discount;
            }
            totalAmount = Math.round((totalCostNoRound - discountValue) * 
                        Math.pow(10, Constant.roundOffs.purchaseEntry.totalAmount))
                        / Math.pow(10, Constant.roundOffs.purchaseEntry.totalAmount);
        }
        if (mrp && rate && qty) {
            if (discount) {
                margin = Math.round((((mrp + (discountValue / qty)) - rate) / rate * 100) *
                     Math.pow(10, Constant.roundOffs.purchaseEntry.margin))
                    / Math.pow(10, Constant.roundOffs.purchaseEntry.margin);
                margin = Math.abs(margin);
            } else {
                margin = Math.round(((mrp - rate) / rate * 100) * 
                    Math.pow(10, Constant.roundOffs.purchaseEntry.margin))
                    / Math.pow(10, Constant.roundOffs.purchaseEntry.margin);
            }
        }

        const taxObject: any = masterData?.taxes?.find((t: any) => t._id === tax);
        if (taxInclusive) {
            if (taxObject && taxObject?.value && mrp) {
                if (taxObject.type === 'percentage') {
                    ptr = Math.round((totalAmount / (1 + (taxObject.value / 100))) 
                        * Math.pow(10, Constant.roundOffs.purchaseEntry.ptr)) 
                        / Math.pow(10, Constant.roundOffs.purchaseEntry.ptr);
                } else {
                    ptr = Math.round((totalAmount - taxObject.value) 
                        * Math.pow(10, Constant.roundOffs.purchaseEntry.ptr)) 
                        / Math.pow(10, Constant.roundOffs.purchaseEntry.ptr);
                }
            }
        } else {
            if (taxObject && taxObject?.value && mrp) {
                if (taxObject.type === 'percentage') {
                    ptr = Math.round(((mrp - (mrp * (margin / 100))) / (1 + (taxObject.value / 100)))
                        * Math.pow(10, Constant.roundOffs.purchaseEntry.ptr)) 
                        / Math.pow(10, Constant.roundOffs.purchaseEntry.ptr);
                } else {
                    ptr = Math.round(((mrp - (mrp * (margin / 100))) - taxObject.value)
                        * Math.pow(10, Constant.roundOffs.purchaseEntry.ptr)) 
                        / Math.pow(10, Constant.roundOffs.purchaseEntry.ptr);
                }
            }
        }

        if (pack && (freeQty || freeQty !== 0)) {
            calculatedTotalFreeQty = freeQty * pack;
        }

        const findTax = masterData?.taxes.find(t => t._id === tax);
        const taxValue = findTax ? Number(findTax.value) : 0;
        const taxType = findTax ? findTax.type : 'amount';

        const finalUpdatedRows = [...updatedRows];
        finalUpdatedRows[index] = {
            ...finalUpdatedRows[index],
            totalQty: isNaN(totalQty) ? 0 : totalQty,
            totalCost: isNaN(totalCost) ? 0 : totalCost,
            costPerQty: isNaN(costPerQty) ? 0 : costPerQty,
            mrpPerQty: isNaN(mrpPerQty) ? 0 : mrpPerQty,
            margin: isNaN(margin) ? 0 : margin,
            ptr: isNaN(ptr) ? 0 : ptr,
            totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
            discountAmount: isNaN(discountValue) ? 0 : discountValue,
            totalFreeQty: isNaN(calculatedTotalFreeQty) || calculatedTotalFreeQty === 0 ? 
                undefined : calculatedTotalFreeQty
        };
        setResultData(finalUpdatedRows);
        handleTotalCalculation(
            finalUpdatedRows, 
            index, 
            taxInclusive,
            taxType
        );
    };

    const handleTotalCalculation = (
        updatedData: any, 
        index: number,
        taxInclusive: boolean,
        taxType: string
    ) => {
        if (!updatedData || updatedData.length === 0) {
            return; 
        }
    
        let taxableSum = 0;
        let nonTaxableSum = 0;
        let taxAmounts: { [key: string]: number } = {};
        let taxableAmountsPerRate: { [key: string]: number } = {};
        let totalDiscount = 0;
        let totalMrp = 0;
    
        updatedData.forEach((data: any) => {
            const amount = data?.totalAmount || 0;
            const taxRateId = data?.tax;
            const taxEntry = masterData?.taxes?.find(tax => tax._id === taxRateId);
            const taxRate = taxEntry ? taxEntry.value : 0;
            const discount = data?.discountAmount || 0;
            const mrp = data?.mrp || 0;
            const qty = data?.qty || 0;

            if (taxRate > 0) {
                if (taxInclusive) {
                    if (taxType === 'percentage') {
                        const preTaxAmount = Math.round((amount / (1 + taxRate / 100)) * 
                                            Math.pow(10, Constant.roundOffs.purchaseEntry.totalCost)) 
                                            / Math.pow(10, Constant.roundOffs.purchaseEntry.totalCost);
                        const taxAmount = Math.round((amount - preTaxAmount) * 
                                            Math.pow(10, Constant.roundOffs.purchaseEntry.tax)) 
                                            / Math.pow(10, Constant.roundOffs.purchaseEntry.tax);
                        taxableSum += preTaxAmount;
                        taxAmounts[taxRate] = (taxAmounts[taxRate] || 0) + taxAmount;
                        taxableAmountsPerRate[taxRate] = (taxableAmountsPerRate[taxRate] || 0) + preTaxAmount;
                    } else {
                        const preTaxAmount = Math.round((amount - taxRate) * 
                                            Math.pow(10, Constant.roundOffs.purchaseEntry.totalCost)) 
                                            / Math.pow(10, Constant.roundOffs.purchaseEntry.totalCost);
                        const taxAmount = taxRate;
                        taxableSum += preTaxAmount;
                        taxAmounts[taxRate] = (taxAmounts[taxRate] || 0) + taxAmount;
                        taxableAmountsPerRate[taxRate] = (taxableAmountsPerRate[taxRate] || 0) + preTaxAmount;
                    }
                } else {
                    taxableSum += amount;
                    let taxAmount = taxRate;
                    if (taxType === 'percentage') {
                        taxAmount = Math.round((amount * (taxRate / 100)) * 
                                    Math.pow(10, Constant.roundOffs.purchaseEntry.tax))
                                    / Math.pow(10, Constant.roundOffs.purchaseEntry.tax);
                    }
                    taxableAmountsPerRate[taxRate] = (taxableAmountsPerRate[taxRate] || 0) + amount;
                    taxAmounts[taxRate] = (taxAmounts[taxRate] || 0) + taxAmount;
                }
            } else {
                nonTaxableSum += amount;
            }
            totalDiscount += discount;
            totalMrp += (mrp * qty);
        });

        const totalSum = taxableSum + nonTaxableSum;

        let totalTax: number = 0;
        if (Object.keys(taxAmounts).length !== 0) {
            totalTax = Object.values(taxAmounts).reduce((acc, value) => acc + value, 0);
            totalTax = Math.round(totalTax * 
                    Math.pow(10, Constant.roundOffs.purchaseEntry.tax))
                    / Math.pow(10, Constant.roundOffs.purchaseEntry.tax);
        }

        const { roundedValue, roundoffValue } = Utility.roundTo(
            (totalSum + totalTax), 
            Constant.roundOffs.purchaseEntry.netInvoice
        );

        totalMrp = Math.round(totalMrp * 
            Math.pow(10, Constant.roundOffs.purchaseEntry.mrp))
            / Math.pow(10, Constant.roundOffs.purchaseEntry.mrp);
        
        setTotalValues((prevValues) => ({
            ...prevValues,
            totalAmount: totalSum + totalTax,
            taxableAmount: taxableSum,
            nonTaxableAmount: nonTaxableSum,
            addedDiscount: totalDiscount,
            netInvoiceAmount: roundedValue,
            roundOff: roundoffValue,
            totalTaxAmount: totalTax,
            totalMrp: totalMrp
        }));

        form2.setFieldsValue({
            'purchase-entry-total-amount': totalSum,
            'purchase-entry-taxable-amount': taxableSum,
            'purchase-entry-non-taxable-amount': nonTaxableSum,
            'purchase-entry-added-discount': totalDiscount,
            'purchase-entry-net-invoice-amount': roundedValue,
            'purchase-entry-round-off': roundoffValue,
            'purchase-entry-total-tax-amount': totalTax,
            'purchase-entry-total-mrp': totalMrp,
        });

        if (totalSum || totalSum === 0) {
            const updatedSelectedTaxes = [...selectedTaxIds];
            const taxRateId = updatedData[index]?.tax;
            updatedSelectedTaxes[index] = taxRateId || '0';

            const uniqueTaxIds = Array.from(new Set(updatedSelectedTaxes));
            setSelectedTaxIds(uniqueTaxIds);
            
            const filteredTaxes = masterData?.taxes?.filter(tax => uniqueTaxIds.includes(tax._id)) || [];
            
            const updatedTaxes = filteredTaxes.map((tax) => {
                const rate = tax?.value || 0;
                return {
                    ...tax,
                    taxAmount: taxAmounts[rate] || 0,
                    taxableAmountsPerRate: taxableAmountsPerRate[rate] || 0
                };
            });

            const fieldsToUpdate: { [key: string]: number } = {};
            updatedTaxes.forEach((tax, idx) => {
                const rate = tax?.value || 0;
                fieldsToUpdate[`purchase-entry-amount-for-tax-${idx}`] = taxableAmountsPerRate[rate] || 0;
                fieldsToUpdate[`purchase-entry-tax-split-tax-${idx}`] = taxAmounts[rate] || 0;
            });
    
            form2.setFieldsValue(fieldsToUpdate);
            setSelectedTaxes(updatedTaxes);
        }
    };    
    
    const handleOutletChange = (value: string) => {
        setMainOutlet(value)
    };

    const handleExpiryMandatory = (index: number, value: any) => {
        const selectedItem = masterData?.items.find((item: any) => item._id === value);
        const isDrug = selectedItem?.masterTypesData?.isDrug || false;
        setIsDrug((prev) => {
            const newArray = [...prev];
            newArray[index] = isDrug;
            return newArray;
        });
    };

    const handleExtraDiscount = (event: any) => {
        const value = event.currentTarget.value;
        let discountValue: number = 0;
        let totalAfterDiscount: number = totalValues.totalBeforeDiscount || totalValues.totalAmount; 
        let totalAmount: number = totalAfterDiscount;
        if (value) {
            if (value.includes('%')) {
                const percentage = parseFloat(value.replace('%', '').trim());
                discountValue = Math.round(((percentage / 100) * totalAfterDiscount) * 
                    Math.pow(10, Constant.roundOffs.purchaseEntry.discount)) 
                    / Math.pow(10, Constant.roundOffs.purchaseEntry.discount);
            } else {
                discountValue = typeof value === 'string' ? parseFloat(value) : value;
            }
            totalAmount = Math.round((totalAfterDiscount - discountValue) * 
                Math.pow(10, Constant.roundOffs.purchaseEntry.totalAmount)) 
                / Math.pow(10, Constant.roundOffs.purchaseEntry.totalAmount);
        }

        const { roundedValue, roundoffValue } = Utility.roundTo(
            totalAmount, 
            Constant.roundOffs.purchaseEntry.netInvoice
        );

        setTotalValues((prevValues) => ({
            ...prevValues,
            totalAmount,
            roundOff: roundoffValue,
            netInvoiceAmount: roundedValue,
            extraDiscount: isNaN(discountValue) ? 0 : discountValue,
            totalBeforeDiscount: totalValues.totalBeforeDiscount || totalValues.totalAmount,
            totalAfterDiscount: totalAmount
        }));
    };

    const handleAttachement = (newFiles: any[]) => {
        setUploadedFiles(newFiles);
    };
    
    const findMissingFields = (
        data: DataType[], 
        requiredFields: (keyof DataType)[]
    ): string[][] => {
        return data.map((item) => {
          const missingFields: string[] = [];
      
          requiredFields.forEach((field) => {
            if (!(field in item) || item[field] === undefined || item[field] === null) {
              missingFields.push(field);
            }
          });
      
          return missingFields;
        });
    };

    const savePurchaseEntry = async () => {
        try {
            globalStore.setLoading(true);
            setSaveLoading(true);
            const form1Values = await form1.validateFields();
            if (resultData.length === 0) {
                const firstElement = document.getElementById(`input-${requiredFields[0]}-0`) as HTMLElement;
                firstElement.focus();
                requiredFields.map((field) => {
                    const errorSpan = document.getElementById(`error-${field}-${0}`) as HTMLElement;
                    errorSpan.innerText = t(`${field}Empty`);
                    errorSpan.style.visibility = 'visible';

                    setErrorFields((prevState = []) => {
                        const updatedErrors = [...prevState];
                        if (!updatedErrors[0]) {
                            updatedErrors[0] = {} as ErrorFields;
                        }
                        updatedErrors[0][field as keyof ErrorFields] = true;
                        return updatedErrors;
                    });
                });
                
                Notification.error({
                    message: t('error'),
                    description: t('purchaseEntryNoItemsError')
                });
                return;
            } else {
                const missingFields = findMissingFields(resultData, requiredFields);
                if (
                    Array.isArray(missingFields) && 
                    missingFields.some((subArray) => Array.isArray(subArray) && subArray.length > 0)
                ) {
                    let focused = false;
                    missingFields.map((fields, index) => {
                        fields.map((field, i) => {
                            if (!focused) {
                                const firstElement = document
                                    .getElementById(`input-${field}-${index}`) as HTMLElement;
                                if (firstElement) {
                                    firstElement.focus();
                                    focused = true;
                                }
                            }

                            const errorSpan = document.getElementById(`error-${field}-${index}`) as HTMLElement;
                            if (errorSpan) {
                                errorSpan.innerText = t(`${field}Empty`);
                                errorSpan.style.visibility = 'visible';
                            }

                            setErrorFields((prevState = []) => {
                                const updatedErrors = [...prevState];
                                if (!updatedErrors[index]) {
                                    updatedErrors[index] = {} as ErrorFields;
                                }
                                updatedErrors[index][field as keyof ErrorFields] = true;
                                return updatedErrors;
                            });
                        });
                    });
                } else {
                    const form2Values = await form2.validateFields();
                    const result = await purchaseEntryStore.addPurchaseEntry({form1Values, resultData, form2Values});
                    setGrn({ no : result?.data?.grn, copy: false });
                    await form1.resetFields();
                    await form2.resetFields();
                    const newData: DataType = {
                        key: count,
                        itemName: '', 
                        manufacturer: '', 
                        hsnNo: '',
                        batchNo: '',
                        rackNo: '',
                        expiry: '',
                        pack: 0,
                        packUnit: '',
                        qty: 0,
                        totalQty: 0,
                        freeQty: 0,
                        totalFreeQty: 0,
                        rate: 0,
                        totalCost: 0,
                        costPerQty: 0,
                        mrp: 0,
                        mrpPerQty: 0,
                        ptr: 0,
                        discount: '',
                        totalAmount: 0,
                        tax: '',
                        taxInclusive: false,
                        taxOnFree: '',
                        margin: 0,
                        outlet: ''
                    };
                    setRowData([newData]);
                    setCount(1);

                    Notification.success({
                        description: t('success'),
                        message: t('savedSuccessfully')
                    });
                }
            }
        } catch (error: any) {
            if (error.errorFields && error.errorFields.length > 0) {
                form1.scrollToField(error.errorFields[0].name[0]);
                const fieldName = error.errorFields[0].name[0];
                const fieldElement = document.querySelector(`[id="form1-purchase-entry_${fieldName}"]`);
                if (fieldElement) {
                    (fieldElement as HTMLElement).focus();
                }
            }
        } finally {
            setTimeout(() => {
                globalStore.setLoading(false);
                setSaveLoading(false);
            }, 500)
        }
    };
    
    const columns: TableProps<DataType>['columns'] = [
        {
            title: t('itemNameText'),
            dataIndex: 'itemName',
            width: 200,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <Select
                                id={`input-itemName-${index}`}
                                placeholder={t('itemNameText')}
                                // onBlur={onSave}
                                style={{ width: '100%' }}
                                onChange={(value) => {
                                    handleValueChange(index, 'itemName', value);
                                    handleExpiryMandatory(index, value);
                                }}
                                onSelect={(value) => {
                                    handleValueChange(index, 'itemName', value);
                                    handleExpiryMandatory(index, value);
                                }}
                                showSearch
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'itemName', index);
                                    }
                                }}
                                optionFilterProp="label"
                                filterSort={(optionA, optionB) =>
                                    (optionA.label as string ?? '').toLowerCase()
                                        .localeCompare((optionB.label as string ?? '').toLowerCase())
                                }
                                options={masterData?.items.map((item: any) => ({
                                    value: item._id,
                                    label: item.name,
                                }))}
                                status={errorFields[index]?.itemName ? 'error' : undefined}
                                value={resultData[index]?.itemName !== undefined ? 
                                    resultData[index].itemName : undefined}
                            />
                        </div>
                        <span id={`error-itemName-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            },
        },
        {
            title: t('manufacturerText'),
            dataIndex: 'manufacturer',
            width: 200,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <AutoComplete
                                style={{ width: '100%' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'manufacturer', index);
                                    }
                                }}
                                id={`input-manufacturer-${index}`}
                                onChange={(value) => handleValueChange(index, 'manufacturer', value)}
                                onSelect={(value) => handleValueChange(index, 'manufacturer', value)}
                                options={
                                    masterData.manufacturers && masterData.manufacturers.length > 0 ? 
                                    masterData?.manufacturers.map((item: any) => ({
                                        value: item.name,
                                        key: item._id,
                                    })) : []
                                }
                                placeholder={t('manufacturerText')}
                                filterOption={(inputValue, option: any) =>
                                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                                status={errorFields[index]?.manufacturer ? 'error' : undefined}
                                value={resultData[index]?.manufacturer !== undefined ? 
                                    resultData[index].manufacturer : undefined}
                            />
                        </div>
                        <span id={`error-manufacturer-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('hsnNoText'),
            dataIndex: 'hsnNo',
            width: 180,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <Input
                                id={`input-hsnNo-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'hsnNo', index);
                                    }
                                }}
                                placeholder={t('hsnNoText')}
                                onChange={(e) => {
                                    handleValueChange(index, 'hsnNo', e.currentTarget.value);
                                }}
                                status={errorFields[index]?.hsnNo ? 'error' : undefined}
                                value={resultData[index]?.hsnNo !== undefined ? 
                                    resultData[index].hsnNo : undefined}
                            />
                        </div>
                        <span id={`error-hsnNo-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('batchNoText'),
            dataIndex: 'batchNo',
            width: 180,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <Input
                                id={`input-batchNo-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'batchNo', index);
                                    }
                                }}
                                status={errorFields[index]?.batchNo ? 'error' : undefined}
                                placeholder={t('batchNoText')}
                                onChange={(e) => {
                                    handleValueChange(index, 'batchNo', e.currentTarget.value);
                                }}
                                value={resultData[index]?.batchNo !== undefined ? 
                                    resultData[index].batchNo : undefined}
                            />
                        </div>
                        <span id={`error-batchNo-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('rackNoText'),
            dataIndex: 'rackNo',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>&nbsp;
                            <Input
                                id={`input-rackNo-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'rackNo', index);
                                    }
                                }}
                                status={undefined}
                                placeholder={t('rackNoText')}
                                onChange={(e) => {
                                    handleValueChange(index, 'rackNo', e.currentTarget.value);
                                }}
                                value={resultData[index]?.rackNo !== undefined ? 
                                    resultData[index].rackNo : undefined}
                            />
                        </div>
                        <span id={`error-rackNo-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('expiryText'),
            dataIndex: 'expiry',
            width: 180,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >
                                {(!isDrug.length || isDrug[index]) && (
                                    <>*</>
                                )}
                            </span>&nbsp;
                            <DatePicker
                                id={`input-expiry-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'expiry', index);
                                    }
                                }}
                                format={{
                                    format: Constant.dateFormat,
                                    type: 'mask',
                                }}
                                onChange={(date, dateString) => {
                                    handleValueChange(index, 'expiry', date);
                                }}
                                status={
                                    expiryWarn[index] ? 'warning' :
                                    errorFields[index]?.expiry ? 'error' : undefined
                                }
                                value={resultData[index]?.expiry !== undefined ? 
                                    dayjs(resultData[index].expiry) : undefined}
                            />
                        </div>
                        <span id={`error-expiry-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('packText'),
            dataIndex: 'pack',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                style={{ width: '100%' }}
                                id={`input-pack-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'pack', index);
                                    }
                                }}
                                placeholder={t('packText')}
                                min={0}
                                status={errorFields[index]?.pack ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'pack', value);
                                    handleCalculations(index, 'pack', value);
                                }}
                                value={resultData[index]?.pack !== undefined ? 
                                    resultData[index].pack : undefined}
                            />
                        </div>
                        <span id={`error-pack-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('packUnitText'),
            dataIndex: 'packUnit',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <Select
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'packUnit', index);
                                    }
                                }}
                                placeholder={t('packUnitText')}
                                id={`input-packUnit-${index}`}
                                style={{ width: '100%' }}
                                showSearch
                                onChange={(value) => {
                                    handleValueChange(index, 'packUnit', value);
                                    handleCalculations(index, 'packUnit', value);

                                }}
                                onSelect={(value) => {
                                    handleValueChange(index, 'packUnit', value);
                                    handleCalculations(index, 'packUnit', value);
                                }}
                                status={errorFields[index]?.packUnit ? 'error' : undefined}
                                value={resultData[index]?.packUnit !== undefined ? 
                                    resultData[index].packUnit : undefined}
                            >
                                {masterData.qtyUnits && masterData.qtyUnits.length > 0 && 
                                masterData?.qtyUnits.map((unit: any) => (
                                    <Select.Option key={unit._id} value={unit._id}>
                                        {unit.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <span id={`error-packUnit-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('quantityText'),
            dataIndex: 'qty',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                style={{ width: '100%' }}
                                id={`input-qty-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'qty', index);
                                    }
                                }}
                                min={0}
                                placeholder={t('quantityText')}
                                status={errorFields[index]?.qty ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'qty', value);
                                    handleCalculations(index, 'qty', value);
                                }}
                                value={resultData[index]?.qty !== undefined ? 
                                    resultData[index].qty : undefined}
                            />
                        </div>
                        <span id={`error-qty-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('totalQuantityText'),
            dataIndex: 'totalQty',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                disabled
                                style={{ width: '100%' }}
                                id={`input-totalQty-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'totalQty', index);
                                    }
                                }}
                                min={0}
                                placeholder={t('totalQuantityText')}
                                // status={errorFields[index]?.totalQty ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'totalQty', value);
                                    handleCalculations(index, 'totalQty', value);
                                }}
                                value={resultData[index]?.totalQty !== undefined ? 
                                    resultData[index].totalQty : undefined}
                            />
                        </div>
                        <span id={`error-totalQty-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('freeQuantityText'),
            dataIndex: 'freeQty',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>&nbsp;
                            <InputNumber
                                style={{ width: '100%' }}
                                id={`input-freeQty-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'freeQty', index);
                                    }
                                }}
                                placeholder={t('freeQuantityText')}
                                status={undefined}
                                min={0}
                                onChange={(value) => {
                                    handleValueChange(index, 'freeQty', value);
                                    handleCalculations(index, 'freeQty', value);
                                }}
                                value={resultData[index]?.freeQty !== undefined ? 
                                    resultData[index].freeQty : undefined}
                            />
                        </div>
                        <span id={`error-freeQty-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('totalFreeQuantityText'),
            dataIndex: 'totalFreeQty',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>&nbsp;
                            <InputNumber
                                style={{ width: '100%' }}
                                id={`input-totalFreeQty-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'totalFreeQty', index);
                                    }
                                }}
                                placeholder={t('totalFreeQuantityText')}
                                status={undefined}
                                min={0}
                                onChange={(value) => {
                                    handleValueChange(index, 'totalFreeQty', value);
                                    handleCalculations(index, 'totalFreeQty', value);
                                }}
                                value={resultData[index]?.totalFreeQty !== undefined ? 
                                    resultData[index].totalFreeQty : undefined}
                            />
                        </div>
                        <span id={`error-totalFreeQty-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('rateText'),
            dataIndex: 'rate',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                style={{ width: '100%' }}
                                id={`input-rate-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'rate', index);
                                    }
                                }}
                                placeholder={t('rateText')}
                                min={0}
                                status={errorFields[index]?.rate ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'rate', value);
                                    handleCalculations(index, 'rate', value);
                                }}
                                value={resultData[index]?.rate !== undefined ? 
                                    resultData[index].rate : undefined}
                                prefix={Constant.currencySymbol || Constant.currencyShort}
                            />
                        </div>
                        <span id={`error-rate-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('totalCostText'),
            dataIndex: 'totalCost',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                disabled
                                style={{ width: '100%' }}
                                id={`input-totalCost-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'totalCost', index);
                                    }
                                }}
                                placeholder={t('totalCostText')}
                                min={0}
                                // status={errorFields[index]?.totalCost ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'totalCost', value);
                                    handleCalculations(index, 'totalCost', value);
                                }}
                                value={resultData[index]?.totalCost !== undefined ? 
                                    resultData[index].totalCost : undefined}
                                prefix={Constant.currencySymbol || Constant.currencyShort}
                            />
                        </div>
                        <span id={`error-totalCost-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('costPerQuantityText'),
            dataIndex: 'costPerQty',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                disabled
                                style={{ width: '100%' }}
                                id={`input-costPerQty-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'costPerQty', index);
                                    }
                                }}
                                min={0}
                                placeholder={t('costPerQuantityText')}
                                // status={errorFields[index]?.costPerQty ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'costPerQty', value);
                                    handleCalculations(index, 'costPerQty', value);
                                }}
                                value={resultData[index]?.costPerQty !== undefined ? 
                                    resultData[index].costPerQty : undefined}
                                prefix={Constant.currencySymbol || Constant.currencyShort}
                            />
                        </div>
                        <span id={`error-costPerQty-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('mrpText'),
            dataIndex: 'mrp',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                style={{ width: '100%' }}
                                id={`input-mrp-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'mrp', index);
                                    }
                                }}
                                placeholder={t('mrpText')}
                                min={0}
                                status={errorFields[index]?.mrp ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'mrp', value);
                                    handleCalculations(index, 'mrp', value);
                                }}
                                value={resultData[index]?.mrp !== undefined ? 
                                    resultData[index].mrp : undefined}
                                prefix={Constant.currencySymbol || Constant.currencyShort}
                            />
                        </div>
                        <span id={`error-mrp-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('mrpPerQuantityText'),
            dataIndex: 'mrpPerQty',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                disabled
                                style={{ width: '100%' }}
                                id={`input-mrpPerQty-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'mrpPerQty', index);
                                    }
                                }}
                                placeholder={t('mrpPerQuantityText')}
                                min={0}
                                // status={errorFields[index]?.mrpPerQty ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'mrpPerQty', value);
                                    handleCalculations(index, 'mrpPerQty', value);
                                }}
                                value={resultData[index]?.mrpPerQty !== undefined ? 
                                    resultData[index].mrpPerQty : undefined}
                                prefix={Constant.currencySymbol || Constant.currencyShort}
                            />
                        </div>
                        <span id={`error-mrpPerQty-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('discountText'),
            dataIndex: 'discount',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>&nbsp;
                            <Input
                                id={`input-discount-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEnterKey(e, 'discount', index);
                                    }
                                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 
                                        'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', '%'];
                                    const inputValue = e.currentTarget.value;
                                    if (
                                        inputValue.includes('%') && 
                                        e.key !== 'Backspace' && 
                                        e.key !== 'Delete' &&
                                        e.key !== 'ArrowLeft' && 
                                        e.key !== 'ArrowRight'
                                    ) {
                                        e.preventDefault();
                                        return;
                                    }
                                    const lastChar = inputValue[inputValue.length - 1];
                                    if (e.key === '.' && lastChar === '%') {
                                        e.preventDefault();
                                        return;
                                    }
                                    if (e.key === '%' && lastChar === '.') {
                                        e.preventDefault();
                                        return;
                                    }
                                    if (
                                        (e.key === '.' && inputValue.includes('.')) || 
                                        (e.key === '.' && lastChar === '%')
                                    ) {
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
                                status={undefined}
                                placeholder={t('discountText')}
                                onChange={(e) => {
                                    handleValueChange(index, 'discount', e.currentTarget.value);
                                    handleCalculations(index, 'discount', e.currentTarget.value);
                                }}
                                value={resultData[index]?.discount !== undefined ? 
                                    resultData[index].discount : undefined}
                            />
                        </div>
                        <span id={`error-discount-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('totalAmountText'),
            dataIndex: 'totalAmount',
            width: 180,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <InputNumber
                                style={{ width: '100%' }}
                                id={`input-totalAmount-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'totalAmount', index);
                                    }
                                }}
                                placeholder={t('totalAmountText')}
                                min={0}
                                status={errorFields[index]?.totalAmount ? 'error' : undefined}
                                onChange={(value) => {
                                    handleValueChange(index, 'totalAmount', value);
                                    handleCalculations(index, 'totalAmount', value);
                                }}
                                value={resultData[index]?.totalAmount !== undefined ? 
                                    resultData[index].totalAmount : undefined}
                                prefix={Constant.currencySymbol || Constant.currencyShort}
                                />
                        </div>
                        <span id={`error-totalAmount-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('taxText'),
            dataIndex: 'tax',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <Select
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'tax', index);
                                    }
                                }}
                                placeholder={t('taxText')}
                                id={`input-tax-${index}`}
                                style={{ width: '100%' }}
                                showSearch
                                onChange={(value) => {
                                    handleValueChange(index, 'tax', value);
                                    handleCalculations(index, 'tax', value);
                                }}
                                onSelect={(value) => {
                                    handleValueChange(index, 'tax', value);
                                    handleCalculations(index, 'tax', value);
                                }}
                                status={errorFields[index]?.tax ? 'error' : undefined}
                                value={resultData[index]?.tax !== undefined ? 
                                    resultData[index].tax : undefined}
                                filterOption={(input, option) => {
                                    const optionName = option?.children?.[0];
                                    const optionValue = option?.children?.[1]
                                    return optionName?.toLowerCase().includes(input.toLowerCase()) ||
                                            optionValue?.toLowerCase().includes(input.toLowerCase());
                                }}
                            >
                                {masterData.taxes && masterData.taxes.length > 0 && 
                                masterData?.taxes.map((tax: any) => (
                                    <Select.Option key={tax._id} value={tax._id}>
                                        {tax.name}
                                        {tax.type === 'percentage'
                                            ? ` ( ${tax.value} % )`
                                            : tax.type === 'amount'
                                            ? ` ( ${tax.value} 
                                                ${Constant.currencySymbol || Constant.currencyShort} )`
                                            : ''}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <span id={`error-tax-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: `${t('taxInclusiveText')}?`,
            dataIndex: 'taxInclusive',
            width: 140,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleEnterKey(e, 'taxInclusive', index);
                            }
                        }}
                        >
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>&nbsp;
                            <Switch 
                                checkedChildren='Yes' 
                                unCheckedChildren='No'
                                onChange={(value) => {
                                    handleValueChange(index, 'taxInclusive', value);
                                    handleCalculations(index, 'taxInclusive', value);
                                }}
                                checked={resultData[index]?.taxInclusive}
                            />
                        </div>
                        <span id={`error-taxInclusive-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('taxOnFreeText'),
            dataIndex: 'taxOnFree',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>&nbsp;
                            <Select
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'taxOnFree', index);
                                    }
                                }}
                                placeholder={t('taxOnFreeText')}
                                id={`input-taxOnFree-${index}`}
                                style={{ width: '100%' }}
                                showSearch
                                onChange={(value) => {
                                    handleValueChange(index, 'taxOnFree', value);
                                    handleCalculations(index, 'taxOnFree', value);
                                }}
                                onSelect={(value) => handleValueChange(index, 'taxOnFree', value)}
                                status={undefined}
                                value={resultData[index]?.taxOnFree !== undefined ? 
                                    resultData[index].taxOnFree : undefined}
                            >
                                {masterData.taxes && masterData.taxes.length > 0 && 
                                masterData?.taxes.map((tax: any) => (
                                    <Select.Option key={tax._id} value={tax._id}>
                                        {tax.name}
                                        {tax.type === 'percentage' ?
                                        ' ( ' + tax.value + ' % )' : tax.type === 'amount' ? 
                                        ' ( ' + tax.value + ' ' + Constant.currencySymbol + ' )' || 
                                        ' ( ' + tax.value + ' ' + Constant.currencyShort + ' )'
                                        : ''}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <span id={`error-taxOnFree-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: `${t('marginText')} (%)`,
            dataIndex: 'margin',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>&nbsp;
                            <InputNumber
                                disabled
                                style={{ width: '100%' }}
                                id={`input-margin-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'margin', index);
                                    }
                                }}
                                placeholder={t('marginText')}
                                status={undefined}
                                onChange={(value) => handleValueChange(index, 'margin', value)}
                                value={resultData[index]?.margin !== undefined ? 
                                    resultData[index].margin : undefined}
                            />
                        </div>
                        <span id={`error-margin-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('ptrText'),
            dataIndex: 'ptr',
            width: 160,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>&nbsp;
                            <InputNumber
                                disabled
                                style={{ width: '100%' }}
                                id={`input-ptr-${index}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'ptr', index);
                                    }
                                }}
                                placeholder={t('ptrText')}
                                status={undefined}
                                onChange={(value) => handleValueChange(index, 'ptr', value)}
                                value={resultData[index]?.ptr !== undefined ? 
                                    resultData[index].ptr : undefined}
                            />
                        </div>
                        <span id={`error-ptr-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            title: t('outletText'),
            dataIndex: 'outlet',
            width: 200,
            render(value, record, index) {
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            >*</span>&nbsp;
                            <Select
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleEnterKey(e, 'outlet', index);
                                    }
                                }}
                                placeholder={t('outletText')}
                                id={`input-outlet-${index}`}
                                style={{ width: '100%' }}
                                showSearch
                                onChange={(value) => handleValueChange(index, 'outlet', value)}
                                onSelect={(value) => handleValueChange(index, 'outlet', value)}
                                status={errorFields[index]?.outlet ? 'error' : undefined}
                                value={resultData[index]?.outlet !== undefined ? 
                                    resultData[index].outlet : mainOutlet}
                            >
                                {masterData.outlets && masterData.outlets.length > 0 && 
                                masterData?.outlets.map((outlet: any) => (
                                    <Select.Option key={outlet._id} value={outlet._id}>
                                        {outlet.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <span id={`error-outlet-${index}`}
                        style={{ fontSize: 11, color: 'red', visibility: 'hidden' }}>
                            {t('mandatoryFieldText')}
                        </span>
                    </>
                );
            }
        },
        {
            // title: t('actionText'),
            dataIndex: 'action',
            width: 50,
            fixed: 'right',
            render(value, record, index) {
                const isLastRow = index === rowData.length - 1;
                return (
                    <>
                        <div style={{ display: 'flex' }}>
                            <span
                            style={{ color: 'red', marginTop: 5 }}
                            ></span>
                            <Space>
                                <Button 
                                size="small" 
                                variant="dashed"
                                color="danger"
                                onClick={() => handleRemoveRow(index)}
                                >
                                    <MinusOutlined />
                                </Button>
                                {isLastRow && (
                                    <Button 
                                        size="small" 
                                        variant="dashed"
                                        color="primary"
                                        onClick={() => handleAddRow(index)}
                                    >
                                        <PlusOutlined />
                                    </Button>
                                )}
                            </Space>
                        </div>
                        <span
                        style={{ fontSize: 11, color: 'transparent', visibility: 'hidden' }}>
                            .
                        </span>
                    </>
                );
            }
        }
    ];

    return (
        <>
            <Card>
                <Modal title={t('grnNumberText')}
                    open={grn.no ? true : false}
                    footer={[
                        <Button key="ok" type="primary" onClick={()=> setGrn({ ...grn, no: null })}>
                            OK
                        </Button>
                    ]}
                >
                    <div style={{ paddingTop: '10px' }}>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input defaultValue={grn?.no || undefined} 
                            disabled />
                            <Tooltip title={t('copyText')} >
                                <Button
                                icon={<CopyOutlined />}
                                onClick={()=> {
                                    navigator.clipboard.writeText(grn?.no || '12').then(() => {
                                        setGrn({ ...grn, copy: true });
                                        setTimeout(() => {
                                            setGrn({ ...grn, copy: false });
                                        }, 3000);
                                    });
                                }}
                                />
                            </Tooltip>
                        </Space.Compact>
                        {grn.copy ? (
                            <span style={{ marginTop: 20, fontSize: 13, color: 'gray' }}>
                                {t('copiedSuccessText')}
                            </span>
                        ) : (
                            <span style={{ marginTop: 20, fontSize: 13, color: 'transparent' }}>
                                .
                            </span> 
                        )}
                    </div>
                </Modal>
                <Tabs
                    style={{ marginTop: '10px' }}
                    type="card"
                    items={[
                        {
                            key: 'purchase-entry-tab-1',
                            label: t('purchaseEntryText'),
                            icon: <DiffOutlined />,
                            children: (
                                <>
                                    <Form
                                        form={form1}
                                        name='form1-purchase-entry'
                                        id='form1-purchase-entry'
                                        initialValues={{ remember: true }}
                                        // onFinish={onFinish}
                                        // onFinishFailed={onFinishFailed}
                                        autoComplete="off"
                                        onKeyDown={(event) => {
                                            Utility.handleEnterKey(event, 'form1-purchase-entry');
                                        }}
                                        layout="vertical"
                                    >
                                        <Row gutter={[16, 0]}>
                                        <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    initialValue={user?.branch}
                                                    label={
                                                    <>
                                                        {t('branchText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryBranchTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-branch'
                                                    id="purchase-entry-branch"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: t('branchesEmpty'),
                                                        },
                                                    ]}
                                                    >
                                                        <Select placeholder={t('branchText')} disabled>
                                                            {branchStore.branches && 
                                                            branchStore.branches.length > 0 &&
                                                            branchStore?.branches.map((branch: any) => (
                                                                <Select.Option key={branch._id} 
                                                                value={branch.Id}
                                                                >
                                                                    {branch.name}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                            </Col>
                                            <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    initialValue={user?.outlet}
                                                    label={
                                                    <>
                                                        {t('outletText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryOutletTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-outlet'
                                                    id="purchase-entry-outlet"
                                                    >
                                                        <Select 
                                                        autoFocus
                                                        placeholder={t('outletText')} 
                                                        showSearch
                                                        onChange={handleOutletChange}
                                                        onSelect={handleOutletChange}
                                                        >
                                                            {masterData.outlets && 
                                                            masterData.outlets.length > 0 &&
                                                            masterData.outlets.map((outlet: any) => (
                                                                <Select.Option key={outlet._id} 
                                                                value={outlet.Id}>
                                                                    {outlet.name}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                            </Col>
                                            <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    label={
                                                    <>
                                                        {t('supplierText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntrySupplierTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-supplier'
                                                    id="purchase-entry-supplier"
                                                    rules={[
                                                    {
                                                        required: true,
                                                        message: t('supplierEmpty'),
                                                    },
                                                    ]}
                                                    >
                                                        <Select placeholder={t('supplierText')} 
                                                        showSearch>
                                                            {masterData.suppliers && 
                                                            masterData.suppliers.length > 0 &&
                                                            masterData.suppliers.map((supplier: any) => (
                                                                <Select.Option key={supplier._id} 
                                                                value={supplier.Id}>
                                                                    {supplier.name}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                            </Col>
                                            <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    label={
                                                    <>
                                                        {t('formTypeText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryFormTypeTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-form-type'
                                                    id="purchase-entry-form-type"
                                                    rules={[
                                                    {
                                                        required: true,
                                                        message: t('formTypeEmpty'),
                                                    },
                                                    ]}
                                                >
                                                    <Select placeholder={t('formTypeText')} 
                                                    showSearch 
                                                    defaultActiveFirstOption
                                                    >
                                                        {masterData.purchaseFormTypes && 
                                                        masterData.purchaseFormTypes.length > 0 &&
                                                        masterData.purchaseFormTypes.map((form: any) => (
                                                            <Select.Option key={form._id} value={form._id}>
                                                                {form.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    label={
                                                    <>
                                                        {t('purchaseTypeText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryTypeTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-type'
                                                    id="purchase-entry-type"
                                                    rules={[
                                                    {
                                                        required: true,
                                                        message: t('purchaseTypeEmpty'),
                                                    },
                                                    ]}
                                                >
                                                    <Select placeholder={t('purchaseTypeText')} 
                                                    showSearch 
                                                    defaultActiveFirstOption
                                                    >
                                                        {masterData.purchaseTypes && 
                                                        masterData.purchaseTypes.length > 0 &&
                                                        masterData.purchaseTypes.map((type: any) => (
                                                            <Select.Option key={type._id} 
                                                            value={type._id}>
                                                                {type.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    label={
                                                    <>
                                                        {t('purchaseOrderNumberText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryOrderNumberTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-order-no'
                                                    id="purchase-entry-order-no"
                                                >
                                                    <Input placeholder={t('purchaseOrderNumberText')} />
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    label={
                                                    <>
                                                        {t('invoiceNumberText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryInvoiceNumberTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-invoice-no'
                                                    id="purchase-entry-invoice-no"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: t('invoiceNumberEmpty'),
                                                        },
                                                    ]}
                                                >
                                                    <Input placeholder={t('invoiceNumberText')} />
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    initialValue={dayjs()}
                                                    label={
                                                    <>
                                                        {t('invoiceDateText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryInvoiceDateTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-invoice-date'
                                                    id="purchase-entry-invoice-date"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: t('invoiceDateEmpty'),
                                                        },
                                                    ]}
                                                >
                                                    <DatePicker 
                                                    placeholder={t('invoiceDateText')}
                                                    style={{ width: '100%' }}
                                                    format={{
                                                        format: Constant.dateFormat,
                                                        type: 'mask',
                                                    }}
                                                    disabledDate={(current) => current > dayjs()}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col lg={8} md={8} sm={12} xs={12}>
                                                <Form.Item
                                                    initialValue={dayjs()}
                                                    label={
                                                    <>
                                                        {t('entryDateText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryDateTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-date'
                                                    id="purchase-entry-date"
                                                >
                                                    <DatePicker 
                                                    placeholder={t('entryDateText')}
                                                    style={{ width: '100%' }}
                                                    format={{
                                                        format: Constant.dateFormat,
                                                        type: 'mask',
                                                    }}
                                                    disabledDate={(current) => current > dayjs()}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <Table<DataType>
                                        scroll={{ x: 'max-content',  y: 55 * 6 }}
                                        className={styles.customTable}
                                        // components={{
                                        //     body: {
                                        //         cell: EditableCell
                                        //     }
                                        // }}
                                        rowClassName={() => 'editable-row'}
                                        // rowKey={(record, index) => index}
                                        bordered
                                        dataSource={rowData}
                                        columns={columns}
                                        pagination={false}
                                    />
                                    {/* <Button onClick={handleAddRow} style={{ marginTop: 16 }}>
                                        Add Row
                                    </Button> */}
                                    <Form
                                        form={form2}
                                        name='form2-purchase-entry'
                                        id='form2-purchase-entry'
                                        initialValues={{ remember: true }}
                                        // onFinish={onFinish}
                                        // onFinishFailed={onFinishFailed}
                                        autoComplete="off"
                                        onKeyDown={(event) => Utility.handleEnterKey(event, 'form-purchase-entry')}
                                        layout="vertical"
                                        style={{ marginTop: 20 }}
                                    >
                                        <Row gutter={[26, 0]}>
                                            <Col lg={12} md={12} sm={12} xs={12}>
                                            <Row gutter={[26, 0]}>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item
                                                        label={
                                                        <>
                                                            {t('taxableAmountText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryTaxableAmountTooltipText')}>
                                                                <InfoCircleOutlined
                                                                style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                        }
                                                        name='purchase-entry-taxable-amount'
                                                        id="purchase-entry-taxable-amount"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('taxableAmountEmpty'),
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber 
                                                        placeholder={t('taxableAmountText')}
                                                        style={{ width: '100%' }}
                                                        disabled
                                                        value={totalValues?.taxableAmount !== undefined ? 
                                                            totalValues?.taxableAmount : undefined}
                                                        prefix={totalValues?.taxableAmount !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item
                                                        label={
                                                        <>
                                                            {t('nonTaxableAmountText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryNonTaxableAmountTooltipText')}>
                                                                <InfoCircleOutlined
                                                                style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                        }
                                                        name='purchase-entry-non-taxable-amount'
                                                        id="purchase-entry-non-taxable-amount"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('nonTaxableAmountEmpty'),
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber 
                                                        disabled
                                                        placeholder={t('nonTaxableAmountText')}
                                                        style={{ width: '100%' }}
                                                        value={totalValues?.nonTaxableAmount !== undefined ? 
                                                            totalValues?.nonTaxableAmount : undefined}
                                                        prefix={totalValues?.nonTaxableAmount !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                {/* {rowData && rowData.length > 0 && (

                                                )} */}
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item
                                                        label={
                                                        <>
                                                            {t('addedDiscountText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryAddedDiscountTooltipText')}>
                                                                <InfoCircleOutlined
                                                                style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                        }
                                                        name='purchase-entry-added-discount'
                                                        id="purchase-entry-added-discount"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('addedDiscountEmpty'),
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber 
                                                        disabled
                                                        placeholder={t('addedDiscountText')}
                                                        style={{ width: '100%' }}
                                                        value={totalValues?.addedDiscount !== undefined ? 
                                                            totalValues?.addedDiscount : undefined}
                                                        prefix={totalValues?.addedDiscount !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item
                                                        label={
                                                        <>
                                                            {t('extraDiscountText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryExtraDiscountTooltipText')}>
                                                                <InfoCircleOutlined
                                                                style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                        }
                                                        name='purchase-entry-extra-discount'
                                                        id="purchase-entry-extra-discount"
                                                    >
                                                        <Input
                                                        // disabled 
                                                        placeholder={t('extraDiscountText')}
                                                        style={{ width: '100%' }}
                                                        value={totalValues?.extraDiscount !== undefined ? 
                                                            totalValues?.extraDiscount : undefined}
                                                        prefix={totalValues?.extraDiscount !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                        onKeyDown={(e) => {
                                                            const allowedKeys = ['Backspace', 'Delete', 'Tab', 
                                                                'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', '%'];
                                                            const inputValue = e.currentTarget.value;
                                                            if (
                                                                inputValue.includes('%') && 
                                                                e.key !== 'Backspace' && 
                                                                e.key !== 'Delete' &&
                                                                e.key !== 'ArrowLeft' && 
                                                                e.key !== 'ArrowRight'
                                                            ) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            const lastChar = inputValue[inputValue.length - 1];
                                                            if (e.key === '.' && lastChar === '%') {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (e.key === '%' && lastChar === '.') {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (
                                                                (e.key === '.' && inputValue.includes('.')) || 
                                                                (e.key === '.' && lastChar === '%')
                                                            ) {
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
                                                        onChange={handleExtraDiscount}
                                                    />
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item
                                                    label={
                                                        <>
                                                            {t('totalTaxText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryTotalTaxAmountTooltipText')}>
                                                                <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                    }
                                                    name='purchase-entry-total-tax-amount'
                                                    id='purchase-entry-total-tax-amount'
                                                    >
                                                    <InputNumber
                                                        disabled
                                                        placeholder={t('totalTaxText')}
                                                        style={{ width: '100%' }}
                                                        value={totalValues?.netInvoiceAmount !== undefined ? 
                                                            totalValues?.netInvoiceAmount : undefined}
                                                        prefix={totalValues?.totalTaxAmount !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                    />
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item
                                                        label={
                                                        <>
                                                            {t('totalAmountText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryTotalAmountTooltipText')}>
                                                                <InfoCircleOutlined
                                                                style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                        }
                                                        name='purchase-entry-total-amount'
                                                        id="purchase-entry-total-amount"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('totalAmountEmpty'),
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber 
                                                        disabled
                                                        placeholder={t('totalAmountText')}
                                                        style={{ width: '100%' }}
                                                        value={totalValues?.totalAmount !== undefined ? 
                                                            totalValues?.totalAmount : undefined}
                                                        prefix={totalValues?.totalAmount !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item
                                                        label={
                                                        <>
                                                            {t('totalMrpText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryTotalMrpTooltipText')}>
                                                                <InfoCircleOutlined
                                                                style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                        }
                                                        name='purchase-entry-total-mrp'
                                                        id="purchase-entry-total-mrp"
                                                    >
                                                        <InputNumber 
                                                        disabled
                                                        placeholder={t('totalMrpText')}
                                                        style={{ width: '100%' }}
                                                        value={totalValues?.totalMrp !== undefined ? 
                                                            totalValues?.totalMrp : undefined}
                                                        prefix={totalValues?.totalMrp !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                    <Form.Item
                                                        label={
                                                        <>
                                                            {t('roundOffText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryRoundOffTooltipText')}>
                                                                <InfoCircleOutlined
                                                                style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                        }
                                                        name='purchase-entry-round-off'
                                                        id="purchase-entry-round-off"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('roundOffEmpty'),
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber 
                                                        disabled
                                                        placeholder={t('roundOffText')}
                                                        style={{ width: '100%' }}
                                                        value={totalValues?.roundOff !== undefined ? 
                                                            totalValues?.roundOff : undefined}
                                                        prefix={totalValues?.roundOff !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={24} md={24} sm={24} xs={24}>
                                                    <Form.Item
                                                        label={
                                                        <>
                                                            {t('netInvoiceAmountText')}
                                                            <Tooltip placement="right" 
                                                            title={t('purchaseEntryNetInvoiceAmountTooltipText')}>
                                                                <InfoCircleOutlined
                                                                style={{ marginLeft: 8 }} />
                                                            </Tooltip>
                                                        </>
                                                        }
                                                        name='purchase-entry-net-invoice-amount'
                                                        id="purchase-entry-net-invoice-amount"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('netInvoiceAmountEmpty'),
                                                            },
                                                        ]}
                                                    >
                                                        <InputNumber 
                                                        disabled
                                                        placeholder={t('netInvoiceAmountText')}
                                                        style={{ width: '100%' }}
                                                        value={totalValues?.netInvoiceAmount !== undefined ? 
                                                            totalValues?.netInvoiceAmount : undefined}
                                                        prefix={totalValues?.netInvoiceAmount !== undefined ? 
                                                            (Constant.currencySymbol || Constant.currencyShort) : 
                                                            undefined}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                <Form.Item
                                                    label={
                                                    <>
                                                        {t('remarksText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryRemarksTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-remarks'
                                                    id="purchase-entry-remarks"
                                                >
                                                    <TextArea 
                                                    placeholder={t('remarksText')} 
                                                    rows={2}
                                                    style={{ height: 55, resize: 'none' }}
                                                    showCount
                                                    maxLength={200}
                                                    />
                                                </Form.Item>
                                                </Col>
                                                <Col lg={12} md={12} sm={24} xs={24}>
                                                <Form.Item
                                                    label={
                                                    <>
                                                        {t('uploadAttachementsText')}
                                                        <Tooltip placement="right" 
                                                        title={t('purchaseEntryUploadAttachementsTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </>
                                                    }
                                                    name='purchase-entry-upload-attachement'
                                                    id="purchase-entry-upload-attachement"
                                                >
                                                    <UploadDragger
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onFileChange={handleAttachement}
                                                    />
                                                </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={[16,0]} style={{ textAlign: 'right' }}>
                                                <Col lg={24} md={24} sm={24} xs={24}>
                                                    <Button
                                                    type="primary"
                                                    loading={saveLoading}
                                                    onClick={savePurchaseEntry}
                                                    >
                                                        {t('saveText')}
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col lg={12} md={12} sm={12} xs={12}>
                                        <Row gutter={[16, 0]}>
                                            {selectedTaxes && selectedTaxes.length > 0 ? (
                                            <>
                                            {selectedTaxes.map((tax, index) => (
                                                <React.Fragment key={tax._id}>
                                                    {tax.value !== 0 && (
                                                        <>
                                                        <Col lg={12} md={12} sm={24} xs={24} key={'amount-' + tax._id}>
                                                            <Form.Item
                                                            label={
                                                                <>
                                                                {`${t('amountForText')} ${tax.name} 
                                                                ( ${tax.value} 
                                                                ${tax.type === 'percentage' ? '%' : 
                                                                (Constant.currencySymbol || 
                                                                Constant.currencyShort)} )`}
                                                                <Tooltip placement="right" 
                                                                title={t('purchaseEntryAmountForTaxTooltipText')}>
                                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                                </Tooltip>
                                                                </>
                                                            }
                                                            name={'purchase-entry-amount-for-tax-' + index}
                                                            id={'purchase-entry-amount-for-tax-' + index}
                                                            >
                                                            <InputNumber
                                                                disabled
                                                                placeholder={tax.name}
                                                                style={{ width: '100%' }}
                                                                value={totalValues?.netInvoiceAmount !== undefined ? 
                                                                    totalValues?.netInvoiceAmount : undefined}
                                                                prefix={totalValues?.netInvoiceAmount !== undefined ? 
                                                                    (Constant.currencySymbol || Constant.currencyShort) : 
                                                                    undefined}
                                                            />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col lg={12} md={12} sm={24} xs={24} key={'tax-' + tax._id}>
                                                            <Form.Item
                                                            label={
                                                                <>
                                                                {`${tax.name} 
                                                                ( ${tax.value} 
                                                                ${tax.type === 'percentage' ? '%' : 
                                                                (Constant.currencySymbol || 
                                                                Constant.currencyShort)} )`}
                                                                <Tooltip placement="right" 
                                                                title={
                                                                    <>
                                                                    {t('purchaseEntryTaxSplitTaxTooltipText')}
                                                                    {tax.subTaxes && tax.subTaxes.length > 0 && (
                                                                        <>
                                                                        <br />
                                                                        <strong>{t('subTaxesText')}: </strong>
                                                                        {tax.subTaxes.map((subTax: any, i: number) => (
                                                                            <span key={subTax._id}>
                                                                            {`${subTax.name} 
                                                                                (${subTax.value}${tax.type === 'percentage' ? '%' : 
                                                                                (Constant.currencySymbol || 
                                                                                Constant.currencyShort)})`}
                                                                            {i < tax.subTaxes.length - 1 && ', '}
                                                                            </span>
                                                                        ))}
                                                                        </>
                                                                    )}
                                                                    </>
                                                                }>
                                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                                </Tooltip>
                                                                </>
                                                            }
                                                            name={'purchase-entry-tax-split-tax-' + index}
                                                            id={'purchase-entry-tax-split-tax-' + index}
                                                            >
                                                            <InputNumber
                                                                disabled
                                                                placeholder={tax.name}
                                                                style={{ width: '100%' }}
                                                                value={tax?.taxAmount || 0}
                                                                prefix={tax?.taxAmount !== undefined ? 
                                                                    (Constant.currencySymbol || Constant.currencyShort) : 
                                                                    undefined}
                                                            />
                                                            </Form.Item>
                                                        </Col>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            </>
                                            ) : (
                                                <div style={{
                                                    height: '300px',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'gray',
                                                    flexDirection: 'column',
                                                }}>
                                                    <div>
                                                        {t('selectedTaxSplitText')}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '11px'
                                                    }}>
                                                        {t('selectedTaxSplitSubText')}
                                                    </div>
                                                </div>
                                            )}
                                        </Row>
                                        </Col>
                                    </Row>
                                    </Form>
                                </>
                            )
                        }
                    ]}
                />
            </Card>
        </>
    );
}

export default inject('globalStore')(observer(PurchaseEntry));