import { BarsOutlined, CloseOutlined, ColumnHeightOutlined, DownloadOutlined, 
    InfoCircleOutlined, 
    PrinterOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Badge, Button, Checkbox, Col, Dropdown, Empty, Input, InputNumber, List, 
    MenuProps, 
    Popover, Radio, Row, Segmented, Select, Space, Table, TableProps, Tooltip, Typography } from "antd";
import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";
import itemStore from "../../Store/itemStore";
import { t } from "i18next";
import { createStyles } from 'antd-style';
import Constant from "../../Global/Constant";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import globalStore from "../../Store/globalStore";
import html2pdf from 'html2pdf.js';
import Notification from "../../Global/Notification";
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import { ColumnsType } from "antd/es/table";

const useStyle = createStyles(({ css, token }) => {
    const antCls = '.ant';
    return {
      customTable: css`
        ${antCls}-table {
          ${antCls}-table-container {
            ${antCls}-table-body,
            ${antCls}-table-content {
              scrollbar-width: thin;
              scrollbar-color: unset;
              scroll-behavior: smooth;
            }
          }
        }
      `,
    };
});

interface DataTableProps {
    data: any;
    columns: TableProps<any>['columns'];
    getItems: () => void;
    exportFileName?: string;
}

interface RecordType {
    [key: string]: any;
}

const { Option } = Select;

export const DataTable: React.FC<DataTableProps> = ({ 
    data,
    columns,
    getItems,
    exportFileName = 'data',
}) => {
    const { Title, Text } = Typography;
    const { styles } = useStyle();

    const [itemData, setItemData] = useState<Array<RecordType>>([]);
    const [paginationConfig, setPaginationConfig] = useState<{ current: number, pageSize: number }>(
        { current: 1,  pageSize: Constant.paginationSize }
    );
    const [columnsSelectOpen, setColumnsSelectOpen] = useState<boolean>(false);
    const [checkedList, setCheckedList] = useState<string[]>([]);
    const [filters, setFilters] = useState<{ [key: string]: any }>({});
    const [size, setSize] = useState<"small" | "default" | "large">("default");

    const handleFilter = (
        columnKey: string,
        operator: string,
        value: string | null = null,
        confirm: () => void
    ) => {
        setFilters((prev) => ({
            ...prev,
            [columnKey]: { operator, value },
        }));
        confirm();
        setItemData(data);
    };
    
    const clearFilter = (columnKey: string, clearFilters: () => void) => {
        setFilters((prev) => {
            const newFilters = { ...prev };
            delete newFilters[columnKey];
            return newFilters;
        });
        clearFilters();
    };  

    const filterData = (data: RecordType[]) => {
        return data.filter((record) => {
            return Object.entries(filters).every(([columnKey, { operator, value }]) => {
                const columnValue = record[columnKey as keyof RecordType] ?? "";
    
                switch (operator) {
                    case "contains":
                        return String(columnValue).toLowerCase().includes((value ?? "").toLowerCase());
                    case "doesNotContain":
                        return !String(columnValue).toLowerCase().includes((value ?? "").toLowerCase());
                    case "equals":
                        return String(columnValue) === value;
                    case "doesNotEqual":
                        return String(columnValue) !== value;
                    case "startsWith":
                        return String(columnValue).toLowerCase().startsWith((value ?? "").toLowerCase());
                    case "endsWith":
                        return String(columnValue).toLowerCase().endsWith((value ?? "").toLowerCase());
                    case "isEmpty":
                        return columnValue === null || columnValue === undefined || columnValue === "";
                    case "isNotEmpty":
                        return columnValue !== null && columnValue !== undefined && columnValue !== "";
                    case "equalTo":
                        return columnValue === Number(value);
                    case "notEqualTo":
                        return columnValue !== Number(value);
                    case "greaterThan":
                        return columnValue > Number(value);
                    case "greaterThanOrEqualTo":
                        return columnValue >= Number(value);
                    case "lessThan":
                        return columnValue < Number(value);
                    case "lessThanOrEqualTo":
                        return columnValue <= Number(value);
                    default:
                        return true;
                }
            });
        });
    };

    const FilterDropdown = ({
        columnKey,
        columnType,
        setSelectedKeys,
        confirm,
        clearFilters,
        selectedKeys,
    }: {
        columnKey: string;
        columnType: string;
        setSelectedKeys: (keys: any[]) => void;
        confirm: () => void;
        clearFilters: () => void;
        selectedKeys: any[];
    }) => {
        const isEmptyOperators = ["isEmpty", "isNotEmpty"];
        const operators =
            columnType === "string"
                    ? [
                        { value: "contains", label: t('operators.containsText') },
                        { value: "doesNotContain", label:  t('operators.doesNotContainText') },
                        { value: "equals", label:  t('operators.equalsText') },
                        { value: "doesNotEqual", label:  t('operators.doesNotEqualText') },
                        { value: "startsWith", label:  t('operators.startsWithText') },
                        { value: "endsWith", label:  t('operators.endsWithText') },
                        { value: "isEmpty", label:  t('operators.isEmptyText') },
                        { value: "isNotEmpty", label:  t('operators.isNotEmptyText') },
                    ]
                    : columnType === "number" 
                    ? [
                        { value: "equalTo", label:  t('operators.equalToText') },
                        { value: "notEqualTo", label:  t('operators.notEqualToText') },
                        { value: "greaterThan", label:  t('operators.greaterThanText') },
                        { value: "greaterThanOrEqualTo", label:  t('operators.greaterThanOrEqualToText') },
                        { value: "lessThan", label:  t('operators.lessThanText') },
                        { value: "lessThanOrEqualTo", label:  t('operators.lessThanOrEqualToText') },
                        { value: "isEmpty", label:  t('operators.isEmptyText') },
                        { value: "isNotEmpty", label:  t('operators.isNotEmptyText') },
                    ]
                : [];
        
        const selectedFilter = selectedKeys[0] || { operator: null, value: null };

        useEffect(() => {
            if (!selectedFilter.operator && operators.length > 0) {
                setSelectedKeys([{ ...selectedFilter, operator: operators[0].value }]);
            }
        }, [selectedFilter.operator, operators, setSelectedKeys]);

        return (
            <div style={{ padding: 8 }}>
                <Space direction="vertical">
                    <Select
                        placeholder={t('operatorText')}
                        style={{ width: 180 }}
                        value={selectedFilter.operator || null}
                        onChange={(value) =>
                            setSelectedKeys([{ ...selectedFilter, operator: value }])
                        }
                    >
                        {operators.map((op) => (
                            <Option key={op.value} value={op.value}>
                                {op.label}
                            </Option>
                        ))}
                    </Select>
                    {!isEmptyOperators.includes(selectedFilter.operator) && (
                        <Input
                            placeholder={t('valueText')}
                            value={selectedFilter.value || ""}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                if (columnType === "number") {
                                    const numericValue = inputValue
                                        .replace(/[^0-9.-]/g, '')
                                        .replace(/(?!^)-/g, '')
                                        .replace(/(\..*?)\./g, '$1');
                                    setSelectedKeys([{ ...selectedFilter, value: numericValue }]);
                                } else {
                                    setSelectedKeys([{ ...selectedFilter, value: e.target.value }]);
                                }
                            }}
                            style={{ width: 180 }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setSelectedKeys([{ ...selectedFilter, value: e.currentTarget.value }]);
                                    handleFilter(
                                        columnKey,
                                        selectedFilter.operator || "",
                                        selectedFilter.value || "",
                                        confirm
                                    );
                                }
                            }}
                        />
                    )}
                    <Space style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: '7px' 
                    }}
                    >
                        <Button
                            onClick={() => {
                                clearFilter(columnKey, clearFilters);
                                confirm();
                            }}
                            size="small"
                            type="link"
                            // style={{ width: 65 }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                handleFilter(
                                    columnKey,
                                    selectedFilter.operator || "",
                                    selectedFilter.value || "",
                                    confirm
                                );
                            }}
                            size="small"
                            // style={{ width: 65 }}
                        >
                            OK
                        </Button>
                    </Space>
                </Space>
            </div>
        );
    };

    const getFilterDropdown = (columnKey: string, columnType: string) => {
        return (props: any) => <FilterDropdown columnKey={columnKey} columnType={columnType} {...props} />;
    };

    const handleSelectColumn = (e: any, columnKey: string) => {
        const isChecked = e.target.checked;

        if (!isChecked) {
            setCheckedList([...checkedList, columnKey]);
        } else {
            setCheckedList(checkedList.filter(key => key !== columnKey));
        }
    };

    const mapColumns = (columns: ColumnsType<RecordType>): ColumnsType<RecordType> => {
        return columns.map((column: any) => {
            const inferColumnType = (dataIndex: string) => {
                const sampleValue = itemData.find(item => item[dataIndex] !== undefined)?.[dataIndex];
                if (typeof sampleValue === "number") {
                    return "number";
                }
                if (typeof sampleValue === "string") {
                    return "string";
                }
                if (typeof sampleValue === "boolean") {
                    return "boolean";
                }
                return "string";
            };
    
            if (column.filters) {
                const columnType = column.type || inferColumnType(column.dataIndex);
    
                if (columnType === "boolean") {
                    return {
                        ...column,
                        onFilter: (value: any, record: any) => record[column.dataIndex] === value,
                        ellipsis: column.ellipsis ?? true,
                    };
                }
    
                return {
                    ...column,
                    filterDropdown: getFilterDropdown(column.key, columnType),
                    ellipsis: column.ellipsis ?? true,
                };
            }

            if (column.children && column.children.length > 0) {
                return {
                    ...column,
                    children: mapColumns(column.children),
                };
            }

            return {
                ...column,
                hidden: checkedList.includes(column.key),
            };
        });
    };
    
    const mappedColumns = mapColumns(columns || []);    

    const items = columns?.flatMap((column: any, index: number) => 
        column.children ? (
            column.children.map((child: any, childIndex: number) => ({
                label: (
                    <span>
                        <Checkbox
                        checked={!checkedList.includes(child.key)}
                        key={child.key}
                        onChange={(e) => handleSelectColumn(e, child.key)}>
                            {child.title}
                        </Checkbox>
                    </span>
                ),
                key: `${index}-${childIndex}`,
            }))
        ) : [{
            label: (
                <span>
                    <Checkbox
                    checked={!checkedList.includes(column.key)}
                    key={column.key}
                    onChange={(e) => handleSelectColumn(e, column.key)}>
                        {column.title}
                    </Checkbox>
                </span>
            ),
            key: index.toString(),
        }]
    );
    
    const newColumns = mappedColumns?.map((item: any) => {
        if (item.children && item.children.length > 0) {
          const allChildrenHidden = item.children.every((child: any) => checkedList.includes(child.key));
      
          return {
            ...item,
            hidden: allChildrenHidden,
            children: item.children.map((child: any) => ({
              ...child,
              hidden: checkedList.includes(child.key),
            })),
          };
        }
      
        return {
          ...item,
          hidden: checkedList.includes(item.key as string),
        };
    });
    
    useEffect(() => {
        setItemData(data);
    }, [data, getItems, checkedList]);

    const handleDataSearch = (e: any) => {
        const searchValue = e.target.value.toLowerCase();
        const customHeaders = getCustomHeaders(columns);
        const enabledKeys = customHeaders
            .flatMap(header => {
                if (header.children && header.children.length > 0) {
                    return header.children.map(child => child.key);
                }
                return header.key;
            });
    
        const filteredData = data.filter((item: any) => {
            return enabledKeys.some(key => {
                const val = item[key];
                return typeof val === 'string' || typeof val === 'number'
                    ? val.toString().toLowerCase().includes(searchValue)
                    : false;
            });
        });
    
        setItemData(filteredData);
    };
    

    const handleShowSizeChange = (current: number, size: number) => {
        setPaginationConfig({ current, pageSize: size });
    };

    const exportToCSV = () => {
        const customHeaders: any[] = getCustomHeaders(columns);
    
        const formattedData = filterData(itemData).map((row: any) => {
            const newRow: Record<string, any> = {};
    
            customHeaders.forEach(header => {
                if (header.children && header.children.length > 0) {
                    header.children.forEach((child: any) => {
                        newRow[child.title] = Array.isArray(row[child.dataIndex]) ? JSON.stringify(row[child.dataIndex]) : row[child.dataIndex];
                    });
                } else {
                    newRow[header.label] = Array.isArray(row[header.key]) ? JSON.stringify(row[header.key]) : row[header.key];
                }
            });
    
            return newRow;
        });
    
        const parentHeaderRow: string[] = [];
        const childHeaderRow: string[] = [];
    
        customHeaders.forEach(header => {
            if (header.children && header.children.length > 0) {
                parentHeaderRow.push(...Array(header.children.length).fill(header.label));
                childHeaderRow.push(...header.children.map((child: any) => child.title));
            } else {
                parentHeaderRow.push(header.label);
                childHeaderRow.push('');
            }
        });
    
        const dataRows = formattedData.map(row => {
            const dataRow: string[] = [];
            
            customHeaders.forEach(header => {
                if (header.children && header.children.length > 0) {
                    header.children.forEach((child: any) => {
                        dataRow.push(row[child.title] || '');
                    });
                } else {
                    dataRow.push(row[header.label] || '');
                }
            });
    
            return dataRow;
        });
    
        const csvData = [
            parentHeaderRow,
            childHeaderRow,
            ...dataRows
        ];

        const csv = Papa.unparse(csvData);
    
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${exportFileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };    

    const exportToExcel = () => {
        const customHeaders: any[] = getCustomHeaders(columns);

        const formattedData = filterData(itemData).map((row: any) => {
            const newRow: Record<string, any> = {};

            customHeaders.forEach(header => {
                if (header.children && header.children.length > 0) {
                    header.children.forEach((child: any) => {
                        newRow[child.title] = Array.isArray(row[child.dataIndex]) ? JSON.stringify(row[child.dataIndex]) : row[child.dataIndex];
                    });
                } else {
                    newRow[header.label] = Array.isArray(row[header.key]) ? JSON.stringify(row[header.key]) : row[header.key];
                }
            });

            return newRow;
        });

        const ws = XLSX.utils.json_to_sheet(formattedData);

        const merges: XLSX.Range[] = [];
        let currentCol = 0;

        customHeaders.forEach(header => {
            if (header.children && header.children.length > 0) {
                const colspan = header.children.length;
                merges.push({
                    s: { r: 0, c: currentCol },
                    e: { r: 0, c: currentCol + colspan - 1 }
                });
                currentCol += colspan;
            } else {
                currentCol++;
            }
        });

        ws['!merges'] = merges;

        const parentHeaderRow: string[] = [];
        const childHeaderRow: string[] = [];

        customHeaders.forEach(header => {
            if (header.children && header.children.length > 0) {
                parentHeaderRow.push(...Array(header.children.length).fill(header.label));
                childHeaderRow.push(...header.children.map((child: any) => child.title));
            } else {
                parentHeaderRow.push(header.label);
                childHeaderRow.push('');
            }
        });

        try {
            XLSX.utils.sheet_add_aoa(ws, [parentHeaderRow], { origin: 'A1' });
            XLSX.utils.sheet_add_aoa(ws, [childHeaderRow], { origin: 'A2' });

            XLSX.utils.sheet_add_json(ws, formattedData, { origin: 'A3', skipHeader: true });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
            XLSX.writeFile(wb, `${exportFileName}.xlsx`);
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('errorGenerateExcel')
            });
        }
    };

    const exportToPDF = () => {
        const customHeaders = getCustomHeaders(columns);

        let html = '<html><head><title>Data</title></head><body>';
        html += '<h1>Data</h1>';
        html += '<table border="1" style="border-collapse: collapse;">';

        html += '<tr>';
        customHeaders.forEach(header => {
            if (header.children && header.children.length > 0) {
                const colspan = header.children.length;
                html += `<th colspan="${colspan}" style="padding: 5px;">${header.label}</th>`;
            } else {
                html += `<th rowspan="2" style="padding: 5px;">${header.label}</th>`;
            }
        });
        html += '</tr>';

        html += '<tr>';
        customHeaders.forEach(header => {
            if (header.children && header.children.length > 0) {
                header.children.forEach((child: any) => {
                    html += `<th style="padding: 5px;">${child.title}</th>`;
                });
            }
        });
        html += '</tr>';

        if (filterData(itemData).length === 0) {
            html += '<tr>';
            html += `<td colspan="${customHeaders.length}" style="padding: 5px; text-align: center;">No data available</td>`;
            html += '</tr>';
        } else {
            filterData(itemData).forEach((item: any) => {
                html += '<tr>';
                customHeaders.forEach(header => {
                    if (header.children && header.children.length > 0) {
                        header.children.forEach((child: any) => {
                            const value = item[child.dataIndex];
                            const displayValue = Array.isArray(value) ? JSON.stringify(value) : value;
                            html += `<td style="padding: 5px;">${displayValue}</td>`;
                        });
                    } else {
                        const value = item[header.key];
                        const displayValue = Array.isArray(value) ? JSON.stringify(value) : value;
                        html += `<td style="padding: 5px;">${displayValue}</td>`;
                    }
                });
                html += '</tr>';
            });
        }

        html += '</table>';
        html += '</body></html>';
        const element = document.createElement('div');
        element.innerHTML = html;
        document.body.appendChild(element);

        const opt = {
            margin:       0.5,
            filename:     `${exportFileName}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
        };

        html2pdf().from(element).set(opt).save().then(() => {
            document.body.removeChild(element);
        }).catch((error: any) => {
            Notification.error({
                message: t('error'),
                description: t('errorGeneratePDF')
            });
            document.body.removeChild(element);
        });
    };

    
    const getCustomHeaders = (
        columns?: TableProps<any>['columns']
    ): { key: keyof any; label: string; children?: any[] }[] => {
        if (!columns) {
            return [];
        }
    
        const headers: { key: keyof any; label: string; children?: any[] }[] = columns
            .map((column: any) => {
                if (column.children && column.children.length > 0) {
                    const visibleChildren = column.children.filter(
                        (child: any) => !checkedList.includes(child.dataIndex)
                    );
    
                    if (visibleChildren.length > 0) {
                        return {
                            key: column.dataIndex as keyof any,
                            label: column.title as string,
                            children: visibleChildren,
                        };
                    } else {
                        return null;
                    }
                } else {
                    if (!checkedList.includes(column.dataIndex)) {
                        return {
                            key: column.dataIndex as keyof any,
                            label: column.title as string,
                        };
                    } else {
                        return null;
                    }
                }
            })
            .filter((header): header is { key: keyof any; label: string; children?: any[] } => header !== null);
    
        return headers;
    };
    
    const printData = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print</title></head><body>');
            printWindow.document.write(`<h1>${exportFileName}</h1>`);
            printWindow.document.write('<table border="1" style="border-collapse: collapse;">');
    
            const customHeaders = getCustomHeaders(columns);
    
            printWindow.document.write('<tr>');
            customHeaders.forEach(header => {
                if (header.children && header.children.length > 0) {
                    const colspan = header.children.length;
                    printWindow.document.write(`<th colspan="${colspan}" style="padding: 5px;">${header.label}</th>`);
                } else {
                    printWindow.document.write(`<th rowspan="2" style="padding: 5px;">${header.label}</th>`);
                }
            });
            printWindow.document.write('</tr>');
    
            printWindow.document.write('<tr>');
            customHeaders.forEach(header => {
                if (header.children && header.children.length > 0) {
                    header.children.forEach((child: any) => {
                        printWindow.document.write(`<th style="padding: 5px;">${child.title}</th>`);
                    });
                }
            });
            printWindow.document.write('</tr>');
    
            filterData(itemData).forEach((item: any) => {
                printWindow.document.write('<tr>');
                customHeaders.forEach(header => {
                    if (header.children && header.children.length > 0) {
                        header.children.forEach((child: any) => {
                            const value = item[child.dataIndex];
                            const displayValue = Array.isArray(value) ? JSON.stringify(value) : value;
                            printWindow.document.write(`<td style="padding: 5px;">${displayValue}</td>`);
                        });
                    } else {
                        const value = item[header.key];
                        const displayValue = Array.isArray(value) ? JSON.stringify(value) : value;
                        printWindow.document.write(`<td style="padding: 5px;">${displayValue}</td>`);
                    }
                });
                printWindow.document.write('</tr>');
            });
    
            printWindow.document.write('</table>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    
    const closeColumnSelectPopover = () => {
        setColumnsSelectOpen(false);
    };

    const handleColumnsSelectOpen = (newOpen: boolean) => {
        setColumnsSelectOpen(newOpen);
    };

    const getRowClassName = (record: any) => {
        return record?.active === 1 || record?.active ? 'active-row' : 'inactive-row';
    };

    const exportOptions: MenuProps['items'] = [
        {
          label: <Tooltip title={t('exportCSVText')}>{t('csvText')}</Tooltip>,
          key: 'csv',
          onClick: exportToCSV,
        },
        {
          label:  <Tooltip title={t('exportExcelText')}>{t('excelText')}</Tooltip>,
          key: 'excel',
          onClick: exportToExcel,
        },
        {
          label:  <Tooltip title={t('exportPDFText')}>{t('pdfText')}</Tooltip>,
          key: 'pdf',
          onClick: exportToPDF,
        },
    ];

    const exportMenuProps = {
        items: exportOptions,
    };
    
    return (
            <>
                <Table<any> 
                className={styles.customTable}
                scroll={{ x: 'max-content',  y: 55 * 5 }}
                columns={newColumns} 
                dataSource={filterData(itemData)}
                bordered
                rowClassName={getRowClassName}
                locale={{
                    emptyText: (
                      <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('noDataText')}
                      />
                    )
                  }}
                pagination={{ 
                    current: paginationConfig.current,
                    pageSize: paginationConfig.pageSize, 
                    total: filterData(itemData).length,
                    showTotal: (total) => `Total ${total} items`,
                    showSizeChanger: true,
                    onShowSizeChange: (current, size) => {
                        handleShowSizeChange(current, size);
                    },
                    hideOnSinglePage: true
                }}
                title={() => (
                    <Row gutter={[16, 8]}>
                        <Col lg={3} md={4} sm={12} xs={12}>
                            <Button
                                size={size === 'default' ? undefined : size}
                                onClick={() => getItems()}
                                style={{ color: globalStore.darkTheme ? '#fff' : undefined }}
                                block
                                variant="filled"
                                color="default"
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
                                    <ReloadOutlined />
                                    <span>{t('reloadText')}</span>
                                </span>
                                <Tooltip title={t('reloadTooltipText')}>
                                    <InfoCircleOutlined />
                                </Tooltip>
                            </Button>
                        </Col>
                        <Col lg={4} md={5} sm={12} xs={12}>
                            <div>
                                <Popover
                                placement="bottom"
                                content={
                                    <div>
                                        <List
                                        style={{ height: 200, overflowY: 'auto' }}
                                        size="small"
                                        bordered
                                        dataSource={items}
                                        renderItem={(item: any, index: number) => (
                                            <List.Item key={item.key}>
                                            <List.Item.Meta
                                                title={item.label}
                                            />
                                            </List.Item>
                                        )}
                                        />
                                        <div style={{ textAlign: 'center', marginTop: 10 }}>
                                            <Button block 
                                            style={{ height: '25px' }}
                                            onClick={() => {
                                                setCheckedList([]);
                                                setColumnsSelectOpen(false);
                                            }}
                                            >
                                                {t('resetText')}
                                            </Button>
                                        </div>
                                    </div>
                                }
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ marginRight: 8 }}>{t('showHideColumnsText')}</span>
                                        <span onClick={closeColumnSelectPopover}>
                                            <CloseOutlined style={{ cursor: 'pointer', fontSize: '12px' }} />
                                        </span>
                                    </div>
                                }
                                trigger="click"
                                open={columnsSelectOpen}
                                onOpenChange={handleColumnsSelectOpen}
                                arrow={false}
                                >
                                    <Button
                                        size={size === 'default' ? undefined : size}
                                        style={{ color: globalStore.darkTheme ? '#fff' : undefined }}
                                        block
                                        variant="filled"
                                        color="default"
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
                                            <Badge dot={checkedList.length > 0}>
                                                <BarsOutlined />
                                            </Badge>
                                            <span>{t('columnsText')}</span>
                                        </span>
                                        <Tooltip title={t('showHideColumnsText')}>
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </Button>
                                </Popover>
                            </div>
                        </Col>
                        <Col lg={4} md={5} sm={12} xs={12}>
                            <Dropdown menu={exportMenuProps}>
                                <Button
                                    size={size === 'default' ? undefined : size}
                                    style={{ color: globalStore.darkTheme ? '#fff' : undefined }}
                                    block
                                    variant="filled"
                                    color="default"
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
                                        <DownloadOutlined />
                                        <span>{t('downloadText')}</span>
                                    </span>
                                    <Tooltip title={t('downloadTooltipText')}>
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </Button>
                            </Dropdown>
                        </Col>
                        <Col lg={3} md={4} sm={12} xs={12}>
                            <Button
                                size={size === 'default' ? undefined : size}
                                style={{ color: globalStore.darkTheme ? '#fff' : undefined }}
                                onClick={printData}
                                block
                                variant="filled"
                                color="default"
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
                                    <PrinterOutlined />
                                    <span>{t('printText')}</span>
                                </span>
                                <Tooltip title={t('printTooltipText')}>
                                    <InfoCircleOutlined />
                                </Tooltip>
                            </Button>
                        </Col>
                        <Col lg={6} md={6} sm={24} xs={24}>
                            <Segmented
                            options={[
                                {
                                    label: <div style={{ padding: 1, display: 'flex', gap: 6 }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('smallText')}</span>
                                                <Tooltip title={t('densitySmallTooltipText')} ><InfoCircleOutlined style={{ marginTop: 2 }} /></Tooltip>
                                            </div>,
                                    value: 'small'
                                },
                                {
                                    label: <div style={{ padding: 1, display: 'flex', gap: 6 }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('defaultText')}</span>
                                                <Tooltip title={t('densityDefaultTooltipText')} ><InfoCircleOutlined style={{ marginTop: 2 }} /></Tooltip>
                                            </div>,
                                    value: 'default'
                                },
                                {
                                    label: <div style={{ padding: 1, display: 'flex', gap: 6 }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('largeText')}</span>
                                                <Tooltip title={t('densityLargeTooltipText')} ><InfoCircleOutlined style={{ marginTop: 2 }} /></Tooltip>
                                            </div>,
                                    value: 'large'
                                },
                            ]}
                            size={size === 'default' ? undefined : size}
                            value={size}
                            onChange={(value: any) => setSize(value)}
                            block
                            />
                        </Col>
                        {/* <Col lg={1}></Col> */}
                        <Col lg={4} md={24} sm={24} xs={24}>
                            <div>
                                <Input 
                                placeholder={t('searchText')+'...'} 
                                prefix={<SearchOutlined />}
                                size={size === 'default' ? undefined : size}
                                onChange={handleDataSearch}
                                />
                            </div>
                        </Col>
                    </Row>
                )}
                // footer={() => 'Footer'}
                size={size === 'default' ? 'middle' : size}
                />
            </>
    );
};

export default inject('globalStore')(observer(DataTable));