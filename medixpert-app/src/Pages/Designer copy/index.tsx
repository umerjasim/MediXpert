import React, { ReactNode, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button, Card, Col, Dropdown, Input, InputNumber, List, Menu, MenuProps, Popover, Row, Segmented, Select, Space, Tag, Upload } from "antd";
import { CloseOutlined, LaptopOutlined, NotificationOutlined, TableOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import TitleIcon from '@mui/icons-material/Title';
import Title from "antd/es/typography/Title";
import { t } from "i18next";

const mmToPx = (mm: number) => mm * 3.7795275591;

const CanvasEditor = () => {
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popoverData, setPopoverData] = useState<{ visible: boolean; title: ReactNode; content: ReactNode }>({
        visible: false,
        title: null,
        content: null,
    });
    const [pageSize, setPageSize] = useState<{ type: string; height: number | null, width: number | null }>({ type: '', height: null, width: null });
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [elementSelection, setElementSelection] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState<number | "">("");
    // const [selectedRows, setSelectedRows] = useState(1);
    // const [selectedCols, setSelectedCols] = useState(1);

    const handleMouseEnterMenuItem = (event: any) => {
        let title: ReactNode = null;
        let content: ReactNode = null;
        if (event && event.key) {
            title = createTitle(event.key);
            content = createContent(event.key);
            setPopoverData({ visible: true, title, content });
        } else {
            setPopoverData({ visible: false, title: '', content: null });
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        const popoverElement = document.querySelector(".ant-popover") as HTMLElement;
        if (
            popoverElement && 
            !popoverElement.contains(event.target as Node)
        ) {
            setPopoverData((prev) => ({ ...prev, visible: false }));
        }
    };

    useEffect(() => {
        const canvas = new fabric.Canvas("editorCanvas", {
            backgroundColor: "#fff",
            width: pageSize.width || undefined,
            height: pageSize.height || undefined,
        });
        canvasRef.current = canvas;
        canvas.selection = true;
        canvas.selectionKey = 'ctrlKey';

        canvas.on('selection:created', () => {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length > 0) {
                setElementSelection('text');
                const fontSizes = activeObjects.filter((obj) => obj.isType('i-text')).map((obj: any) => obj.fontSize || 16);
                setFontSize(fontSizes.length > 0 ? fontSizes[0] : "");
            }
        });

        canvas.on('selection:updated', () => {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length > 0) {
                setElementSelection('text');
                const fontSizes = activeObjects.filter((obj) => obj.isType('i-text')).map((obj: any) => obj.fontSize || 16);
                setFontSize(fontSizes.length > 0 ? fontSizes[0] : "");
            }
        });

        canvas.on('selection:cleared', () => {
            setElementSelection(null);
            setFontSize("");
        });

        canvas.on('object:modified', () => {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length > 0) {
                const fontSizes = activeObjects.filter((obj) => obj.isType('i-text')).map((obj: any) => obj.fontSize || 16);
                setFontSize(fontSizes.length > 0 ? fontSizes[0] : "");
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" || event.key === "Delete") {
                const activeObjects = canvas.getActiveObjects();
                if (activeObjects.length > 0) {
                    activeObjects.forEach((obj) => canvas.remove(obj));
                    canvas.discardActiveObject();
                    canvas.renderAll();
                }
            }
        });

        return () => {
            canvas.dispose();
        };
    }, [pageSize]);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.selection = true;
            canvasRef.current.selectionKey = "ctrlKey";
        }
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.on("object:scaling", (event) => {
                const activeObject = event.target as fabric.IText;
    
                if (activeObject && activeObject.isType("i-text")) {
                    const newFontSize = Math.round(((activeObject.fontSize || 16) * activeObject.scaleX!) * 10) / 10;

                    activeObject.set({ fontSize: newFontSize });
                    activeObject.set({ scaleX: 1, scaleY: 1 });
                    activeObject.setCoords();
                    canvasRef.current?.renderAll();
                    setTimeout(() => {
                        setFontSize(newFontSize);
                    }, 100);
                }
            });
        }
    }, []);    

    useEffect(() => {
        if (popoverData.visible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [popoverData.visible]);

    const addText = (textType: number) => {
        if (!canvasRef.current) return; // Ensure canvas is available
    
        const textOptions: Record<number, { fontSize: number; text: string }> = {
            1: { fontSize: 32, text: "Title 1" },
            2: { fontSize: 28, text: "Title 2" },
            3: { fontSize: 24, text: "Title 3" },
            4: { fontSize: 20, text: "Title 4" },
            5: { fontSize: 18, text: "Title 5" },
            6: { fontSize: 16, text: "Normal Text" },
        };
    
        const { fontSize, text } = textOptions[textType] || textOptions[6];
    
        const newText = new fabric.IText(text, {
            left: 50,
            top: 50,
            fontSize,
            fill: "#333",
            selectable: true,
            editable: true,
        });

        newText.on('selected', () => {
            setElementSelection('text');
        });
    
        canvasRef.current.add(newText);
        canvasRef.current.setActiveObject(newText);
        canvasRef.current.renderAll();
        setPopoverData({ visible: false, title: "", content: "" });
    };
    
    const addTable = (rows: number, cols: number, cellWidth: number, cellHeight: number) => {
        if (!canvasRef.current) return;

        const table = new fabric.Group([], { selectable: true, evented: true });
    
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const rect = new fabric.Rect({
                    left: (j * cellWidth) + 50,
                    top: (i * cellHeight) + 50,
                    width: cellWidth,
                    height: cellHeight,
                    fill: "transparent",
                    stroke: "black",
                    strokeWidth: 0.1
                });
                table.addWithUpdate(rect);
            }
        }
    
        canvasRef.current.add(table);
        canvasRef.current.setActiveObject(table);
        canvasRef.current.renderAll();
        setPopoverData({ visible: false, title: "", content: "" });
    };    

    const createContent = (type: string): React.ReactNode => {
        if (type === "text") {
            return (
                <Row gutter={[24, 6]}>
                    {([1, 2, 3, 4, 5] as const).map((level) => (
                        <Col key={level} xs={24}>
                            <Tag
                                style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }}
                                onClick={() => addText(level)}
                            >
                                <Title level={level} style={{ marginBottom: 0 }}>
                                    Add Title {level}
                                </Title>
                            </Tag>
                        </Col>
                    ))}
                    <Col xs={24}>
                        <Tag
                            style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }}
                            onClick={() => addText(6)}
                        >
                            <Title level={5} style={{ marginBottom: 0, fontSize: 16 }}>
                                Add Normal Text
                            </Title>
                        </Tag>
                    </Col>
                </Row>
            );
        } else if (type === "table") {
            return (
                <Row gutter={[24, 6]}>
                    <Col xs={12}>
                        <Input />
                    </Col>
                    <Col xs={12}>
                        <Input />
                    </Col>
                    <Col xs={24}>
                        <Tag
                            style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }}
                            onClick={() => addTable(3, 3, 5,5)}
                        >
                            <Title level={5} style={{ marginBottom: 0, fontSize: 16 }}>
                                Add Table
                            </Title>
                        </Tag>
                    </Col>
                </Row>
            );
        }
        return null;
    };

    const createTitle = (type: string): React.ReactNode => {
        if (type === "text") {
            return (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Insert Text</span>
                    <span style={{ padding: '0 10px', cursor: 'pointer' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPopoverData({ visible: false, title: "", content: "" });
                    }}
                    >
                        <CloseOutlined/>
                    </span>
                </div>
            );
        }
        return null;
    };

    const handleSizeChange = (value: string) => {
        const selectedSize = paperSizes.find((size) => size.value === value);
        if (selectedSize) {
          setPageSize({ type: value, width: selectedSize.width, height: selectedSize.height });
          setOrientation('portrait');
        }
    };

    const updateFontSize = (size: number) => {
        if (!canvasRef.current) return;
        
        const activeObject = canvasRef.current.getActiveObject() as fabric.IText;
        if (activeObject && activeObject.isType('i-text')) {
            activeObject.set({ fontSize: size });
            canvasRef.current.renderAll();
            setFontSize(size);
        }
    };
    
    const increaseFontSize = () => {
        if (!canvasRef.current) return;
        
        const activeObject = canvasRef.current.getActiveObject() as fabric.IText;
        if (activeObject && activeObject.isType('i-text')) {
            const currentSize = activeObject.fontSize || 16;
            activeObject.set({ fontSize: currentSize + 1 });
            canvasRef.current.renderAll();
            setFontSize(currentSize + 1);
        }
    };
    
    const decreaseFontSize = () => {
        if (!canvasRef.current) return;
        
        const activeObject = canvasRef.current.getActiveObject() as fabric.IText;
        if (activeObject && activeObject.isType('i-text')) {
            const currentSize = activeObject.fontSize || 16;
            if (currentSize > 1) {
                activeObject.set({ fontSize: currentSize - 1 });
                canvasRef.current.renderAll();
                setFontSize(currentSize - 1);
            }
        }
    };
    
    const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (/^\d*\.?\d*$/.test(value)) { // Prevent letters and special characters except '.'
            setFontSize(value === "" ? "" : Number(value));
        }
    };
    
    const applyFontSizeChange = () => {
        if (fontSize && canvasRef.current) {
            updateFontSize(Number(fontSize));
        }
    };

    useEffect(() => {
        const activeObject = canvasRef.current?.getActiveObject() as fabric.IText;
        if (activeObject && activeObject.isType('i-text')) {
            setFontSize(activeObject.fontSize || "");
        }
    }, [canvasRef.current?.getActiveObject()]);

    const menuItems: MenuProps["items"] = [
        {
            key: 'text',
            icon: <TitleIcon />,
            label: "Text",
            title: '',
            onClick: (e) => handleMouseEnterMenuItem(e),
            // onMouseLeave: (e) => setPopoverData({ visible: false, title: '', content: '' })
        },
        {
            key: 'table',
            icon: <TableOutlined />,
            label: "Table",
            title: '',
            onClick: (e) => handleMouseEnterMenuItem(e),
            // onMouseLeave: (e) => setPopoverData({ visible: false, title: '', content: '' })
        }
    ];

    const paperSizes = [
        { value: 'A4', label: 'A4 (210 × 297 mm)', width: mmToPx(210), height: mmToPx(297) },
        { value: 'A5', label: 'A5 (148 × 210 mm)', width: mmToPx(148), height: mmToPx(210) },
        { value: 'Letter', label: 'Letter (8.5 × 11 in)', width: 8.5 * 96, height: 11 * 96 }, // Inches to px
    ];

    const fontSizes: MenuProps["items"] = Array.from(
        [6, 8, 10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 48, 56, 64, 72, 80, 96, 112, 128, 144],
        (size) => ({
          key: size.toString(),
          label: `${size}`,
          onClick: () => updateFontSize(size),
        })
      );

    return (
        <div>
            <Row gutter={24}>
                <Col lg={2} md={2} sm={12} xs={12}>
                    <Popover 
                    content={popoverData.content}
                    title={popoverData.title}
                    open={popoverData.visible}
                    placement="right"
                    arrow={false}
                    styles={{ body: { width: 300 } }}
                    >
                        <Card
                        styles={{ body: { padding: 0 } }}
                        style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 5 }}
                        >
                            <Menu
                                inlineCollapsed
                                mode="inline"
                                defaultSelectedKeys={['1']}
                                defaultOpenKeys={['1']}
                                style={{ height: '100%', borderRight: 0 }}
                                items={menuItems}
                            />
                        </Card>
                    </Popover>
                </Col>
                <Col lg={22} md={22} sm={12} xs={12}>
                    <Card>
                        <Card bordered 
                        style={{ marginBottom: 10 }}
                        styles={{ body: { padding: 10 } }}
                        >
                            {elementSelection ? (
                                <Row gutter={24}>
                                    <Col>
                                    <Space.Compact block>
                                        <Button onClick={decreaseFontSize}>-</Button>
                                        <Dropdown 
                                        menu={{ items: fontSizes }} 
                                        trigger={["click"]} 
                                        placement="bottom"
                                        >
                                            <Input 
                                            type="number"
                                            value={fontSize} 
                                            onChange={handleFontSizeChange} 
                                            onBlur={applyFontSizeChange}
                                            />
                                        </Dropdown>
                                        <Button onClick={increaseFontSize}>+</Button>
                                    </Space.Compact>
                                    </Col>
                                </Row>
                            ) : (
                                <Row gutter={24}>
                                    <Col>
                                        <Select
                                        options={paperSizes}
                                        onChange={handleSizeChange}
                                        placeholder={t('selectPaperSizeText')}
                                        />
                                    </Col>
                                    <Col>
                                        <Segmented options={[
                                            {
                                                label: t('portraitText'),
                                                value: 'portrait',
                                            },
                                            {
                                                label: t('landscapeText'),
                                                value: 'landscape',
                                            }
                                        ]} 
                                        onChange={(value: 'portrait' | 'landscape') => {
                                            setOrientation(value);
                                            setPageSize((prevSize: any) => ({
                                                ...prevSize,
                                                width: value === 'portrait' ? Math.min(prevSize.width, prevSize.height) : Math.max(prevSize.width, prevSize.height),
                                                height: value === 'portrait' ? Math.max(prevSize.width, prevSize.height) : Math.min(prevSize.width, prevSize.height),
                                            }));
                                        }}
                                        value={orientation}
                                        />
                                    </Col>
                                </Row>
                            )}
                        </Card>
                        {pageSize.height && pageSize.width && (
                            <canvas id="editorCanvas" style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }} />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CanvasEditor;