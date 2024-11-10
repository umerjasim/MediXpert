import { DatePicker, InputNumber, Space, TimeRangePickerProps, Tooltip } from "antd";
import Constant from "../../Global/Constant";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { t } from "i18next";

interface RangePickerProps {
    dateRange: {
        from: any,
        to: any
    },
    handleRangeSelection: (value: any) => void;
};

const RangePicker: React.FC<RangePickerProps> = ({
    dateRange,
    handleRangeSelection
}) => {

    const [inputDays, setInputDays] = useState<number | undefined>(undefined);
    const [selectedRange, setSelectedRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
        dateRange.from, dateRange.to
    ]);
    const [baseDate, setBaseDate] = useState<Dayjs | null>(null);

    const handleCustomDaysChange = (value: any) => {
        let referenceDate: Dayjs = baseDate || dayjs();
        let days: number = 0;

        if (value !== undefined) {
            if (value > 365) {
                setInputDays(365);
                days = 365;
            } else if (value < -365) {
                setInputDays(-365);
                days = -365;
            } else {
                setInputDays(value);
                days = value;
            }

            let newRange: [Dayjs, Dayjs] = [dayjs(), dayjs()];
            if (String(days).includes('-')) {
                newRange = [
                    dayjs(referenceDate).add(days, 'd').startOf('day'),
                    dayjs(referenceDate).endOf('day')
                ];
            } else {
                newRange = [
                    dayjs(referenceDate).startOf('day'),
                    dayjs(referenceDate).add(days, 'd').endOf('day')
                ];
            }
    
            setSelectedRange(newRange);
            handleRangeSelection(newRange);
        } else {
            setInputDays(undefined);
        }
    };

    const handleDateSelection = (dates: any) => {
        setBaseDate(dates[0]);
    };

    const rangeSelection = (dates: any) => {
        setSelectedRange(dates);
        handleRangeSelection(dates);
    };

    const rangePresets = [
        { 
            label: <span style={{ fontWeight: 600, color: 'gray' }}>Today</span>, 
            value: [dayjs().startOf('day'), dayjs().endOf('day')] 
        },
        { 
            label: <span style={{ fontWeight: 600, color: 'gray' }}>This Week</span>, 
            value: [dayjs().startOf('week'), dayjs().endOf('week')] 
        
        },
        { 
            label: <span style={{ fontWeight: 600, color: 'gray' }}>This Month</span>,
            value: [dayjs().startOf('month'), dayjs().endOf('month')]

        },
        { 
            label: <span style={{ fontWeight: 600, color: 'gray' }}>Last 7 Days</span>, 
            value: [dayjs().add(-7, 'd'), dayjs()]

        },
        { 
            label: <span style={{ fontWeight: 600, color: 'gray' }}>Last 14 Days</span>, 
            value: [dayjs().add(-14, 'd'), dayjs()]

        },
        { 
            label: <span style={{ fontWeight: 600, color: 'gray' }}>Last 30 Days</span>, 
            value: [dayjs().add(-30, 'd'), dayjs()]

        },
        { 
            label: <span style={{ fontWeight: 600, color: 'gray' }}>Last 90 Days</span>, 
            value: [dayjs().add(-90, 'd'), dayjs()]

        },
        {
            label: (
                <Space>
                    <InputNumber
                        size="small"
                        // min={-365}
                        // max={365}
                        maxLength={String(inputDays)?.includes('-') ? 4 : 3}
                        placeholder={t('daysText')}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            const allowedKeys = [
                                'Backspace', 
                                'ArrowLeft', 
                                'ArrowRight', 
                                'Tab', 
                                'Delete'
                            ];
                            const isDigit = e.key >= '0' && e.key <= '9';
                            const isMinus = e.key === '-' && (e.currentTarget.value === '' || e.currentTarget.selectionStart === 0);
        
                            if (!isDigit && !isMinus && !allowedKeys.includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        value={inputDays}
                        onChange={handleCustomDaysChange}
                    />
                    <Tooltip title={t('customDatesTooltipText')}>
                        <InfoCircleOutlined />
                    </Tooltip>
                </Space>
            ),
            value: selectedRange ?? [dayjs(), dayjs()],
        },
    ] as TimeRangePickerProps['presets']

    return (
        <>
            <DatePicker.RangePicker 
                placement="bottomRight"
                format={Constant.dateFormat}
                defaultValue={[dayjs(), dayjs()]}
                onChange={rangeSelection}
                value={selectedRange}
                presets={rangePresets}
                onCalendarChange={handleDateSelection}
                placeholder={[t('fromText'), t('toText')]}
                onClick={() => setInputDays(undefined)}
            />
        </>
    );
};

export default RangePicker;