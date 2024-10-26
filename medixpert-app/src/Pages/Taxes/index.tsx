import { inject, observer } from "mobx-react";
import AddTax from "./AddTax";
import { useEffect, useState } from "react";
import globalStore from "../../Store/globalStore";
import Notification from "../../Global/Notification";
import { t } from "i18next";
import { Button, Card, Dropdown, Switch, TableProps, Tabs, Tag } from "antd";
import { CheckOutlined, CloseOutlined, DownOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
import taxStore from "../../Store/taxStore";
import DataTable from "../../Components/DataTable";
import moment from "moment";
import Constant from "../../Global/Constant";
import { useTranslation } from "react-i18next";

interface SubDataType {
    key: string;
    name: string;
    value: number;
    type: string;
    active: number;
}

interface DataType {
    key: string;
    name: string;
    value: number;
    type: string;
    subTaxes: {}[];
    branches: string[];
    active: boolean;
    children?: SubDataType[];
}

function Taxes() {

    const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [taxData, setTaxData] = useState<DataType[]>([]);

    const { i18n } = useTranslation();
    useEffect(() => {
        i18n.changeLanguage(globalStore.language);
    }, [globalStore.language]);

    useEffect(() => {
        getTaxes();
    }, []);

    const getTaxes = async () => {
        globalStore.setLoading(true);
        try {
            await taxStore.getTaxes();
            const data: DataType[] = taxStore.taxes.map((tax: any, index) => ({
                key: tax?._id,
                name: tax?.name,
                value: tax?.value,
                type: tax?.type,
                subTaxes: tax?.subTaxes,
                branches: tax?.branchNames,
                active: tax?.active,
                children: tax?.subTaxes?.map((subTax: any) => ({
                    key: subTax?._id,
                    name: subTax?.name,
                    value: subTax?.value,
                    type: subTax?.type,
                    active: tax?.active ? 1 : 0,
                })),
            }));
            setTaxData(data);
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

    const handleSaveItem = async (values: any, form: any) => {
        setSaveLoading(true);
        globalStore.setLoading(true);
        const { 
            'tax-value': taxValue, 
            'tax-type': taxType, 
            'form-sub-tax-list': subTaxList 
        } = values;

        const errors: { name: (string | number)[], errors: string[] }[] = [];;

        if (Array.isArray(subTaxList) && subTaxList.length > 0) {
            const subTaxSum = subTaxList.reduce((sum, subTax) => sum + subTax.value, 0);

            if (subTaxSum !== taxValue) {
                errors.push({
                    name: ['tax-value'],
                    errors: [t('subTaxSumError')],
                });
                subTaxList.forEach((subTax, index) => {
                    errors.push({
                        name: ['form-sub-tax-list', index, 'value'],
                        errors: [t('subTaxSumError')],
                    });
                });
            }

            subTaxList.forEach((subTax, index) => {
                if (subTax.type !== taxType) {
                    errors.push({
                        name: ['form-sub-tax-list', index, 'type'],
                        errors: [t('subTaxTypeError')],
                    });
                }
            });
        }

        if (errors.length > 0) {
            form.setFields(errors);
            Notification.error({
                message: t('error'),
                description: t('subTaxError')
            });
            setTimeout(() => {
                setSaveLoading(false);
                globalStore.setLoading(false);
            }, 500);
            return false;
        }
 
        try {
            await taxStore.addTax(values);
            await getTaxes();
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
            filters: Array.from(new Set(taxData.map(tax => tax.name))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.name === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
            fixed: 'left',
        },
        {
            title: t('valueText'),
            dataIndex: 'value',
            key: 'value',
            sorter: (a, b) => {
                const aValue = a.value || 0;
                const bValue = b.value || 0;
                return aValue - bValue;
            },
            filters: Array.from(new Set(taxData.map((tax: any) => tax.value))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.value === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
            render: (value: any, record: any, index: number) => {
                let symbol = '';
                if (record.type === 'amount') symbol = Constant.currencySymbol || Constant.currencyShort;
                else if (record.type === 'percentage') symbol = '%';
                return (
                    <>
                        {value + ' ' + symbol}
                    </>
                )
            }
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
                    taxData.flatMap((tax: any) => 
                        tax.branches.map((branch: any) => branch)
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
            <AddTax
            isModalOpen={addModalOpen}
            handleOk={handleSaveItem}
            handleCancel={handleCancelItem}
            loading={saveLoading}
            />
            <Card>
                <Button icon={<PlusOutlined />} type="link"
                onClick={handleAddSupplier}>
                    {t('addTaxText')}
                </Button>
                <Tabs
                    style={{ marginTop: '10px' }}
                    type="card"
                    items={[
                        {
                            key: 'taxes-tab-1',
                            label: t('taxesText'),
                            icon: <TableOutlined />,
                            children: (
                                <>
                                    <DataTable
                                    data={taxData}
                                    columns={columns}
                                    getItems={getTaxes}
                                    exportFileName={`Taxes-${moment().format('YYYY-MM-DD-hh-mm-ss')}`}
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

export default inject('globalStore')(observer(Taxes));