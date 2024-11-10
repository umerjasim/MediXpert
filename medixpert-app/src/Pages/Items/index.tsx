import { BarsOutlined, CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, CloseOutlined, DollarOutlined, DownOutlined, DownloadOutlined, ExclamationCircleOutlined, PlusOutlined, PrinterOutlined, ReloadOutlined, SearchOutlined, StopOutlined, TableOutlined, WarningOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Checkbox, CheckboxProps, Col, Dropdown, DropdownProps, Input, List, MenuProps, Popover, Row, Table, TableProps, Tabs, Tag, Tooltip, Typography } from "antd";
import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";
import globalStore from "../../Store/globalStore";
import itemStore from "../../Store/itemStore";
import Notification from "../../Global/Notification";
import { t } from "i18next";
import AddItem from "./addItem";
import { createStyles } from 'antd-style';
import { ButtonGroup, IconButton } from "@mui/material";
import ReplayIcon from '@mui/icons-material/Replay';
import Constant from "../../Global/Constant";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import DataTable from "../../Components/DataTable";
import { useTranslation } from "react-i18next";
import moment from "moment";
import branchStore from "../../Store/branchStore";

type Remarks = {
    title: string;
    description: string;
}

interface DataType {
    key: string;
    masterName: string;
    name: string;
    genericName: string;
    typeName: string;
    categoryName: string;
    qtyUnitName: string;
    reorderQty: number;
    risk: string;
    riskColor: string;
    comments: string;
    isDrug: boolean;
    remarks: Remarks[];
    branches: string[];
    active: string;
}

function Items() {

    const { i18n } = useTranslation()

    const [loading, setLoading] = useState<boolean>(false);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
    const [itemData, setItemData] = useState<DataType[]>([]);
    const [remarksPopoverIndex, setRemarksPopoverIndex] = useState<string | null>(null);
    const [moreRemarksPopoverIndex, setMoreRemarksPopoverIndex] = useState<boolean>(false);

    const columns: TableProps<DataType>['columns'] = [
        {
            title: t('itemMasterTypeText'),
            dataIndex: 'masterName',
            key: 'masterName',
            sorter: (a, b) => {
                const aValue = a.masterName || ' ';
                const bValue = b.masterName || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(itemData.map(item => item.masterName))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.masterName === value,
            filterSearch: true,
            width: 130,
            ellipsis: true,
        },
        {
          title: t('itemNameText'),
          dataIndex: 'name',
          key: 'name',
          sorter: (a, b) => {
            const aValue = a.name || ' ';
            const bValue = b.name || ' ';
            return aValue.localeCompare(bValue);
          },
          filters: Array.from(new Set(itemData.map(item => item.name))).map(type => ({
            text: type, 
            value: type
          })),
          onFilter: (value, record) => record.name === value,
          filterSearch: true,
          fixed: 'left',
          width: 150,
          ellipsis: true,
        },
        {
            title: t('genericNameText'),
            dataIndex: 'genericName',
            key: 'genericName',
            sorter: (a, b) => {
                const aValue = a.genericName || ' ';
                const bValue = b.genericName || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(itemData.map(item => item.genericName))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.genericName === value,
            filterSearch: true,
            width: 140,
            ellipsis: true,
        },
        {
            title: t('itemTypeText'),
            dataIndex: 'typeName',
            key: 'typeName',
            sorter: (a, b) => {
                const aValue = a.typeName || ' ';
                const bValue = b.typeName || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(itemData.map(item => item.typeName))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.typeName === value,
            filterSearch: true,
            width: 120,
            ellipsis: true,
        },
        {
            title: t('itemCategoryText'),
            dataIndex: 'categoryName',
            key: 'categoryName',
            sorter: (a, b) => {
                const aValue = a.categoryName || ' ';
                const bValue = b.categoryName || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(itemData.map(item => item.categoryName))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.categoryName === value,
            filterSearch: true,
            width: 140,
            ellipsis: true,
        },
        {
            title: t('itemQtyUnitText'),
            dataIndex: 'qtyUnitName',
            key: 'qtyUnitName',
            sorter: (a, b) => {
                const aValue = a.qtyUnitName || ' ';
                const bValue = b.qtyUnitName || ' ';
                return aValue.localeCompare(bValue);
            },
            filters: Array.from(new Set(itemData.map(item => item.qtyUnitName))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.qtyUnitName === value,
            filterSearch: true,
            width: 100,
            ellipsis: true,
        },
        {
            title: t('itemReorderQtyText'),
            dataIndex: 'reorderQty',
            key: 'reorderQty',
            sorter: (a, b) => {
                const aValue = a.reorderQty || 0;
                const bValue = b.reorderQty || 0;
                return aValue - bValue;
            },
            filters: Array.from(new Set(itemData.map(item => item.reorderQty))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.reorderQty === value,
            filterSearch: true,
            width: 100,
            ellipsis: true,
        },
        {
            title: t('itemRiskText'),
            dataIndex: 'risk',
            key: 'risk',
            sorter: (a, b) => {
                const riskRank = (risk: any) => {
                  switch (risk) {
                    case 'Banned':
                      return 4;
                    case 'High':
                      return 3;
                    case 'Medium':
                      return 2;
                    case 'Normal':
                    default:
                      return 1;
                  }
                };
                return riskRank(a.risk) - riskRank(b.risk);
            },
            render: (text, record) => (
                <Tag color={record.riskColor}>
                {text === 'Banned' ? (
                    <><StopOutlined /> {text}</>
                    
                ) : text === 'High' ? (
                    <><CloseCircleOutlined /> {text}</>
                ) : text === 'Medium' ? (
                    <><ExclamationCircleOutlined /> {text}</>
                ) : (
                    <><CheckCircleOutlined /> {text}</>
                )}
                </Tag>
            ),
            filters: Array.from(new Set(itemData.map(item => item.risk))).map(type => ({
                text: type, 
                value: type
            })),
            onFilter: (value, record) => record.risk === value,
            filterSearch: true,
            width: 100,
            ellipsis: true,
        },
        {
            title: t('remarksText'),
            dataIndex: 'remarks',
            key: 'remarks',
            render: (value: any, record: any, index: number) => (
                <>
                  {value && value.length > 0 && value.slice(0, 2).map((val: any, i: number) => (
                    <Popover
                      key={index + '' + i}
                      content={val.description}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{val.title}</span>
                          <span onClick={closeRemarksPopover}>
                            <CloseOutlined style={{ cursor: 'pointer', fontSize: '12px' }} />
                          </span>
                        </div>
                      }
                      trigger="click"
                      open={remarksPopoverIndex === (index + '' + i)}
                      onOpenChange={() => handleClickRemarks(index, i)}
                    >
                      <Tag style={{ cursor: 'pointer' }}>
                        {val.title}
                      </Tag>
                    </Popover>
                  ))}
                  {value && value.length > 2 && (
                    <Popover
                      content={value.slice(2).map((val: any, i: number) => (
                        <>
                        {i !== 0 && i !== value.length && (
                            <br />
                        )}
                        <div key={index + '' + i}>
                          <strong>{val.title}</strong>: {val.description}
                        </div>
                        </>
                      ))}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{t('moreRemarksText')}</span>
                          <span onClick={handleCloseMoreRemarks}>
                            <CloseOutlined style={{ cursor: 'pointer', fontSize: '12px' }} />
                          </span>
                        </div>
                      }
                      trigger="click"
                      open={moreRemarksPopoverIndex}
                      onOpenChange={handleClickMoreRemarks}
                    >
                      <Tag style={{ cursor: 'pointer' }}>...</Tag>
                    </Popover>
                  )}
                </>
            ),
            width: 140,
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
                    itemData.flatMap((item: any) => 
                        item.branches.map((branch: any) => branch)
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

    useEffect(() => {
        getItems();
        getItemMasterData();
        // getBranches();
    }, []);

    const getItems = async () => {
        globalStore.setLoading(true);
        try {
            await itemStore.getItems();
            console.log( itemStore.items)
            const data: DataType[] = itemStore.items.map((item: any, index) => ({
                key: item?._id,
                masterName: item?.masterName,
                name: item?.name,
                genericName: item?.genericName,
                typeName: item?.typeName,
                categoryName: item?.categoryName,
                qtyUnitName: item?.qtyUnitName,
                reorderQty: item?.reorderQty,
                risk: item?.riskName,
                riskColor: item?.riskColor,
                comments: item?.comments,
                isDrug: item?.isDrug,
                remarks: item?.remarks,
                branches: item?.branchNames,
                active: item?.active
            }));
            setItemData(data);
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

    const getItemMasterData = async () => {
        globalStore.setLoading(true);
        try {
            await itemStore.getMasterData();
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

    const handleAddItem = async () => {
        await getItemMasterData();
        setAddModalOpen(true);
    };

    const handleSaveItem = async (values: any) => {
        setSaveLoading(true);
        globalStore.setLoading(true);
        try {
            await itemStore.addItem(values);
            await getItems();
            Notification.success({
                message: t('success'),
                description: t('savedSuccessfully')
            });
            setTimeout(() => {
                setAddModalOpen(false);
            }, 500);
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('defaultErrorMessage')
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

    const handleClickRemarks = (index: number, i: number) => {
        setRemarksPopoverIndex(remarksPopoverIndex === (index+''+i) ? null : index+''+i);
    };

    const closeRemarksPopover = () => {
        setRemarksPopoverIndex(null);
    };

    const handleClickMoreRemarks = () => {
        setMoreRemarksPopoverIndex(true);
    };

    const handleCloseMoreRemarks = () => {
        setMoreRemarksPopoverIndex(false);
    };
    
    return (
        <>
            <AddItem 
            isModalOpen={addModalOpen}
            handleOk={handleSaveItem}
            handleCancel={handleCancelItem}
            loading={saveLoading}
            />
            <Card > 
            <Button icon={<PlusOutlined />} type="link"
            onClick={handleAddItem}>
                {t('addItemText')}
            </Button>
            <Tabs
                style={{ marginTop: '10px' }}
                type="card"
                items={[
                    {
                        key: 'items-tab-1',
                        label: t('itemsText'),
                        icon: <TableOutlined />,
                        children: (
                            <>
                                <DataTable
                                data={itemData}
                                columns={columns}
                                getItems={getItems}
                                exportFileName={`Items-${moment().format('YYYY-MM-DD-hh-mm-ss')}`}
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

export default inject('globalStore')(observer(Items));