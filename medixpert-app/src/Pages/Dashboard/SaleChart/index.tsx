import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Segmented, Typography, Empty } from 'antd';
import Title from 'antd/es/typography/Title';
import { t } from 'i18next';
import globalStore from '../../../Store/globalStore';
import dashboardStore from '../../../Store/dashboardStore';
import Notification from '../../../Global/Notification';
import dayjs from 'dayjs';
import weekOfYear from "dayjs/plugin/weekOfYear";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import SaleCollectionBarChart from './BarChart';
import SaleCollectionLineChart from './LineChart';
import Utility from '../../../Global/Utility';

dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);

const { Text } = Typography;

interface SaleData {
    date: string;
    sales: number;
    collections: number;
}

interface RawSaleData {
    [key: string]: {
        roundedGrandTotal: number;
    };
}

interface RawCollectionData {
    [key: string]: {
        totalPaidAmount: number;
    };
}

const SaleChart: React.FC<{
    dateRange: [Date, Date]
    presetDateRange: string | null;
    chartType?: string;
}> = ({ 
    dateRange, 
    presetDateRange,
    chartType = 'Bar'
}) => {
    const branchChartRef = useRef<HTMLDivElement>(null);
    const outletChartRef = useRef<HTMLDivElement>(null);
    const [currentBranchOutletName, setCurrentBranchOutletName] = useState({ branch: '', outlet: '' });
    const [currentOutletWiseSum, setCurrentOutletWiseSum] = useState<RawSaleData>({});
    const [currentBranchWiseSum, setCurrentBranchWiseSum] = useState<RawSaleData>({});
    const [branchSegment, setBranchSegment] = useState<string>(() => {
        const savedSettings = localStorage.getItem("max-dash-setting");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                return parsedSettings?.branchSegment;
            } catch (error) {
                console.error("Error parsing max-dash-setting from localStorage:", error);
            }
        }
        return 'Daily';
    });
    const [outletSegment, setOutletSegment] = useState<string>(() => {
        const savedSettings = localStorage.getItem("max-dash-setting");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                return parsedSettings?.outletSegment;
            } catch (error) {
                console.error("Error parsing max-dash-setting from localStorage:", error);
            }
        }
        return 'Daily';
    });
    const [currentOutletWiseCollectionSum, setCurrentOutletWiseCollectionSum] = useState<RawCollectionData>({});
    const [currentBranchWiseCollectionSum, setCurrentBranchWiseCollectionSum] = useState<RawCollectionData>({});

    useEffect(() => {
        getData();
    }, [dateRange, presetDateRange, branchSegment, outletSegment, chartType]);

    const getData = async () => {
        globalStore.setLoading(true);
        try {
            const data = { dateRange, presetDateRange, outletSegment, branchSegment };
            await dashboardStore.getBranchOutletData(data);
            setCurrentBranchOutletName({
                branch: dashboardStore?.branchName || '',
                outlet: dashboardStore?.outletName || '',
            });
            const currentOutletWise = await processDataBySegment(dashboardStore?.currentOutletWiseSum || [], outletSegment, 'sale');
            const currentBranchWise = await processDataBySegment(dashboardStore?.currentBranchWiseSum || [], branchSegment, 'sale');

            setCurrentOutletWiseSum(currentOutletWise || {});
            setCurrentBranchWiseSum(currentBranchWise || {});

            const currentOutletWiseCollection = await processDataBySegment(dashboardStore?.currentOutletWiseCollectionSum || [], outletSegment, 'collection');
            const currentBranchWiseCollection = await processDataBySegment(dashboardStore?.currentBranchWiseCollectionSum || [], branchSegment, 'collection');
            
            setCurrentOutletWiseCollectionSum(currentOutletWiseCollection || {});
            setCurrentBranchWiseCollectionSum(currentBranchWiseCollection || {});
            
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('defaultErrorMessage')
            });
        } finally {
            setTimeout(() => globalStore.setLoading(false), 500);
        }
    };

    const processDataBySegment = (data: any[], segment: string, type?: string) => {
        if (!data.length) return [];

        const currentYear = dayjs().year();
        const uniqueYears = new Set(data.map(item => dayjs(item.date).year()));
        const hasMultipleYears = uniqueYears.size > 1 || !uniqueYears.has(currentYear);
    
        return data.reduce((acc, item) => {
            let groupKey = "";
            const date = dayjs(item.date);
            const year = date.format("YYYY");
    
            switch (segment) {
                case "Weekly":
                    const week = date.week() - dayjs(date).startOf('month').week();
                    groupKey = hasMultipleYears
                        ? `${date.format("MMM")} W${week}, ${year}`
                        : `${date.format("MMM")} W${week}`;
                    break;
                case "Monthly":
                    groupKey = hasMultipleYears
                        ? `${date.format("MMM")}, ${year}`
                        : `${date.format("MMM")}`;
                    break;
                case "Quarterly":
                    groupKey = hasMultipleYears
                        ? `Q${date.quarter()}, ${year}`
                        : `Q${date.quarter()}`;
                    break;
                case "Yearly":
                    groupKey = dayjs(item.date).format("YYYY");
                    break;
                default:
                    groupKey = hasMultipleYears ? dayjs(item.date).format("MMM DD, YYYY") : dayjs(item.date).format("MMM DD");
            }
    
            if (type === 'sale') {
                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        totalAmount: 0,
                        discountAmount: 0,
                        grandTotal: 0,
                        roundedGrandTotal: 0,
                        roundoffGrandTotal: 0,
                        outletName: item.outletName,
                        branchName: item.branchName,
                        count: 0,
                        date: date.toDate(),
                    };
                }
    
                acc[groupKey].totalAmount += item.totalAmount;
                acc[groupKey].discountAmount += item.discountAmount;
                acc[groupKey].grandTotal += item.grandTotal;
                acc[groupKey].roundedGrandTotal += item.roundedGrandTotal;
                acc[groupKey].roundoffGrandTotal += item.roundoffGrandTotal;
                acc[groupKey].count += 1;
            }

            if (type === 'collection') {
                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        totalPaidAmount: 0,
                        outletName: item.outletName,
                        branchName: item.branchName,
                        count: 0,
                        date: date.toDate(),
                    };
                }
    
                acc[groupKey].totalPaidAmount += item.totalPaidAmount;
                acc[groupKey].count += 1;
            }
    
            return acc;
        }, {});
    };    

    const handleSegmentChange = (segment: string, type: string) => {
        const existingSettings = localStorage.getItem("max-dash-setting");
        let settings = {};
        
        if (existingSettings) {
            try {
                settings = JSON.parse(existingSettings);
            } catch (error) {
                console.error("Error parsing max-dash-setting:", error);
            }
        }

        if (type === 'branch') {
            const updatedSettings = {
                ...settings,
                branchSegment: segment,
            };
    
            localStorage.setItem("max-dash-setting", JSON.stringify(updatedSettings));
            setBranchSegment(segment);
        }

        if (type === 'outlet') {
            const updatedSettings = {
                ...settings,
                outletSegment: segment,
            };
    
            localStorage.setItem("max-dash-setting", JSON.stringify(updatedSettings));
            setOutletSegment(segment);
        }
    };

    return (
        <Row gutter={24}>
            <Col lg={12} md={24} sm={24} xs={24}>
                <Card
                title={
                    <>
                        <Title level={5} style={{ marginTop: 10 }}>{currentBranchOutletName.outlet} - {t('outletText')}</Title>
                        <Text type="secondary">
                            { presetDateRange === 'Today' ?
                                t('todayText')
                            : presetDateRange === 'Yesterday' ?
                                t('yesterdayText')
                            : presetDateRange === 'This Week' ?
                                t('thisWeekText')
                            : presetDateRange === 'This Month' ?
                                t('thisMonthText')
                            : presetDateRange === 'Last 7 Days' ?
                                t('last7DaysText')
                            : presetDateRange === 'Last 14 Days' ?
                                t('last14DaysText')
                            : presetDateRange === 'Last 30 Days' ?
                                t('last30DaysText')
                            : presetDateRange === 'Last 90 Days' ?
                                t('last90DaysText')
                            :
                                t('todayText')
                            }
                        </Text>
                        <Text type='secondary' style={{ fontSize: 10 }}>
                            {
                                dateRange && dateRange.length === 2 ?
                                    ' (' + dayjs(dateRange[0]).format('MMM DD, YYYY') + ' - ' + dayjs(dateRange[1]).format('MMM DD, YYYY') + ')'
                                : ''
                            }
                        </Text>
                    </>
                }
                extra={<Segmented<string>
                    options={[
                        {
                            label: t('dailyText'),
                            value: 'Daily'
                        },
                        {
                            label: t('weeklyText'),
                            value: 'Weekly'
                        },
                        {
                            label: t('monthlyText'),
                            value: 'Monthly'
                        },
                        {
                            label: t('quarterlyText'),
                            value: 'Quarterly'
                        },
                        {
                            label: t('yearlyText'),
                            value: 'Yearly'
                        }
                    ]}
                    onChange={(value) => {
                      handleSegmentChange(value, 'outlet');
                    }}
                    value={outletSegment}
                  />}
                >
                    {chartType === 'Bar' ? (
                        <>
                            {!Utility.hasData(currentOutletWiseSum) && !Utility.hasData(currentOutletWiseCollectionSum) ?
                                <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={t('noDataText')}
                                />
                            : (
                                <SaleCollectionBarChart 
                                chartRef={outletChartRef} 
                                currentData={currentOutletWiseSum}
                                currentCollectionData={currentOutletWiseCollectionSum}
                                segment={outletSegment}
                                />
                            )}
                        </>
                        
                    ) : (
                        <>
                            {!Utility.hasData(currentOutletWiseSum) && !Utility.hasData(currentOutletWiseCollectionSum) ?
                                <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={t('noDataText')}
                                />
                            : (
                                <SaleCollectionLineChart 
                                chartRef={outletChartRef} 
                                currentData={currentOutletWiseSum}
                                currentCollectionData={currentOutletWiseCollectionSum}
                                segment={outletSegment}
                                />
                            )}
                        </>
                    )}
                </Card>
            </Col>
            <Col lg={12} md={24} sm={24} xs={24}>
                <Card 
                title={
                    <>
                        <Title level={5} style={{ marginTop: 10 }}>{currentBranchOutletName.branch} - {t('branchText')}</Title>
                        <Text type="secondary">
                            { presetDateRange === 'Today' ?
                                t('todayText')
                            : presetDateRange === 'Yesterday' ?
                                t('yesterdayText')
                            : presetDateRange === 'This Week' ?
                                t('thisWeekText')
                            : presetDateRange === 'This Month' ?
                                t('thisMonthText')
                            : presetDateRange === 'Last 7 Days' ?
                                t('last7DaysText')
                            : presetDateRange === 'Last 14 Days' ?
                                t('last14DaysText')
                            : presetDateRange === 'Last 30 Days' ?
                                t('last30DaysText')
                            : presetDateRange === 'Last 90 Days' ?
                                t('last90DaysText')
                            :
                                t('todayText')
                            }
                        </Text> 
                        <Text type='secondary' style={{ fontSize: 10 }}>
                            {
                                dateRange && dateRange.length === 2 ?
                                    ' (' + dayjs(dateRange[0]).format('MMM DD, YYYY') + ' - ' + dayjs(dateRange[1]).format('MMM DD, YYYY') + ')'
                                : ''
                            }
                        </Text>
                    </>
                }
                extra={<Segmented<string>
                    options={[
                        {
                            label: t('dailyText'),
                            value: 'Daily'
                        },
                        {
                            label: t('weeklyText'),
                            value: 'Weekly'
                        },
                        {
                            label: t('monthlyText'),
                            value: 'Monthly'
                        },
                        {
                            label: t('quarterlyText'),
                            value: 'Quarterly'
                        },
                        {
                            label: t('yearlyText'),
                            value: 'Yearly'
                        }
                    ]}
                    onChange={(value) => {
                        handleSegmentChange(value, 'branch');
                    }}
                    value={branchSegment}
                  />}
                >
                    {chartType === 'Bar' ? (
                        <>
                        {!Utility.hasData(currentBranchWiseSum) && !Utility.hasData(currentBranchWiseCollectionSum) ?
                            <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={t('noDataText')}
                            />
                        : (
                            <SaleCollectionBarChart 
                            chartRef={branchChartRef} 
                            currentData={currentBranchWiseSum}
                            currentCollectionData={currentBranchWiseCollectionSum}
                            segment={branchSegment}
                            />
                        )}
                        </>
                    ) : (
                        <>
                        {!Utility.hasData(currentBranchWiseSum) && !Utility.hasData(currentBranchWiseCollectionSum) ?
                            <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={t('noDataText')}
                            />
                        : (
                            <SaleCollectionLineChart 
                            chartRef={branchChartRef} 
                            currentData={currentBranchWiseSum}
                            currentCollectionData={currentBranchWiseCollectionSum}
                            segment={branchSegment}
                            />
                        )}
                        </>
                    )}
                </Card>
            </Col>
        </Row>
    );
};

export default SaleChart;
