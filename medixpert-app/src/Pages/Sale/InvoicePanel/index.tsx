import { useState } from "react";
import { Drawer, Tooltip } from "antd";
import { CaretLeftOutlined, CaretRightOutlined, FileSearchOutlined } from "@ant-design/icons";
import { t } from "i18next";
import globalStore from "../../../Store/globalStore";
import { inject, observer } from "mobx-react";

const InvoicePanel = () => {
    const [invoicePanelOpen, setInvoicePanelOpen] = useState(false);

    return (
        <>
            <Drawer
                title="Hidden Panel"
                placement="right"
                closable={true}
                onClose={() => setInvoicePanelOpen(false)}
                open={invoicePanelOpen}
                width={300}
                styles={{ body: { padding: "10px" } }}
                style={{ zIndex: 1000, position: "relative" }}
            >
                <p>Content goes here...</p>
            </Drawer>
            <Tooltip title={invoicePanelOpen ? '' : t('previousInvoicesText')} placement="left">
                <div
                    style={{
                        position: "fixed",
                        top: "22%",
                        right: invoicePanelOpen ? 300 : 0,
                        transform: "translateY(-50%)",
                        background: globalStore.darkTheme ? (!invoicePanelOpen ? "#0b356e" : "#1f1f1f")
                                    : (invoicePanelOpen ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 0.25)"),
                        color: globalStore.darkTheme ? "#fff" : "#000",
                        padding: "10px 3px",
                        borderRadius: "4px 0 0 4px",
                        cursor: "pointer",
                        transition: "right 0.3s ease-in-out",
                        zIndex: globalStore.settingDrawerOpen ? 100 : 1100,
                        boxShadow: invoicePanelOpen ? "none" : "2px 2px 5px rgba(0,0,0,0.3)",
                    }}
                    onClick={() => setInvoicePanelOpen(!invoicePanelOpen)}
                >
                    {invoicePanelOpen ? <CaretRightOutlined /> : <CaretLeftOutlined />} <FileSearchOutlined />
                </div>
            </Tooltip>
        </>
    );
};

export default inject('globalStore')(observer(InvoicePanel));