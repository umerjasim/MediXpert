import { Button, Card, Col, DatePicker, Form, Popover, Row, Table, TableProps, Tabs, Tag, Tooltip, Typography } from "antd";
import { t } from "i18next";
import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import globalStore from "../../Store/globalStore";
import { CheckOutlined, CloseOutlined, FileDoneOutlined, InfoCircleOutlined } from "@ant-design/icons";
import DataTable from "../../Components/DataTable";
import moment from "moment";
import Notification from "../../Global/Notification";
import purchaseEntryStore from "../../Store/purchaseEntryStore";
import dayjs from "dayjs";
import Constant from "../../Global/Constant";
import RangePicker from "../../Components/RangePicker";
import Utility from "../../Global/Utility";
import ViewDetails from "./ViewDetails";

interface DataType {
    key: number;
    id: string;
    grn: string;
    supplier: string;
    invoiceNo: string;
    invoiceDate: string;
    invoiceAmount: number;
    createdOn: string;
    createdBy: string;
    action: string;
    approved: {
        status: boolean;
        on: string | null;
        by: string | null;
    },
    active: boolean;
    remarks: string | null;
    discount: number;
    totalMrp: number;
};

interface TaxType {
    name: string;
    type: string;
    value: number;
};

interface EntryItemsType {
    itemName: string;
    manufacturer: string;
    hsnNo: string;
    batchNo: string;
    rackNo: string | null;
    expiry: string | null;
    pack: number;
    packUnit: string;
    qty: number;
    totalQty: number;
    freeQty: number;
    totalFreeQty: number;
    rate: number;
    totalCost: number;
    costPerQty: number;
    mrp: number;
    mrpPerQty: number;
    discount: string | null | number;
    discountAmount: number;
    totalAmount: number;
    tax: TaxType;
    taxInclusive: boolean;
    taxForFree: TaxType | null;
    margin: number | null;
    ptr: number | null;
    outlet: string;
};

function ApprovePurchaseEntry() {

    const [filterForm] = Form.useForm();

    const [approveData, setApproveData] = useState<DataType[]>([]);
    const [dateRange, setDateRange] = useState<{ from: any, to: any}>({
        from: dayjs(),
        to: dayjs()
    });
    const [approvedPopoverId, setApprovedPopoverId] = useState<string | null>(null);
    const [approveLoading, setApproveLoading] = useState<string | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
    const [purchaseEntryItems, setPurchaseEntryItems] = useState<EntryItemsType[]>([]);

    const { i18n } = useTranslation();
    useEffect(() => {
        i18n.changeLanguage(globalStore.language);
    }, [globalStore.language]);

    useEffect(() => {
        getApprovePurchaseEntry(dayjs(), dayjs());
    }, []);

    const getApprovePurchaseEntry = async (from: any, to: any) => {
        globalStore.setLoading(true);
        const dateRange = { from, to };
        try {
            await purchaseEntryStore.getApprovePurchaseEntry(dateRange);
            console.log(purchaseEntryStore.approvePurchaseEntryData)
            const data: DataType[] = purchaseEntryStore.approvePurchaseEntryData
                .map((data: any, index) => ({
                    key: index,
                    id: data?._id,
                    grn: data?.grnNo,
                    supplier: data?.suppliersData?.name,
                    invoiceNo: data?.invoiceNo,
                    invoiceDate: dayjs(data?.invoiceDate).format('DD MMM, YYYY'),
                    invoiceAmount: data?.amountsData?.netInvoiceAmount,
                    createdOn: dayjs(data?.created?.date).format('DD MMM, YYYY'),
                    createdBy: data?.createdData?.name?.first + ' ' + data?.createdData?.name?.last,
                    action: data?._id,
                    approved: {
                        status: data?.approved?.status,
                        on: data?.approved?.status ? 
                            dayjs(data?.approved?.date).format('DD MMM, YYYY') : null,
                        by: data?.approved?.status ? 
                            data?.approvedData?.name?.first + ' ' + data?.approvedData?.name?.last : null,
                    },
                    active: data?.approved?.status || false,
                    remarks: data?.remarks,
                    discount: Number(data?.amountsData?.extraDiscount) + 
                        Number(data?.amountsData?.itemsDiscount),
                    totalMrp: data?.amountsData?.totalMrp
                }));
            setApproveData(data);
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

    const handleApprove = async (id: string) => {
        setApproveLoading(id);
        globalStore.setLoading(true);
        try {
            const data = { purchaseEntryId: id };
            await purchaseEntryStore.approvePurchaseEntry(data);
            await getApprovePurchaseEntry(dateRange?.from, dateRange?.to);
            Notification.success({
                message: t('success'),
                description: t('approvedSuccessfully')
            });
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('defaultErrorMessage')
            });
        } finally {
            setTimeout(() => {
                globalStore.setLoading(false);
                setApproveLoading(null);
            }, 500);
        }
    };

    const handleRangeSelection = (value: any) => {
        setDateRange({
            from: value[0],
            to: value[1]
        });
        getApprovePurchaseEntry(value[0], value[1]);
    };

    const handleClickApproved = (value: string) => {
        setApprovedPopoverId(value);
    };

    const handleShowDetailed = async (event: any, id: string) => {
        event.preventDefault();
        globalStore.setLoading(true);
        try {
            await purchaseEntryStore.getPurchaseEntryItems(id);
            const data: EntryItemsType[] = purchaseEntryStore.purchaseEntryItems
                .map((data: any, index) => ({
                    itemName: data?.itemsData?.name,
                    manufacturer: data?.manufacturerData?.name,
                    hsnNo: data?.hsnNo,
                    batchNo: data?.batchNo,
                    rackNo: data?.rackNo,
                    expiry: data?.expiry,
                    pack: data?.pack,
                    packUnit: data?.unitData?.name,
                    qty: data?.qty,
                    totalQty: data?.totalQty,
                    freeQty: data?.freeQty,
                    totalFreeQty: data?.totalFreeQty,
                    rate: data?.rate,
                    totalCost: data?.totalCost,
                    costPerQty: data?.costPerQty,
                    mrp: data?.mrp,
                    mrpPerQty: data?.mrpPerQty,
                    discount: data?.discount,
                    discountAmount: data?.discountAmount,
                    totalAmount: data?.totalAmount,
                    tax: {
                        name: data?.taxData?.name,
                        type: data?.taxData?.type,
                        value: data?.taxData?.value,
                    },
                    taxInclusive: data?.taxInclusive,
                    taxForFree: data?.freeTaxData ? {
                        name: data?.freeTaxData?.name,
                        type: data?.freeTaxData?.type,
                        value: data?.freeTaxData?.value,
                    } : null,
                    margin: data?.margin,
                    ptr: data?.ptr,
                    outlet: data?.outletData?.name
            }));
            setPurchaseEntryItems(data);
            setDetailsModalOpen(true);
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

    const columns: TableProps<DataType>['columns'] = [
        {
            title: t('grnNumberText'),
            dataIndex: 'grn',
            key: 'grn',
            sorter: (a, b) => {
                const aValue = a.grn || ' ';
                const bValue = b.grn || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(approveData.map(item => item.grn))).map(type => ({
                text: type, 
                value: type
            })),
            // onFilter: (value, record) => record.grn === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
            fixed: 'left',
            render(value, record, index) {
                return (
                    <Typography.Link href="/" onClick={(e) =>handleShowDetailed(e, record?.id)}>
                        {value}
                    </Typography.Link>
                );
            },
        },
        {
            title: t('supplierText'),
            dataIndex: 'supplier',
            key: 'supplier',
            sorter: (a, b) => {
                const aValue = a.supplier || ' ';
                const bValue = b.supplier || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(approveData.map(item => item.supplier))).map(type => ({
                text: type, 
                value: type
            })),
            // onFilter: (value, record) => record.supplier === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
        },
        {
            title: t('invoiceText'),
            key: 'invoice',
            children: [
                {
                    title: t('numberText'),
                    dataIndex: 'invoiceNo',
                    key: 'invoiceNo',
                    sorter: (a, b) => {
                        const aValue = a.invoiceNo || ' ';
                        const bValue = b.invoiceNo || ' ';
                        return aValue.localeCompare(bValue);
                    },
                    filters: Array.from(new Set(approveData.map(item => item.invoiceNo))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    // onFilter: (value, record) => record.invoiceNo === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
                {
                    title: t('dateText'),
                    dataIndex: 'invoiceDate',
                    key: 'invoiceDate',
                    sorter: (a, b) => {
                        const aValue = a.invoiceDate || ' ';
                        const bValue = b.invoiceDate || ' ';
                        return aValue.localeCompare(bValue);
                    },
                    filters: Array.from(new Set(approveData.map(item => item.invoiceDate))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    // onFilter: (value, record) => record.invoiceDate === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
                {
                    title: t('discountText'),
                    dataIndex: 'discount',
                    key: 'discount',
                    sorter: (a, b) => {
                        const aValue = a.discount || 0;
                        const bValue = b.discount || 0;
                        return aValue - bValue;
                    },
                    filters: Array.from(new Set(approveData.map(item => item.discount))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    // onFilter: (value, record) => record.discount === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                    render(value, record, index) {
                        return (
                            <>
                                {value?.toFixed(Constant.roundOffs.normal)}
                                {' '+Constant.currencySymbol || Constant.currencyShort}
                            </>
                        );
                    },
                },
                {
                    title: t('amountText'),
                    dataIndex: 'invoiceAmount',
                    key: 'invoiceAmount',
                    sorter: (a, b) => {
                        const aValue = a.invoiceAmount || 0;
                        const bValue = b.invoiceAmount || 0;
                        return aValue - bValue;
                    },
                    filters: Array.from(new Set(approveData.map(item => item.invoiceAmount))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    // onFilter: (value, record) => record.invoiceAmount === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                    render(value, record, index) {
                        return (
                            <>
                                {value?.toFixed(Constant.roundOffs.normal)}
                                {' '+Constant.currencySymbol || Constant.currencyShort}
                            </>
                        );
                    },
                },
            ]
        },
        {
            title: t('totalMrpText'),
            dataIndex: 'totalMrp',
            key: 'totalMrp',
            sorter: (a, b) => {
                const aValue = a.totalMrp || 0;
                const bValue = b.totalMrp || 0;
                return aValue - bValue;
            },
            filters: Array.from(new Set(approveData.map(item => item.totalMrp))).map(type => ({
                text: type, 
                value: type
            })),
            // onFilter: (value, record) => record.totalMrp === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
            render(value, record, index) {
                return (
                    <>
                        {value?.toFixed(Constant.roundOffs.normal)}
                        {' '+Constant.currencySymbol || Constant.currencyShort}
                    </>
                );
            },
        },
        {
            title: t('createdText'),
            key: 'created',
            children: [
                {
                    title: t('createdOnText'),
                    dataIndex: 'createdOn',
                    key: 'createdOn',
                    sorter: (a, b) => {
                        const aValue = a.createdOn || ' ';
                        const bValue = b.createdOn || ' ';
                        return aValue.localeCompare(bValue);
                    },
                    filters: Array.from(new Set(approveData.map(item => item.createdOn))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    // onFilter: (value, record) => record.createdOn === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
                {
                    title: t('createdByText'),
                    dataIndex: 'createdBy',
                    key: 'createdBy',
                    sorter: (a, b) => {
                        const aValue = a.createdBy || ' ';
                        const bValue = b.createdBy || ' ';
                        return aValue.localeCompare(bValue);
                    },
                    filters: Array.from(new Set(approveData.map(item => item.createdBy))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    // onFilter: (value, record) => record.createdBy === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                }
            ]
        },
        {
            title: t('remarksText'),
            dataIndex: 'remarks',
            key: 'remarks',
            sorter: (a, b) => {
                const aValue = a.remarks || ' ';
                const bValue = b.remarks || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(
                approveData
                    .map(item => item.remarks)
                    .filter((remark): remark is string => remark !== null)
            )).map(type => ({
                text: type,
                value: type
            })),
            // onFilter: (value, record) => record.remarks === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
        },
        {
            title: t('actionText'),
            dataIndex: 'action',
            key: 'action',
            width: 130,
            fixed: 'right',
            sorter: (a, b) => {
                const aValue = a?.approved?.status ? 1 : 0;
                const bValue = b?.approved?.status ? 1 : 0;
                return aValue - bValue;
            },
            filters: [
                { text: t('approvedText'), value: true },
                { text: t('notApprovedText'), value: false },
            ],
            // onFilter: (value, record) => record?.approved?.status === value,
            filterSearch: true,
            render(value, record, index) {
                if (record?.approved?.status) {
                    return (
                        <>
                            <Popover
                                key={'action' + String(index)}
                                content={record?.approved?.by}
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{record?.approved?.on}</span>
                                    <span onClick={() => setApprovedPopoverId(null)}>
                                        <CloseOutlined style={{ cursor: 'pointer', fontSize: '12px' }} />
                                    </span>
                                    </div>
                                }
                                open={approvedPopoverId === value}
                                trigger="click"
                                onOpenChange={() => handleClickApproved(value)}
                            >
                                <Tooltip title={t('showApproveDetailsTooltipText')}
                                placement="left"
                                >
                                    <Tag icon={<CheckOutlined />} 
                                    color="success"
                                    style={{ cursor: 'pointer' }}
                                    >
                                        {t('approvedText')}
                                    </Tag>
                                </Tooltip>
                           </Popover>
                        </>
                    );
                } else {
                    return (
                        <>
                            <Button
                            onClick={() => handleApprove(value)}
                            size="small"
                            color="primary"
                            variant="filled"
                            loading={approveLoading === value}
                            >
                                Approve
                            </Button>
                        </>
                    );
                }
            },
        },
    ];

    return (
        <>
            <ViewDetails
                isModalOpen={detailsModalOpen}
                handleOk={() => setDetailsModalOpen(false)}
                data={purchaseEntryItems}
            />
            <Card>
                <Tabs
                    style={{ marginTop: '10px' }}
                    type="card"
                    items={[
                        {
                            key: 'approve-purchase-entry-tab-1',
                            label: t('approvePurchaseEntryText'),
                            icon: <FileDoneOutlined />,
                            children: (
                                <>
                                    <div >
                                    <Form
                                        form={filterForm}
                                        name='form-filter'
                                        id='form-filter'
                                        initialValues={{ remember: true }}
                                        autoComplete="off"
                                        onKeyDown={(event) => {
                                            Utility.handleEnterKey(event, 'form-filter');
                                        }}
                                        layout="vertical"
                                    >
                                        <Row gutter={[0, 16]}>
                                            <Col lg={24} md={24} sm={24} xs={24}
                                            style={{ display: 'flex', justifyContent: 'flex-end' }}
                                            >
                                                <Form.Item
                                                label={
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        {t('dateRangeText')}
                                                        <Tooltip placement="right" 
                                                        title={t('dateRangeTooltipText')}>
                                                            <InfoCircleOutlined
                                                            style={{ marginLeft: 8 }} />
                                                        </Tooltip>
                                                    </div>
                                                }
                                                name='date-filter'
                                                id="date-filter"
                                                style={{ textAlign: 'left' }}
                                                >
                                                    <RangePicker
                                                    dateRange={dateRange}
                                                    handleRangeSelection={handleRangeSelection}
                                                    />  
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                    </div>
                                    <DataTable
                                    data={approveData}
                                    columns={columns}
                                    getItems={() => {
                                        getApprovePurchaseEntry(dateRange?.from, dateRange?.to);
                                    }}
                                    exportFileName={`Approve-Purchase-Entry-${moment()
                                        .format('YYYY-MM-DD-hh-mm-ss')}`}
                                    />
                                </>
                            )
                        }
                    ]}
                />
            </Card>
        </>
    );
}

export default inject('globalStore')(observer(ApprovePurchaseEntry));