import { DatePicker, Form, InputNumber, Space, TimeRangePickerProps, Tooltip } from "antd";
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
    maxDate?: Dayjs | boolean;
    minDate?: Dayjs | boolean;
};

const RangePicker: React.FC<RangePickerProps> = ({
    dateRange,
    handleRangeSelection,
    maxDate = false,
    minDate = false
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
                let fromDate = dayjs(referenceDate).add(days, 'd').startOf('day');
                let toDate = dayjs(referenceDate).endOf('day');

                if (dayjs.isDayjs(minDate) && fromDate.isBefore(minDate, 'day')) {
                    fromDate = minDate.startOf('day');
                }

                newRange = [fromDate, toDate];
            } else {
                let fromDate = dayjs(referenceDate).startOf('day');
                let toDate = dayjs(referenceDate).add(days, 'd').endOf('day');

                if (dayjs.isDayjs(maxDate) && toDate.isAfter(maxDate, 'day')) {
                    toDate = maxDate.endOf('day');
                }

                newRange = [fromDate, toDate];
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
            label: <span style={{ fontSize: 12 }}>Today</span>, 
            value: [
                    (dayjs.isDayjs(minDate) && dayjs().startOf('day').isBefore(minDate, 'day')) ? minDate.startOf('day') : dayjs().startOf('day'), 
                    (dayjs.isDayjs(maxDate) && dayjs().endOf('day').isAfter(maxDate, 'day')) ? maxDate.endOf('day') : dayjs().endOf('day')
                ] 
        },
        { 
            label: <span style={{ fontSize: 12 }}>Yesterday</span>, 
            value: [
                    (dayjs.isDayjs(minDate) && dayjs().add(-1, 'd').startOf('day').isBefore(minDate, 'day')) ? minDate.startOf('day') : dayjs().add(-1, 'd').startOf('day'),
                    (dayjs.isDayjs(maxDate) && dayjs().add(-1, 'd').endOf('day').isAfter(maxDate, 'day')) ? maxDate.endOf('day') : dayjs().add(-1, 'd').endOf('day'),
                ] 
        },
        { 
            label: <span style={{ fontSize: 12 }}>This Week</span>, 
            value: [
                    (dayjs.isDayjs(minDate) && dayjs().startOf('week').isBefore(minDate, 'day')) ? minDate.startOf('day') : dayjs().startOf('week'), 
                    (dayjs.isDayjs(maxDate) && dayjs().endOf('week').isAfter(maxDate, 'day')) ? maxDate.endOf('day') : dayjs().endOf('week')
                ] 
        
        },
        { 
            label: <span style={{ fontSize: 12 }}>This Month</span>,
            value: [
                    (dayjs.isDayjs(minDate) && dayjs().startOf('month').isBefore(minDate, 'day')) ? minDate.startOf('day') : dayjs().startOf('month'),
                    (dayjs.isDayjs(maxDate) && dayjs().endOf('month').isAfter(maxDate, 'day')) ? maxDate.endOf('day') : dayjs().endOf('month')
                ]

        },
        { 
            label: <span style={{ fontSize: 12 }}>Last 7 Days</span>, 
            value: [
                    (dayjs.isDayjs(minDate) && dayjs().add(-6, 'd').startOf('day').isBefore(minDate, 'day')) ? minDate.startOf('day') : dayjs().add(-6, 'd').startOf('day'),
                    (dayjs.isDayjs(maxDate) && dayjs().endOf('day').isAfter(maxDate, 'day')) ? maxDate.endOf('day') : dayjs().endOf('day')
                ]

        },
        { 
            label: <span style={{ fontSize: 12 }}>Last 14 Days</span>, 
            value: [
                    (dayjs.isDayjs(minDate) && dayjs().add(-13, 'd').startOf('day').isBefore(minDate, 'day')) ? minDate.startOf('day') : dayjs().add(-13, 'd').startOf('day'),
                    (dayjs.isDayjs(maxDate) && dayjs().endOf('day').isAfter(maxDate, 'day')) ? maxDate.endOf('day') : dayjs().endOf('day')
                ]

        },
        { 
            label: <span style={{ fontSize: 12 }}>Last 30 Days</span>, 
            value: [
                    (dayjs.isDayjs(minDate) && dayjs().add(-29, 'd').startOf('day').isBefore(minDate, 'day')) ? minDate.startOf('day') : dayjs().add(-29, 'd').startOf('day'),
                    (dayjs.isDayjs(maxDate) && dayjs().endOf('day').isAfter(maxDate, 'day')) ? maxDate.endOf('day') : dayjs().endOf('day')
                ]

        },
        { 
            label: <span style={{ fontSize: 12 }}>Last 90 Days</span>, 
            value: [
                    (dayjs.isDayjs(minDate) && dayjs().add(-89, 'd').startOf('day').isBefore(minDate, 'day')) ? minDate.startOf('day') : dayjs().add(-89, 'd').startOf('day'),
                    (dayjs.isDayjs(maxDate) && dayjs().endOf('day').isAfter(maxDate, 'day')) ? maxDate.endOf('day') : dayjs().endOf('day')
                ]

        },
        {
            label: (
                <Form.Item
                    validateStatus={inputDays !== undefined && (
                        (dayjs.isDayjs(maxDate) && inputDays > maxDate.diff(dayjs(), 'days')) ||
                        (dayjs.isDayjs(minDate) && inputDays < minDate.diff(dayjs(), 'days'))
                    ) ? "error" : ""}
                    help={
                        <span style={{ fontSize: 10 }}>
                            {inputDays !== undefined && (
                                (dayjs.isDayjs(maxDate) && inputDays > maxDate.diff(dayjs(), 'days')) 
                                    ? t('maxError') + dayjs(maxDate).format('DD-MM-YYYY')
                                : (dayjs.isDayjs(minDate) && inputDays < minDate.diff(dayjs(), 'days')) 
                                    ? t('minError') + dayjs(minDate).format('DD-MM-YYYY')
                                : null
                            )}
                        </span>
                    }
                >
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
                        status={inputDays !== undefined && (
                            (dayjs.isDayjs(maxDate) && inputDays > maxDate.diff(dayjs(), 'days')) ||
                            (dayjs.isDayjs(minDate) && inputDays < minDate.diff(dayjs(), 'days'))
                        ) ? "error" : ""}
                        onChange={handleCustomDaysChange}
                    />
                    <Tooltip title={t('customDatesTooltipText')}>
                        <InfoCircleOutlined />
                    </Tooltip>
                </Space>
                </Form.Item>
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
                disabledDate={(current) => {
                    if (dayjs.isDayjs(maxDate) && current.isAfter(maxDate, 'day')) {
                        return true;
                    }
                    if (dayjs.isDayjs(minDate) && current.isBefore(minDate, 'day')) {
                        return true;
                    }
                    return false;
                }}

            />
        </>
    );
};

export default RangePicker;