import { BarsOutlined, CloseOutlined, DownloadOutlined, 
    PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { Badge, Button, Checkbox, Col, Empty, Input, List, 
    Popover, Row, Table, TableProps, Tooltip, Typography } from "antd";
import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";
import itemStore from "../../Store/itemStore";
import { t } from "i18next";
import { createStyles } from 'antd-style';
import { IconButton } from "@mui/material";
import ReplayIcon from '@mui/icons-material/Replay';
import Constant from "../../Global/Constant";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import globalStore from "../../Store/globalStore";
import html2pdf from 'html2pdf.js';
import Notification from "../../Global/Notification";
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';

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

export const DataTable: React.FC<DataTableProps> = ({ 
    data,
    columns,
    getItems,
    exportFileName = 'data',
}) => {
    const { Title, Text } = Typography;
    const { styles } = useStyle();

    const [itemData, setItemData] = useState<Array<any>>([]);
    const [paginationConfig, setPaginationConfig] = useState<{ current: number, pageSize: number }>(
        { current: 1,  pageSize: Constant.paginationSize }
    );
    const [columnsSelectOpen, setColumnsSelectOpen] = useState<boolean>(false);
    const [checkedList, setCheckedList] = useState<string[]>([]);

    const handleSelectColumn = (e: any, columnKey: string) => {
        const isChecked = e.target.checked;

        if (!isChecked) {
            setCheckedList([...checkedList, columnKey]);
        } else {
            setCheckedList(checkedList.filter(key => key !== columnKey));
        }
    };

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
    
    const newColumns = columns?.map((item: any) => {
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
    
        const formattedData = itemData.map((row: any) => {
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

        const formattedData = itemData.map((row: any) => {
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

        if (itemData.length === 0) {
            html += '<tr>';
            html += `<td colspan="${customHeaders.length}" style="padding: 5px; text-align: center;">No data available</td>`;
            html += '</tr>';
        } else {
            itemData.forEach((item: any) => {
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
    
            itemData.forEach((item: any) => {
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
    
    return (
            <>
                <Table<any> 
                className={styles.customTable}
                scroll={{ x: 'max-content',  y: 55 * 5 }}
                columns={newColumns} 
                dataSource={itemData}
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
                    total: itemData.length,
                    showTotal: (total) => `Total ${total} items`,
                    showSizeChanger: true,
                    onShowSizeChange: (current, size) => {
                        handleShowSizeChange(current, size);
                    },
                    hideOnSinglePage: true
                }}
                title={() => (
                    <Row gutter={[16, 4]}>
                        <Col lg={8}>
                            <div>
                                <Tooltip title={t('showHideColumnsText')} >
                                    <Popover
                                    placement="bottom"
                                    content={
                                        <>
                                            <List
                                            footer={
                                                <Button block 
                                                style={{ height: '25px' }}
                                                onClick={() => setCheckedList([])}
                                                >
                                                    {t('resetText')}
                                                </Button>
                                            }
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
                                        </>
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
                                        <Badge dot={checkedList.length > 0}>
                                            <IconButton
                                            size="small"
                                            style={{ color: globalStore.darkTheme ? '#fff' : undefined }}
                                            >
                                                <BarsOutlined />
                                            </IconButton>
                                        </Badge>
                                    </Popover>
                                </Tooltip>
                                <Tooltip title={t('reloadText')} >
                                    <IconButton
                                    size="small"
                                    onClick={()=> getItems()}
                                    style={{ color: globalStore.darkTheme ? '#fff' : undefined }}
                                    >
                                        <ReplayIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </Col>
                        <Col lg={10}>
                            <Row gutter={[16, 6]}>
                                <Col lg={6} xs={12}>
                                <Tooltip title={t('exportCSVText')} >
                                    <Button size="small"
                                    block 
                                    variant="dashed"
                                    color="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={exportToCSV}
                                    style={{ marginRight: 5 }}
                                    >
                                        {t('csvText')}
                                    </Button>
                                </Tooltip>
                                </Col>
                                <Col lg={6} xs={12}>
                                <Tooltip title={t('exportExcelText')} >
                                    <Button size="small"
                                    block
                                    variant="dashed"
                                    color="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={exportToExcel}
                                    style={{ marginRight: 5 }}
                                    >
                                        {t('excelText')}
                                    </Button>
                                </Tooltip>
                                </Col>
                                <Col lg={6} xs={12}>
                                <Tooltip title={t('exportPDFText')} >
                                    <Button size="small"
                                    block
                                    variant="dashed"
                                    color="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={exportToPDF}
                                    style={{ marginRight: 5 }}
                                    >
                                        {t('pdfText')}
                                    </Button>
                                </Tooltip>
                                </Col>
                                <Col lg={6} xs={12}>
                                <Tooltip title={t('printText')} >
                                    <Button size="small"
                                    block
                                    variant="dashed"
                                    color="primary"
                                    icon={<PrinterOutlined />}
                                    onClick={printData}
                                    >
                                        {t('printText')}
                                    </Button>
                                </Tooltip>
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6}>
                            <div>
                                <Input 
                                placeholder={t('searchText')} 
                                prefix={<SearchOutlined />}
                                size="small"
                                onChange={handleDataSearch}
                                />
                            </div>
                        </Col>
                    </Row>
                )}
                // footer={() => 'Footer'}
                size="small"
                />
            </>
    );
};

export default inject('globalStore')(observer(DataTable));