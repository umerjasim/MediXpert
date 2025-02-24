import { Carousel, Card, Row, Col, Typography, Tooltip } from "antd";
import { DollarOutlined, LeftOutlined, RightOutlined, TagOutlined, TagsOutlined } from "@ant-design/icons";
import React, { useRef, useState, useEffect } from "react";
import Title from "antd/es/typography/Title";
import globalStore from "../../../Store/globalStore";
import Notification from "../../../Global/Notification";
import { t } from "i18next";
import dashboardStore from "../../../Store/dashboardStore";
import Constant from "../../../Global/Constant";
import PaymentsIcon from '@mui/icons-material/Payments';
import SellIcon from '@mui/icons-material/Sell';
import GroupsIcon from '@mui/icons-material/Groups';
import { inject, observer } from "mobx-react";
import dayjs from "dayjs";
import AnimatedNumber from "../../../Components/AnimatedNumber";

const { Text } = Typography;

const CarouselPanel: React.FC<{
    dateRange: [Date, Date],
    presetDateRange: string | null;
}> = ({  dateRange, presetDateRange }) => {
    const carouselRef = useRef<any>(null);
    const [slidesToShow, setSlidesToShow] = useState<number>(4);
    const [branchTotalSale, setBranchTotalSale] = useState<{
        totalAmount: number;
        discountAmount: number;
        grandTotal: number;
        roundedGrandTotal: number;
        roundoffGrandTotal: number;
        branch: string;
        branchMarginPrecentage: string;
        branchMargin: number;
    }>({
        totalAmount: 0,
        discountAmount: 0,
        grandTotal: 0,
        roundedGrandTotal: 0,
        roundoffGrandTotal: 0,
        branch: '',
        branchMarginPrecentage: '0.00%', 
        branchMargin: 0
    });
    const [outletTotalSale, setOutletTotalSale] = useState<{
        totalAmount: number;
        discountAmount: number;
        grandTotal: number;
        roundedGrandTotal: number;
        roundoffGrandTotal: number;
        outlet: string;
        outletMarginPercentage: string;
        outletMargin: number;
    }>({
        totalAmount: 0,
        discountAmount: 0,
        grandTotal: 0,
        roundedGrandTotal: 0,
        roundoffGrandTotal: 0,
        outlet: '',
        outletMarginPercentage: '0.00%',
        outletMargin: 0
    });
    const [branchCollectionTotalSale, setBranchCollectionTotalSale] = useState<{
        totalPaidAmount: number;
        branchCollectionMargin: number;
        branchCollectionMarginPrecentage: string;
        branch: string;
    }>({
        totalPaidAmount: 0,
        branchCollectionMargin: 0,
        branchCollectionMarginPrecentage: '0.00%',
        branch: ''
    });
    const [outletCollectionTotalSale, setOutletCollectionTotalSale] = useState<{
        totalPaidAmount: number;
        outletCollectionMargin: number;
        outletCollectionMarginPercentage: string;
        outlet: string;
    }>({
        totalPaidAmount: 0,
        outletCollectionMargin: 0,
        outletCollectionMarginPercentage: '0.00%',
        outlet: ''
    });
    const [currentBranchOutletName, setCurrentBranchOutletName] = useState<{
        branch: string;
        outlet: string;
    }>({ branch: '', outlet: '' });
    const [patientCount, setPatientCount] = useState<{
        branchPatientCount: number;
        outletPatientCount: number;
        branchPrecentage: string,
        branchMargin: number,
        outletPrecentage: string,
        outletMargin: number
    }>({
        branchPatientCount: 0,
        outletPatientCount: 0,
        branchPrecentage: '0.00%',
        branchMargin: 0,
        outletPrecentage: '0.00%',
        outletMargin: 0
    });

    useEffect(() => {
        if (globalStore.screenSize.xxl) {
            setSlidesToShow(4);
        } else if (globalStore.screenSize.xl) {
            setSlidesToShow(3);
        } else if (globalStore.screenSize.lg) {
            setSlidesToShow(2);
        } else if (globalStore.screenSize.md) {
            setSlidesToShow(2);
        } else if (globalStore.screenSize.sm) {
            setSlidesToShow(1);
        } else if (globalStore.screenSize.xs) {
            setSlidesToShow(1);
        }
    }, [globalStore.screenSize]);

    useEffect(() => {
        getData();
    }, [dateRange, presetDateRange]);

    const getData = async () => {
        globalStore.setLoading(true);
        try {
            const data = { dateRange, presetDateRange };
            await dashboardStore.getTotalData(data);
            setBranchTotalSale(dashboardStore?.branchTotalSale);
            setOutletTotalSale(dashboardStore?.outletTotalSale);
            setBranchCollectionTotalSale(dashboardStore?.branchCollectionTotalSale);
            setOutletCollectionTotalSale(dashboardStore?.outletCollectionTotalSale);
            setCurrentBranchOutletName({ branch: dashboardStore?.branchName, outlet: dashboardStore?.outletName });
            setPatientCount(dashboardStore?.patientCount);
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
        <div style={{ margin: "auto", position: "relative", overflow: "hidden" }} className={`${slidesToShow}`}>
            <Carousel
                className="dashboard-carousel"
                ref={carouselRef}
                dots={false}
                autoplay
                autoplaySpeed={2000}
                infinite
                slidesToShow={slidesToShow}
                slidesToScroll={1}
                swipeToSlide
                draggable
                centerMode
                responsive={[
                    { breakpoint: 1600, settings: { slidesToShow: 4, centerMode: true } }, // xxl
                    { breakpoint: 1400, settings: { slidesToShow: 3, centerMode: true } }, // xl
                    { breakpoint: 1200, settings: { slidesToShow: 2, centerMode: true } }, // lg
                    { breakpoint: 992, settings: { slidesToShow: 2, centerMode: true } },  // md
                    { breakpoint: 768, settings: { slidesToShow: 1, centerMode: true } },  // sm
                    { breakpoint: 576, settings: { slidesToShow: 1, centerMode: true } },  // xs
                ]}
            >
                <div className="dashboard-card">
                    <Card bordered={false} className="responsive-card">
                        <div>
                            <Row align="middle" gutter={[24, 0]}>
                                <Col xs={18}>
                                    <Tooltip title={
                                        presetDateRange === 'Today' ?
                                        t('todaySaleText')
                                        : presetDateRange === 'Yesterday' ?
                                            t('yesterdaySaleText')
                                        : presetDateRange === 'This Week' ?
                                            t('thisWeekSaleText')
                                        : presetDateRange === 'This Month' ?
                                            t('thisMonthSaleText')
                                        : presetDateRange === 'Last 7 Days' ?
                                            t('last7DaysSaleText')
                                        : presetDateRange === 'Last 14 Days' ?
                                            t('last14DaysSaleText')
                                        : presetDateRange === 'Last 30 Days' ?
                                            t('last30DaysSaleText')
                                        : presetDateRange === 'Last 90 Days' ?
                                            t('last90DaysSaleText')
                                        :
                                            t('todaySaleText')
                                    }>
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                            { presetDateRange === 'Today' ?
                                                t('todaySaleText')
                                            : presetDateRange === 'Yesterday' ?
                                                t('yesterdaySaleText')
                                            : presetDateRange === 'This Week' ?
                                                t('thisWeekSaleText')
                                            : presetDateRange === 'This Month' ?
                                                t('thisMonthSaleText')
                                            : presetDateRange === 'Last 7 Days' ?
                                                t('last7DaysSaleText')
                                            : presetDateRange === 'Last 14 Days' ?
                                                t('last14DaysSaleText')
                                            : presetDateRange === 'Last 30 Days' ?
                                                t('last30DaysSaleText')
                                            : presetDateRange === 'Last 90 Days' ?
                                                t('last90DaysSaleText')
                                            :
                                                t('todaySaleText')
                                            }
                                        </div>
                                    </Tooltip>
                                    <Title level={3} style={{ marginTop: 2 }}>
                                        {(Constant.currencySymbol || Constant.currencyShort) + ' '}
                                        <AnimatedNumber
                                            value={branchTotalSale.roundedGrandTotal} 
                                            roundOff={Constant.roundOffs.sale.amount} 
                                        />
                                        <small style={{ 
                                            color: branchTotalSale.branchMargin > 0 ? 'green' 
                                                    : branchTotalSale.branchMargin < 0 ? 'red'
                                                    : 'lightgray'
                                        }}> 
                                            &nbsp;
                                            <AnimatedNumber
                                                value={branchTotalSale.branchMarginPrecentage} 
                                                roundOff={Constant.roundOffs.normal}
                                            />
                                        </small>
                                    </Title>
                                </Col>
                                <Col xs={6}>
                                    <div><SellIcon style={{ fontSize: 30 }} color="primary" /></div>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ justifyContent: 'space-between', marginTop: '-10px' }}>
                                <Col>
                                    <Text type="secondary" style={{ fontSize: 10 }}>
                                        {
                                            dateRange && dateRange.length === 2 ?
                                                ' (' + dayjs(dateRange[0]).format('MMM DD, YYYY') + ' - ' + dayjs(dateRange[1]).format('MMM DD, YYYY') + ')'
                                            : ''
                                        }
                                    </Text>
                                </Col>
                                <Col>
                                    <Text type="secondary">{branchTotalSale.branch || currentBranchOutletName.branch} - {t('branchText')}</Text>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
                <div className="dashboard-card">
                    <Card bordered={false} className="responsive-card">
                        <div>
                            <Row align="middle" gutter={[24, 0]}>
                                <Col xs={18}>
                                    <Tooltip title={
                                        presetDateRange === 'Today' ?
                                        t('todaySaleText')
                                        : presetDateRange === 'Yesterday' ?
                                            t('yesterdaySaleText')
                                        : presetDateRange === 'This Week' ?
                                            t('thisWeekSaleText')
                                        : presetDateRange === 'This Month' ?
                                            t('thisMonthSaleText')
                                        : presetDateRange === 'Last 7 Days' ?
                                            t('last7DaysSaleText')
                                        : presetDateRange === 'Last 14 Days' ?
                                            t('last14DaysSaleText')
                                        : presetDateRange === 'Last 30 Days' ?
                                            t('last30DaysSaleText')
                                        : presetDateRange === 'Last 90 Days' ?
                                            t('last90DaysSaleText')
                                        :
                                            t('todaySaleText')
                                    }>
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                            { presetDateRange === 'Today' ?
                                                t('todaySaleText')
                                            : presetDateRange === 'Yesterday' ?
                                                t('yesterdaySaleText')
                                            : presetDateRange === 'This Week' ?
                                                t('thisWeekSaleText')
                                            : presetDateRange === 'This Month' ?
                                                t('thisMonthSaleText')
                                            : presetDateRange === 'Last 7 Days' ?
                                                t('last7DaysSaleText')
                                            : presetDateRange === 'Last 14 Days' ?
                                                t('last14DaysSaleText')
                                            : presetDateRange === 'Last 30 Days' ?
                                                t('last30DaysSaleText')
                                            : presetDateRange === 'Last 90 Days' ?
                                                t('last90DaysSaleText')
                                            :
                                                t('todaySaleText')
                                            }
                                        </div>
                                    </Tooltip>
                                    <Title level={3} style={{ marginTop: 2 }}>
                                        {(Constant.currencySymbol || Constant.currencyShort) + ' '}
                                        <AnimatedNumber
                                            value={outletTotalSale.roundedGrandTotal} 
                                            roundOff={Constant.roundOffs.sale.amount} 
                                        />
                                        <small style={{ 
                                            color: outletTotalSale.outletMargin > 0 ? 'green' 
                                                    : outletTotalSale.outletMargin < 0 ? 'red'
                                                    : 'lightgray'
                                        }}> 
                                            &nbsp;
                                            <AnimatedNumber
                                                value={outletTotalSale.outletMarginPercentage} 
                                                roundOff={Constant.roundOffs.normal}
                                            />
                                        </small>
                                    </Title>
                                </Col>
                                <Col xs={6}>
                                    <div><SellIcon style={{ fontSize: 30 }} color="primary" /></div>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ justifyContent: 'space-between', marginTop: '-10px' }}>
                                <Col>
                                    <Text type="secondary" style={{ fontSize: 10 }}>
                                        {
                                            dateRange && dateRange.length === 2 ?
                                                ' (' + dayjs(dateRange[0]).format('MMM DD, YYYY') + ' - ' + dayjs(dateRange[1]).format('MMM DD, YYYY') + ')'
                                            : ''
                                        }
                                    </Text>
                                </Col>
                                <Col>
                                    <Text type="secondary">{outletTotalSale.outlet || currentBranchOutletName.outlet} - {t('outletText')}</Text>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
                <div className="dashboard-card">
                    <Card bordered={false} className="responsive-card">
                        <div>
                            <Row align="middle" gutter={[24, 0]}>
                                <Col xs={18}>
                                    <Tooltip title={
                                        presetDateRange === 'Today' ?
                                        t('todayCollectionText')
                                        : presetDateRange === 'Yesterday' ?
                                            t('yesterdayCollectionText')
                                        : presetDateRange === 'This Week' ?
                                            t('thisWeekCollectionText')
                                        : presetDateRange === 'This Month' ?
                                            t('thisMonthCollectionText')
                                        : presetDateRange === 'Last 7 Days' ?
                                            t('last7DaysCollectionText')
                                        : presetDateRange === 'Last 14 Days' ?
                                            t('last14DaysCollectionText')
                                        : presetDateRange === 'Last 30 Days' ?
                                            t('last30DaysCollectionText')
                                        : presetDateRange === 'Last 90 Days' ?
                                            t('last90DaysCollectionText')
                                        :
                                            t('todayCollectionText')
                                    }>
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                            { presetDateRange === 'Today' ?
                                                t('todayCollectionText')
                                            : presetDateRange === 'Yesterday' ?
                                                t('yesterdayCollectionText')
                                            : presetDateRange === 'This Week' ?
                                                t('thisWeekCollectionText')
                                            : presetDateRange === 'This Month' ?
                                                t('thisMonthCollectionText')
                                            : presetDateRange === 'Last 7 Days' ?
                                                t('last7DaysCollectionText')
                                            : presetDateRange === 'Last 14 Days' ?
                                                t('last14DaysCollectionText')
                                            : presetDateRange === 'Last 30 Days' ?
                                                t('last30DaysCollectionText')
                                            : presetDateRange === 'Last 90 Days' ?
                                                t('last90DaysCollectionText')
                                            :
                                                t('todayCollectionText')
                                            }
                                        </div>
                                    </Tooltip>
                                    <Title level={3} style={{ marginTop: 2 }}>
                                        {(Constant.currencySymbol || Constant.currencyShort) + ' '}
                                        <AnimatedNumber
                                            value={branchCollectionTotalSale.totalPaidAmount} 
                                            roundOff={Constant.roundOffs.sale.amount} 
                                        />
                                        <small style={{ 
                                            color: branchCollectionTotalSale.branchCollectionMargin > 0 ? 'green' 
                                                    : branchCollectionTotalSale.branchCollectionMargin < 0 ? 'red'
                                                    : 'lightgray'
                                        }}> 
                                            &nbsp; 
                                            <AnimatedNumber
                                                value={branchCollectionTotalSale.branchCollectionMarginPrecentage}
                                                roundOff={Constant.roundOffs.normal}
                                            />
                                        </small>
                                    </Title>
                                </Col>
                                <Col xs={6}>
                                    <div><PaymentsIcon style={{ fontSize: 30 }} color="secondary" /></div>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ justifyContent: 'space-between', marginTop: '-10px' }}>
                                <Col>
                                    <Text type="secondary" style={{ fontSize: 10 }}>
                                        {
                                            dateRange && dateRange.length === 2 ?
                                                ' (' + dayjs(dateRange[0]).format('MMM DD, YYYY') + ' - ' + dayjs(dateRange[1]).format('MMM DD, YYYY') + ')'
                                            : ''
                                        }
                                    </Text>
                                </Col>
                                <Col>
                                    <Text type="secondary">{branchCollectionTotalSale.branch || currentBranchOutletName.branch} - {t('branchText')}</Text>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
                <div className="dashboard-card">
                    <Card bordered={false} className="responsive-card">
                        <div>
                            <Row align="middle" gutter={[24, 0]}>
                                <Col xs={18}>
                                    <Tooltip title={
                                        presetDateRange === 'Today' ?
                                        t('todayCollectionText')
                                        : presetDateRange === 'Yesterday' ?
                                            t('yesterdayCollectionText')
                                        : presetDateRange === 'This Week' ?
                                            t('thisWeekCollectionText')
                                        : presetDateRange === 'This Month' ?
                                            t('thisMonthCollectionText')
                                        : presetDateRange === 'Last 7 Days' ?
                                            t('last7DaysCollectionText')
                                        : presetDateRange === 'Last 14 Days' ?
                                            t('last14DaysCollectionText')
                                        : presetDateRange === 'Last 30 Days' ?
                                            t('last30DaysCollectionText')
                                        : presetDateRange === 'Last 90 Days' ?
                                            t('last90DaysCollectionText')
                                        :
                                            t('todayCollectionText')
                                    }>
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                            { presetDateRange === 'Today' ?
                                                t('todayCollectionText')
                                            : presetDateRange === 'Yesterday' ?
                                                t('yesterdayCollectionText')
                                            : presetDateRange === 'This Week' ?
                                                t('thisWeekCollectionText')
                                            : presetDateRange === 'This Month' ?
                                                t('thisMonthCollectionText')
                                            : presetDateRange === 'Last 7 Days' ?
                                                t('last7DaysCollectionText')
                                            : presetDateRange === 'Last 14 Days' ?
                                                t('last14DaysCollectionText')
                                            : presetDateRange === 'Last 30 Days' ?
                                                t('last30DaysCollectionText')
                                            : presetDateRange === 'Last 90 Days' ?
                                                t('last90DaysCollectionText')
                                            :
                                                t('todayCollectionText')
                                            }
                                        </div>
                                    </Tooltip>
                                    <Title level={3} style={{ marginTop: 2 }}>
                                        {(Constant.currencySymbol || Constant.currencyShort) + ' '}
                                        <AnimatedNumber
                                            value={outletCollectionTotalSale.totalPaidAmount} 
                                            roundOff={Constant.roundOffs.sale.amount} 
                                        />
                                        <small style={{ 
                                            color: outletCollectionTotalSale.outletCollectionMargin > 0 ? 'green' 
                                                    : outletCollectionTotalSale.outletCollectionMargin < 0 ? 'red'
                                                    : 'lightgray'
                                        }}> 
                                            &nbsp; 
                                            <AnimatedNumber
                                                value={outletCollectionTotalSale.outletCollectionMarginPercentage}
                                                roundOff={Constant.roundOffs.normal}
                                            />
                                        </small>
                                    </Title>
                                </Col>
                                <Col xs={6}>
                                    <div><PaymentsIcon style={{ fontSize: 30 }} color="secondary" /></div>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ justifyContent: 'space-between', marginTop: '-10px' }}>
                                <Col>
                                    <Text type="secondary" style={{ fontSize: 10 }}>
                                        {
                                            dateRange && dateRange.length === 2 ?
                                                ' (' + dayjs(dateRange[0]).format('MMM DD, YYYY') + ' - ' + dayjs(dateRange[1]).format('MMM DD, YYYY') + ')'
                                            : ''
                                        }
                                    </Text>
                                </Col>
                                <Col>
                                    <Text type="secondary">{outletCollectionTotalSale.outlet || currentBranchOutletName.outlet} - {t('outletText')}</Text>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
                <div className="dashboard-card">
                    <Card bordered={false} className="responsive-card">
                        <div>
                            <Row align="middle" gutter={[24, 0]}>
                                <Col xs={18}>
                                    <Tooltip title={
                                        presetDateRange === 'Today' ?
                                        t('todayPatientCountText')
                                        : presetDateRange === 'Yesterday' ?
                                            t('yesterdayPatientCountText')
                                        : presetDateRange === 'This Week' ?
                                            t('thisWeekPatientCountText')
                                        : presetDateRange === 'This Month' ?
                                            t('thisMonthPatientCountText')
                                        : presetDateRange === 'Last 7 Days' ?
                                            t('last7DaysPatientCountText')
                                        : presetDateRange === 'Last 14 Days' ?
                                            t('last14DaysPatientCountText')
                                        : presetDateRange === 'Last 30 Days' ?
                                            t('last30DaysPatientCountText')
                                        : presetDateRange === 'Last 90 Days' ?
                                            t('last90DaysPatientCountText')
                                        :
                                            t('todayPatientCountText')
                                        }
                                    >
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                            { presetDateRange === 'Today' ?
                                                t('todayPatientCountText')
                                            : presetDateRange === 'Yesterday' ?
                                                t('yesterdayPatientCountText')
                                            : presetDateRange === 'This Week' ?
                                                t('thisWeekPatientCountText')
                                            : presetDateRange === 'This Month' ?
                                                t('thisMonthPatientCountText')
                                            : presetDateRange === 'Last 7 Days' ?
                                                t('last7DaysPatientCountText')
                                            : presetDateRange === 'Last 14 Days' ?
                                                t('last14DaysPatientCountText')
                                            : presetDateRange === 'Last 30 Days' ?
                                                t('last30DaysPatientCountText')
                                            : presetDateRange === 'Last 90 Days' ?
                                                t('last90DaysPatientCountText')
                                            :
                                                t('todayPatientCountText')
                                            }
                                        </div>
                                    </Tooltip>
                                    <Title level={3} style={{ marginTop: 2 }}>
                                        <AnimatedNumber
                                            value={patientCount.branchPatientCount}
                                            roundOff={0} 
                                        />
                                        <small style={{ 
                                            color: patientCount.branchMargin > 0 ? 'green' 
                                                    : patientCount.branchMargin < 0 ? 'red'
                                                    : 'lightgray'
                                        }}> 
                                            &nbsp; 
                                            <AnimatedNumber
                                                value={patientCount.branchPrecentage}
                                                roundOff={Constant.roundOffs.normal}
                                            />
                                        </small>
                                    </Title>
                                </Col>
                                <Col xs={6}>
                                    <div><GroupsIcon style={{ fontSize: 30 }} color="warning" /></div>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ justifyContent: 'space-between', marginTop: '-10px' }}>
                                <Col>
                                    <Text type="secondary" style={{ fontSize: 10 }}>
                                        {
                                            dateRange && dateRange.length === 2 ?
                                                ' (' + dayjs(dateRange[0]).format('MMM DD, YYYY') + ' - ' + dayjs(dateRange[1]).format('MMM DD, YYYY') + ')'
                                            : ''
                                        }
                                    </Text>
                                </Col>
                                <Col>
                                    <Text type="secondary">{currentBranchOutletName.branch} - {t('branchText')}</Text>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
                <div className="dashboard-card">
                    <Card bordered={false} className="responsive-card">
                        <div>
                            <Row align="middle" gutter={[24, 0]}>
                                <Col xs={18}>
                                    <Tooltip title={
                                        presetDateRange === 'Today' ?
                                            t('todayPatientCountText')
                                        : presetDateRange === 'Yesterday' ?
                                            t('yesterdayPatientCountText')
                                        : presetDateRange === 'This Week' ?
                                            t('thisWeekPatientCountText')
                                        : presetDateRange === 'This Month' ?
                                            t('thisMonthPatientCountText')
                                        : presetDateRange === 'Last 7 Days' ?
                                            t('last7DaysPatientCountText')
                                        : presetDateRange === 'Last 14 Days' ?
                                            t('last14DaysPatientCountText')
                                        : presetDateRange === 'Last 30 Days' ?
                                            t('last30DaysPatientCountText')
                                        : presetDateRange === 'Last 90 Days' ?
                                            t('last90DaysPatientCountText')
                                        :
                                            t('todayPatientCountText')
                                    }>
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                            { presetDateRange === 'Today' ?
                                                t('todayPatientCountText')
                                            : presetDateRange === 'Yesterday' ?
                                                t('yesterdayPatientCountText')
                                            : presetDateRange === 'This Week' ?
                                                t('thisWeekPatientCountText')
                                            : presetDateRange === 'This Month' ?
                                                t('thisMonthPatientCountText')
                                            : presetDateRange === 'Last 7 Days' ?
                                                t('last7DaysPatientCountText')
                                            : presetDateRange === 'Last 14 Days' ?
                                                t('last14DaysPatientCountText')
                                            : presetDateRange === 'Last 30 Days' ?
                                                t('last30DaysPatientCountText')
                                            : presetDateRange === 'Last 90 Days' ?
                                                t('last90DaysPatientCountText')
                                            :
                                                t('todayPatientCountText')
                                            }
                                        </div>
                                    </Tooltip>
                                    <Title level={3} style={{ marginTop: 2 }}>
                                        <AnimatedNumber
                                            value={patientCount.outletPatientCount}
                                            roundOff={0} 
                                        />
                                        <small style={{ 
                                            color: patientCount.outletMargin > 0 ? 'green' 
                                                    : patientCount.outletMargin < 0 ? 'red'
                                                    : 'lightgray'
                                        }}> 
                                            &nbsp; 
                                            <AnimatedNumber
                                                value={patientCount.outletPrecentage}
                                                roundOff={Constant.roundOffs.normal}
                                            />
                                        </small>
                                    </Title>
                                </Col>
                                <Col xs={6}>
                                    <div><GroupsIcon style={{ fontSize: 30 }} color="warning" /></div>
                                </Col>
                            </Row>
                            <Row gutter={24} style={{ justifyContent: 'space-between', marginTop: '-10px' }}>
                                <Col>
                                    <Text type="secondary" style={{ fontSize: 10 }}>
                                        {
                                            dateRange && dateRange.length === 2 ?
                                                ' (' + dayjs(dateRange[0]).format('MMM DD, YYYY') + ' - ' + dayjs(dateRange[1]).format('MMM DD, YYYY') + ')'
                                            : ''
                                        }
                                    </Text>
                                </Col>
                                <Col>
                                    <Text type="secondary">{currentBranchOutletName.outlet} - {t('outletText')}</Text>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
            </Carousel>
        </div>
    );
};

export default inject('globalStore')(observer(CarouselPanel));