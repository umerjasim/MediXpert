import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Empty, Popover, Segmented, Table, TableProps, Tag, Typography } from 'antd';
import { t } from 'i18next';
import globalStore from '../../../Store/globalStore';
import dashboardStore from '../../../Store/dashboardStore';
import Notification from '../../../Global/Notification';
import Link from 'antd/es/typography/Link';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Constant from '../../../Global/Constant';
import StoreIcon from '@mui/icons-material/Store';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

const { Text } = Typography;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

interface SaleItems {
  itemName: string;
};

interface VisitData {
  key: string;
  _id: string;
  patientVisitId: number;
  fullName: string;
  gender: string;
  age: {
    days: number;
    months: number;
    years: number;
  };
  title: string;
  doctor: string;
  place: string;
  patientId: number;
  mobileCode: string;
  mobileNo: number | null;
  billNo: string;
  invoiceNo: string;
  totalAmount: number;
  totalPaidAmount: number;
  paidStatus: 'full' | 'partial' | 'not'
};

const VisitTable: React.FC<{
  dateRange: [Date, Date];
  presetDateRange: string | null;
}> = ({ dateRange, presetDateRange }) => {

  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const [invoicePopoverIndex, setInvoicePopoverIndex] = useState<number>(0);
  const [branchOrOutlet, setBanchOrOutlet] = useState<string>(() => {
    const savedSettings = localStorage.getItem("max-dash-setting");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                return parsedSettings?.patientDataSegment;
            } catch (error) {
                console.error("Error parsing max-dash-setting from localStorage:", error);
            }
        }
        return 'outlet';
  });

  useEffect(() => {
    getData();
  }, [dateRange, presetDateRange, branchOrOutlet]);

  const getData = async () => {
    globalStore.setLoading(true);
    try {
      const data = { dateRange, presetDateRange, branchOrOutlet };
      await dashboardStore.getBranchOutletPatientData(data);

      let fullVisitData: VisitData[] = [];
      if (dashboardStore?.branchOutletPatientData && dashboardStore?.branchOutletPatientData.length > 0) {
        fullVisitData = dashboardStore?.branchOutletPatientData.map((visit: any, index: number) => {
          const totalAmount = visit?.saleMaster?.roundedGrandTotal || 0;
          const totalPaidAmount = visit?.billMaster?.totalPaidAmount || 0;
          const paidStatus = totalPaidAmount === 0 ? 'not' 
                            : totalPaidAmount >= totalAmount ? 'full'
                            : 'partial';

          const saleItems: SaleItems[] = visit?.saleItems?.map((item: any) => {
            return{
              itemName: item?.name?.[0] || ''
            };
          });

          return {
            _id: visit?._id,
            slNo: index+1,
            key: visit?._id,
            patientVisitId: visit?.patientVisitId,
            fullName: visit?.patientDetails?.fullName || '',
            gender: visit?.gender?.name || '',
            age: {
              days: visit?.patientDetails?.age?.days || 0,
              months: visit?.patientDetails?.age?.months || 0,
              years: visit?.patientDetails?.age?.years || 0,
            },
            title: visit?.title?.name || '',
            doctor: visit?.doctor?.fullName || '',
            place: visit?.place?.name || '',
            patientId: visit?.patientDetails?.patientId,
            mobileCode: visit?.patientDetails?.mobileCode || '',
            mobileNo: visit?.patientDetails?.mobileNo || null,
            billNo: visit?.billMaster?.billNo || '',
            invoiceNo: visit?.saleMaster?.invoiceNo,
            totalAmount,
            totalPaidAmount,
            paidStatus,
            saleItems
          };
        });
      }
      setVisitData(fullVisitData)
    } catch (error) {
      Notification.error({
          message: t('error'),
          description: t('defaultErrorMessage')
      });
    } finally {
      setTimeout(() => globalStore.setLoading(false), 500);
    }
  };

  const getRowClassName = (record: any) => {
    return record?.paidStatus === 'full' ? 'fully-paid-row' 
            : record?.paidStatus === 'partial' ? 'partially-paid-row'
            : 'not-paid-row';
  };

  const handleSegmentChange = (segment: string) => {
    const existingSettings = localStorage.getItem("max-dash-setting");
    let settings = {};
    
    if (existingSettings) {
      try {
          settings = JSON.parse(existingSettings);
      } catch (error) {
          console.error("Error parsing max-dash-setting:", error);
      }
    }

    const updatedSettings = {
        ...settings,
        patientDataSegment: segment,
    };

    localStorage.setItem("max-dash-setting", JSON.stringify(updatedSettings));
    setBanchOrOutlet(segment);
  };

  const columns: TableProps<any>['columns'] = [
    {
      title: t('slNoText'),
      dataIndex: 'slNo',
      key: 'slNo',
      ellipsis: true,
      width: 70
    },
    {
      title: t('visitIDText'),
      dataIndex: 'patientVisitId',
      key: 'patientVisitId',
      ellipsis: true,
      render: (text: string, record: any) => (
        <Link href={text}>
          {text}
        </Link>
      ),
      width: 150
    },
    {
      title: t('nameText'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: any) => (
        <div style={{ marginBottom: -10 }}>
          <div>
            <Text>{record.title ? record.title + ' ' + text : text}</Text>
          </div>
          <div>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {record.age.years ? record.age.years + 'y' : ''} 
              {record.age.months ? record.age.months + ' m' : ''} 
              {record.age.days ? record.age.days + ' d' : ''}
              {record.gender ? ', ' : ''}
              {record.gender}
            </Text>
          </div>
        </div>
      ),
      width: 250
    },
    {
      title: t('itemsText'),
      dataIndex: 'saleItems',
      key: 'saleItems',
      render: (items: SaleItems[], record: any) => (
        <div style={{ marginBottom: -10 }}>
          <div>
          {items && items.length > 0 && items.map((item: any, index: number) => (
            <span key={'item-'+index}>
              {(index + 1) === items.length ? item.itemName : item.itemName + ', '}
            </span>
          ))}
          </div>
            <Link href='/' style={{ fontSize: 12 }}>{t('moreDetailsText')}</Link>
          </div>
      ),
      width: 200,
      ellipsis: true
    },
    {
      title: t('invoiceNoText'),
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      ellipsis: true,
      render(value, record, index) {
        const billNo: string = record.billNo || '';
        const slNo: number = record?.slNo || 1;
  
        return (
          <div style={{ marginBottom: -10 }}>
            <div>
              <Popover 
              open={invoicePopoverIndex === slNo}
              onOpenChange={() => {
                setInvoicePopoverIndex(0);
              }}
              title={t('invoiceDetails')}
              trigger='click'
              content={
                <Descriptions bordered size='small' column={3}>
                  <Descriptions.Item 
                  label={t('outletText')}>
                      {'item?.outlet'}
                  </Descriptions.Item>
                </Descriptions>
              }
              >
                <Link href='/' style={{ fontSize: 12 }} onClick={(e) => {
                  e.preventDefault();
                  setInvoicePopoverIndex(index+1);
                }}> 
                  {value}
                </Link>
              </Popover>
            </div>
          </div>
        );
      },
    },
    {
      title: t('billAmountText'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text: string, record: any) => (
        <div style={{ marginBottom: -10 }}>
          <div>
            <Text>
              {(Constant.currencySymbol || Constant.currencyShort) + ' ' + parseFloat(text).toFixed(Constant.roundOffs.sale.amount)}
            </Text>
          </div>
          <div>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {t('paidText')} {parseFloat(record.totalPaidAmount).toFixed(Constant.roundOffs.sale.amount)}
            </Text>
          </div>
        </div>
      ),
      width: 250
    },
    {
      title: t('statusText'),
      dataIndex: 'paidStatus',
      key: 'paidStatus',
      render(value: string, record: any, index: number) {
        const totalAmount: number = parseFloat(record.totalAmount) || 0;
        const paidAmount: number = parseFloat(record.totalPaidAmount) || 0;
        const balance: number = totalAmount - paidAmount;
  
        if (value === 'full') {
          return (
            <Tag 
            icon={<CheckCircleOutlined />} 
            color="success"
            style={{ cursor: 'pointer' }}
            >
              {t('fullyPaidText')}
            </Tag>
          )
        } else if (value === 'partial') {
          return (
            <div style={{ marginBottom: -10 }}>
              <Tag 
              icon={<ExclamationCircleOutlined />} 
              color="warning"
              style={{ cursor: 'pointer' }}
              >
                {t('partiallyPaidText')}
              </Tag> 
              <div style={{ marginTop: 2 }}>
                <Text type='secondary' style={{ fontSize: 12 }}>
                  {t('balanceText')}: {balance.toFixed(Constant.roundOffs.sale.amount)}
                </Text> 
                <Link href='/' style={{ fontSize: 12 }}> {t('payText')}</Link>
              </div>
            </div>
          )
        } else {
          return (
            <div style={{ marginBottom: -10 }}>
              <Tag 
              icon={<CloseCircleOutlined />} 
              color="error"
              style={{ cursor: 'pointer' }}
              >
                {t('notPaidText')}
              </Tag> 
              <div style={{ marginTop: 2 }}>
                <Text type='secondary' style={{ fontSize: 12 }}>
                  {t('balanceText')}: {balance.toFixed(Constant.roundOffs.sale.amount)}
                </Text> 
                <Link href='/' style={{ fontSize: 12 }}> {t('payText')}</Link>
              </div>
            </div>
          )
        }
      }
    },
  ];

  return (
    <Card
    title={
      <div style={{ display: 'flex', justifyContent: "space-between" }}>
        <span>{t('patientDetailsText')}</span>
      </div>
    }
    className='dashboard-visit-table-card'
    styles={{ body: { paddingTop: 10 } }}
    >
        <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'end' }}>
          <Segmented 
          options={[
            {
              label: t('outletText'),
              value: 'outlet',
              icon: <StoreIcon fontSize='small' style={{ marginBottom: -5 }} />
            },
            {
              label: t('branchText'),
              value: 'branch',
              icon: <AddBusinessIcon fontSize='small' style={{ marginBottom: -5 }} />
            }
          ]}
          value={branchOrOutlet}
          onChange={(value)=> handleSegmentChange(value)}
          />
        </div>
        <Table 
        columns={columns} 
        dataSource={visitData} 
        rowClassName={getRowClassName}
        scroll={{ x: 'min-content',  y: 55 * 5 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('noDataText')}
            />
          )
        }}
        />
    </Card>
  );
}

export default VisitTable;
