import React, { useEffect, useState } from "react";
import { Card, Col, Drawer, Form, Row, Segmented, Tooltip } from "antd";
import { BarChartOutlined, CaretLeftOutlined, CaretRightOutlined, FileSearchOutlined, InfoCircleOutlined, LineChartOutlined, SettingOutlined } from "@ant-design/icons";
import { t } from "i18next";
import RangePicker from "../../../Components/RangePicker";
import dayjs, { isDayjs } from "dayjs";
import globalStore from "../../../Store/globalStore";
import { inject, observer } from "mobx-react";

const SettingsPanel: React.FC<{
    dateRange: [Date, Date];
    setDateRange: (dates: [Date, Date]) => void;
    chartType: string;
    setChartType: (type: string) => void;
}> = ({ 
    dateRange, 
    setDateRange, 
    chartType,
    setChartType 
}) => {
    const [panelOpen, setPanelOpen] = useState(false);
    
    const handleRangeSelection = (dates: [Date, Date]) => {
        setDateRange(dates);
    };

    return (
        <>
            <Drawer
                title="Hidden Panel"
                placement="right"
                closable={true}
                onClose={() => setPanelOpen(false)}
                open={panelOpen}
                width={300}
                styles={{ body: { padding: "20px" } }}
                style={{ zIndex: 1000, position: "relative" }}
            >
                <Form
                layout="vertical"
                >
                    <Row gutter={24}>
                        <Col xs={24}>
                            <Form.Item
                                label={
                                    <>
                                        {t('dateRangeText')}
                                        <Tooltip placement="top" 
                                        title={t('dateRangeTooltipText')}>
                                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                        </Tooltip>
                                    </>
                                }
                            >
                                 <RangePicker 
                                    dateRange={{from: isDayjs(dayjs(dateRange[0])) ? dayjs(dateRange[0]) : '', to: isDayjs(dayjs(dateRange[1])) ? dayjs(dateRange[1]) : ''}} 
                                    handleRangeSelection={handleRangeSelection}
                                    maxDate={dayjs()}
                                 />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24}>
                            <Form.Item
                                label={
                                    <>
                                        {t('chartTypeText')}
                                        <Tooltip placement="top" 
                                        title={t('chartTypeTooltipText')}>
                                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                        </Tooltip>
                                    </>
                                }
                            >
                                 <Segmented 
                                    options={[
                                        {
                                            value: 'Bar',
                                            label: t('barText'),
                                            icon: <BarChartOutlined />
                                        },
                                        {
                                            value: 'Line',
                                            label: t('lineText'),
                                            icon: <LineChartOutlined />
                                        }
                                    ]}
                                    onChange={(value) => {
                                      setChartType(value);
                                    }}
                                    value={chartType || 'Bar'}
                                    block
                                 />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
            {/* <Tooltip title={ t('previousInvoicesText')} placement="left"> */}
                <div
                    style={{
                        position: "fixed",
                        top: "22%",
                        right: panelOpen ? 300 : 0,
                        transform: "translateY(-50%)",
                        background: globalStore.darkTheme ? (!panelOpen ? "#0b356e" : "#1f1f1f")
                                    : (panelOpen ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 0.25)"),
                        color: globalStore.darkTheme ? "#fff" : "#000",
                        padding: "10px 3px",
                        borderRadius: "4px 0 0 4px",
                        cursor: "pointer",
                        transition: "right 0.3s ease-in-out",
                        zIndex: globalStore.settingDrawerOpen ? 100 : 1010,
                        boxShadow: panelOpen ? "none" : "2px 2px 5px rgba(0,0,0,0.3)",
                    }}
                    onClick={() => setPanelOpen(!panelOpen)}
                >
                    {panelOpen ? <CaretRightOutlined /> : <CaretLeftOutlined />} <SettingOutlined />
                </div>
            {/* </Tooltip> */}
        </>
    );
};

export default inject('globalStore')(observer(SettingsPanel));