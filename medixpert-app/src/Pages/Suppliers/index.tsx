import { Button, Card, Dropdown, TableProps, Tabs, Tag } from "antd";
import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";
import supplierStore from "../../Store/supplierStore";
import globalStore from "../../Store/globalStore";
import Notification from "../../Global/Notification";
import { t } from "i18next";
import AddSupplier from "./AddSupplier";
import { CheckOutlined, CloseOutlined, DownOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import branchStore from "../../Store/branchStore";
import DataTable from "../../Components/DataTable";
import moment from "moment";

interface DataType {
    key: string;
    name: string;
    gst: string | null;
    licence: string | null;
    mail: string | null;
    mobile: number | null;
    line1: string | null;
    line2: string | null;
    place: string | null;
    pin: number | null;
    branches: string[];
    active: boolean;
}

function Suppliers() {

    const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [supplierData, setSupplierData] = useState<DataType[]>([]);

    const { i18n } = useTranslation();
    useEffect(() => {
        i18n.changeLanguage(globalStore.language);
    }, [globalStore.language]);

    useEffect(() => {
        getSuppliers();
        // getBranches();
    }, []);

    const getSuppliers = async () => {
        globalStore.setLoading(true);
        try {
            await supplierStore.getSuppliers();
            const data: DataType[] = supplierStore.suppliers.map((supplier: any, index) => ({
                key: supplier?._id,
                name: supplier?.name,
                gst: supplier?.gst || null,
                licence: supplier?.licence || null,
                mail: supplier?.contact?.mail || null,
                mobile: supplier?.contact?.mobile || null,
                line1: supplier?.address?.line1 || null,
                line2: supplier?.address?.line2 || null,
                place: supplier?.address?.place || null,
                pin: supplier?.address?.pin || null,
                branches: supplier?.branchNames,
                active: supplier?.active
            }));
            setSupplierData(data);
            console.log(data)
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

    // const getBranches = async () => {
    //     globalStore.setLoading(true);
    //     try {
    //         await branchStore.getBranches();
    //     } catch (error) {
    //         Notification.error({
    //             message: t('error'),
    //             description: t('defaultErrorMessage')
    //         });
    //     } finally {
    //         setTimeout(() => {
    //             globalStore.setLoading(false);
    //         }, 500);
    //     }
    // };

    const handleSaveItem = async (values: any) => {
        setSaveLoading(true);
        globalStore.setLoading(true);
        try {
            await supplierStore.addSupplier(values);
            await getSuppliers();
            Notification.success({
                description: t('success'),
                message: t('savedSuccessfully')
            });
            setTimeout(() => {
                setAddModalOpen(false);
            }, 500);
        } catch (error) {
            Notification.error({
                description: t('error'),
                message: t('defaultErrorMessage')
            });
        } finally {
            setTimeout(() => {
                globalStore.setLoading(false);
                setSaveLoading(false);
            }, 500);
        }
    };

    const handleCancelItem = () => {
        setAddModalOpen(false);
    };

    const handleAddSupplier = () => {
        setAddModalOpen(true);
    };

    const columns: TableProps<DataType>['columns'] = [
        {
            title: t('nameText'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => {
                const aValue = a.name || ' ';
                const bValue = b.name || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(supplierData.map(supplier => supplier.name))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.name === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
            fixed: 'left'
        },
        {
            title: t('gstText'),
            dataIndex: 'gst',
            key: 'gst',
            sorter: (a, b) => {
                const aValue = a.gst || ' ';
                const bValue = b.gst || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(supplierData.map((supplier: any) => supplier.gst))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.gst === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
        },
        {
            title: t('licenceNoText'),
            dataIndex: 'licence',
            key: 'licence',
            sorter: (a, b) => {
                const aValue = a.licence || ' ';
                const bValue = b.licence || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(supplierData.map((supplier: any) => supplier.licence))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.licence === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
        },
        {
            title: t('contactText'),
            key: 'contact',
            children: [
                {
                    title: t('emailText'),
                    dataIndex: 'mail',
                    key: 'mail',
                    sorter: (a, b) => {
                        const aValue = a.mail || ' ';
                        const bValue = b.mail || ' ';
                        return aValue.localeCompare(bValue);
                    },
                    filters: Array.from(new Set(supplierData.map((supplier: any) => supplier.mail))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    onFilter: (value, record) => record.mail === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
                {
                    title: t('mobileNumberText'),
                    dataIndex: 'mobile',
                    key: 'mobile',
                    sorter: (a, b) => {
                        const aValue = a.mobile || 0;
                        const bValue = b.mobile || 0;
                        return aValue - bValue;
                    },
                    filters: Array.from(new Set(supplierData.map((supplier: any) => supplier.mobile))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    onFilter: (value, record) => record.mobile === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
            ]
        },
        {
            title: t('addressText'),
            key: 'address',
            children: [
                {
                    title: t('addressLine1Text'),
                    dataIndex: 'line1',
                    key: 'line1',
                    sorter: (a, b) => {
                        const aValue = a.line1 || ' ';
                        const bValue = b.line1 || ' ';
                        return aValue.localeCompare(bValue);
                    },
                    filters: Array.from(new Set(supplierData.map((supplier: any) => supplier.line1))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    onFilter: (value, record) => record.line1 === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
                {
                    title: t('addressLine2Text'),
                    dataIndex: 'line2',
                    key: 'line2',
                    sorter: (a, b) => {
                        const aValue = a.line2 || ' ';
                        const bValue = b.line2 || ' ';
                        return aValue.localeCompare(bValue);
                    },
                    filters: Array.from(new Set(supplierData.map((supplier: any) => supplier.line2))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    onFilter: (value, record) => record.line2 === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
                {
                    title: t('placeText'),
                    dataIndex: 'place',
                    key: 'place',
                    sorter: (a, b) => {
                        const aValue = a.place || ' ';
                        const bValue = b.place || ' ';
                        return aValue.localeCompare(bValue);
                    },
                    filters: Array.from(new Set(supplierData.map((supplier: any) => supplier.place))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    onFilter: (value, record) => record.place === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
                {
                    title: t('zipOrPinCodeText'),
                    dataIndex: 'pin',
                    key: 'pin',
                    sorter: (a, b) => {
                        const aValue = a.pin || 0;
                        const bValue = b.pin || 0;
                        return aValue - bValue;
                    },
                    filters: Array.from(new Set(supplierData.map((supplier: any) => supplier.pin))).map(type => ({
                        text: type, 
                        value: type
                    })),
                    onFilter: (value, record) => record.pin === value,
                    filterSearch: true,
                    width: 130,
                    ellipsis: true,
                },
            ]
        },
        {
            title: t('branchesText'),
            dataIndex: 'branches',
            key: 'branches',
            render: (value: any, record: any, index: number) => {
                if (Array.isArray(value) && value.length > 0) {
                    const branchNames = value.map((branch: any) => branch || ''); 
                    if (branchNames.length === 1) {
                        return <span>{branchNames[0]}</span>;
                    }
                    const items = branchNames.slice(1).map((branchName: string) => ({
                        label: branchName,
                        key: branchName,
                    }));
        
                    return (
                        <>
                            {/* <span>{branchNames[0]} <DownOutlined /></span> */}
                            <Dropdown 
                                menu={{ items }} 
                                trigger={['click']}
                            >
                                <a onClick={e => e.preventDefault()}>
                                    {branchNames[0]} <DownOutlined />
                                </a>
                            </Dropdown>
                        </>
                    );
                }
                return null;
            },
            filters: [
                ...Array.from(new Set(
                    supplierData.flatMap((supplier: any) => 
                        supplier.branches.map((branch: any) => branch)
                    )
                )).map(branchName => ({
                    text: branchName,
                    value: branchName
                }))
            ],
            onFilter: (value, record) => {
                const hasBranch = record.branches && record.branches.some((branch: any) => branch === value);
                return hasBranch;
            },
            width: 140,
            fixed: 'right'
        },
        {
            title: t('statusText'),
            dataIndex: 'active',
            key: 'active',
            sorter: (a, b) => {
                const aValue = a.active ? 1 : 0;
                const bValue = b.active ? 1 : 0;
                return aValue - bValue;
            },
            filters: [
                { text: t('activeText'), value: true },
                { text: t('inactiveText'), value: false },
            ],
            onFilter: (value, record) => record.active === value,
            filterSearch: true,
            width: 60,
            render: (value: any, record: any, index: number) => {
                if (value === 0 || value === 1) return null;
                let text = t('inactiveText');
                let icon = <CloseOutlined />;
                let color = 'error';
                if (value) {
                    text = t('activeText');
                    icon = <CheckOutlined />;
                    color = 'success';
                }
                return (
                    <>
                        <Tag color={color} icon={icon}>
                            {text}
                        </Tag>
                    </>
                )
            }
        },
    ];

    return (
        <>
            <AddSupplier 
            isModalOpen={addModalOpen}
            handleOk={handleSaveItem}
            handleCancel={handleCancelItem}
            loading={saveLoading}
            />
            <Card>
                <Button icon={<PlusOutlined />} type="link"
                onClick={handleAddSupplier}>
                    {t('addSupplierText')}
                </Button>
                <Tabs
                    style={{ marginTop: '10px' }}
                    type="card"
                    items={[
                        {
                            key: 'suppliers-tab-1',
                            label: t('suppliersText'),
                            icon: <TableOutlined />,
                            children: (
                                <>
                                    <DataTable
                                    data={supplierData}
                                    columns={columns}
                                    getItems={getSuppliers}
                                    exportFileName={`Suppliers-${moment().format('YYYY-MM-DD-hh-mm-ss')}`}
                                    />
                                </>
                            )
                        }
                    ]}
                />
            </Card>
        </>
    );
};

export default inject('globalStore')(observer(Suppliers));