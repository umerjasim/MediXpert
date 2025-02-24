import React, { useRef, useState, useEffect } from "react";
import JoditEditor from "jodit-react";
import { Card, theme } from "antd";
import { t } from "i18next";
import { inject, observer } from "mobx-react";
import globalStore from "../../Store/globalStore";

const Designer: React.FC = () => {
    const editor = useRef(null);
    const [content, setContent] = useState("");
    const [editorHeight, setEditorHeight] = useState(window.innerHeight - 300);

    useEffect(() => {
        const handleResize = () => setEditorHeight(window.innerHeight - 300);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const config = {
        uploader: { insertImageAsBase64URI: true },
        height: editorHeight,
        theme: globalStore.darkTheme ? 'custom-dark' : 'light',
        toolbarSticky: false,
        placeholder: "Start typing here...",
        buttons: [
            "source", "bold", "italic", "underline", "strikethrough", "|",
            "ul", "ol", "|", "outdent", "indent", "|",
            "image", "table", "link", "align", "undo", "redo", "|",
            "hr", "eraser", "copyformat", "symbol", "|",
            "fullsize", "print", "preview", "|",
            "font", "fontsize", "brush", "paragraph", "|",
            "selectall", "cut", "copy", "paste",
            {
                name: "tableBorderSize",
                tooltip: "Set Table Border Size",
                list: {
                    "0px": "No Border",
                    "1px": "1px",
                    "2px": "2px",
                    "3px": "3px",
                    "4px": "4px",
                    "5px": "5px",
                    "6px": "6px",
                    "7px": "7px",
                    "8px": "8px",
                    "9px": "9px",
                    "10px": "10px"
                },
                exec: (editor: any, _: any, control: any) => {
                    if (!control || !control.control.text) return;
                    const selection = editor.s.save();
                    let selectedNode = editor.s.current();
                    let selectedTable: HTMLTableElement | null = null;
            
                    if (selectedNode) {
                        selectedTable = selectedNode.closest("table");
                    }

                    if (!selectedTable) {
                        selectedTable = editor.container.querySelector("table.jodit-selected");
                    }
            
                    if (selectedTable) {
                        if (control.control.name === "0px") {
                            selectedTable.style.removeProperty("border");

                            selectedTable.querySelectorAll("td, th").forEach((cell) => {
                                (cell as HTMLElement).style.removeProperty("border");
                            });
                        } else {
                            const borderSize = `${control.control.text} solid #ccc`;
                            selectedTable.style.border = borderSize;

                            selectedTable.querySelectorAll("td, th").forEach((cell) => {
                                (cell as HTMLElement).style.border = borderSize;
                            });
                        }
                    }
                    editor.s.restore(selection);
                }
            },
            {
                name: "#",
                tooltip: "Insert #Tags",
                list: {
                    "#name": "#name",
                    "#date": "#date",
                    "#total": "#total"
                },
                exec: (editor: any, _: any, control: any) => {
                    if (!control || !control.control.text) return;
                    editor.s.insertHTML(control.control.text);
                    editor.s.focus();
                }
            },
            {
                name: "Reset",
                tooltip: "Wipe all",
                exec: (editor: any, _: any, control: any) => {
                    editor.value = "";
                    editor.s.focus(); 
                }
            },
        ],
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const editorBody = document.querySelector(".jodit-wysiwyg");
            if (editorBody) {
                editorBody.querySelectorAll("table").forEach((table) => {
                    (table as HTMLElement).style.maxWidth = "100%";
                    (table as HTMLElement).style.wordBreak = "break-word";
                    (table as HTMLElement).style.overflow = "hidden";
                });
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const handleSave = () => {
        console.log("Saved HTML Content:", content);
    };

    return (
        <div>
            <Card
            title={t('createYourDesignText')}
            >
                <JoditEditor
                    ref={editor}
                    value={content}
                    config={config}
                    onBlur={(newContent) => setContent(newContent)}
                />

                <button onClick={handleSave}>Save HTML</button>
            </Card>
        </div>
    );
};

export default inject('globalStore')(observer(Designer));
