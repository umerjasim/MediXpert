import { Card, Col, Row, Typography } from "antd";
import { inject, observer } from "mobx-react";
import CarouselPanel from "./CarouselPanel";
import VisitTable from "./VisitTable";
import SaleChart from "./SaleChart";
import SettingsPanel from "./SettingsPanel";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Utility from "../../Global/Utility";

function Dashboard() {
    const { Title, Text } = Typography;
    
    const [dateRange, setDateRange] = useState<[Date, Date]>(() => {
      const savedSettings = localStorage.getItem("max-dash-setting");
      if (savedSettings) {
          try {
              const parsedSettings = JSON.parse(savedSettings);
              return [dayjs(parsedSettings.from).toDate(), dayjs(parsedSettings.to).toDate()];
          } catch (error) {
              console.error("Error parsing max-dash-setting from localStorage:", error);
          }
      }
      return [dayjs().toDate(), dayjs().toDate()];
    });
    const [presetDateRange, setPresetDateRange] = useState<string | null>(() => {
        const savedSettings = localStorage.getItem("max-dash-setting");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                return parsedSettings?.presetRange;
            } catch (error) {
                console.error("Error parsing max-dash-setting from localStorage:", error);
            }
        }
        return null;
    });
    const [chartType, setChartType] = useState<string>(() => {
        const savedSettings = localStorage.getItem("max-dash-setting");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                return parsedSettings?.chartType;
            } catch (error) {
                console.error("Error parsing max-dash-setting from localStorage:", error);
            }
        }
        return 'Bar';
      });

    useEffect(() => {
      const existingSettings = localStorage.getItem("max-dash-setting");
      let settings = {};

      const presetRange: string = Utility.getPresetDateRange(dayjs(dateRange[0]), dayjs(dateRange[1]));
      console.log('presetRange', presetRange)
      setPresetDateRange(presetRange);
      
      if (existingSettings) {
          try {
              settings = JSON.parse(existingSettings);
          } catch (error) {
              console.error("Error parsing max-dash-setting:", error);
          }
      }

      const updatedSettings = {
          ...settings,
          from: dayjs(dateRange[0]).format("YYYY-MM-DD"),
          to: dayjs(dateRange[1]).format("YYYY-MM-DD"),
          presetRange,
          chartType
      };

      localStorage.setItem("max-dash-setting", JSON.stringify(updatedSettings));
    }, [dateRange, presetDateRange, chartType]);

    return (
        <>
          <SettingsPanel 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          chartType={chartType}
          setChartType={setChartType}
          />
          <div style={{ marginBottom: '10px' }}>
            <CarouselPanel 
                dateRange={dateRange} 
                presetDateRange={presetDateRange}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <SaleChart 
                dateRange={dateRange}
                presetDateRange={presetDateRange} 
                chartType={chartType}
            />
          </div>
          <VisitTable 
            dateRange={dateRange}
            presetDateRange={presetDateRange} 
          />
        </>
    );
};

export default inject('globalStore')(observer(Dashboard));