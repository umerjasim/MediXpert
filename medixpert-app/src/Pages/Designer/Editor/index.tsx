import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { inject, observer } from 'mobx-react';
import globalStore from '../../../Store/globalStore';
import { Alert, Button, Card, Col, Dropdown, Form, Input, MenuProps, Row, Select, Space, Spin, Tooltip } from 'antd';
import { t } from 'i18next';
import Utility from '../../../Global/Utility';
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Notification from '../../../Global/Notification';
import Marquee from 'react-fast-marquee';
import ConfirmModal from '../../../Components/ConfirmModal';
import designerStore from '../../../Store/designerStore';

const EditorBox: React.FC<{
    pageSizes: any[];
    hashtags: any[];
    documentTypes: any[];
    documentMaster: any[];
    setLoadData: (value: boolean) => void;
}> = ({ pageSizes, hashtags, documentTypes, documentMaster, setLoadData }) => {
    const [pageSettingForm] = Form.useForm();
    const [confirmForm] = Form.useForm();
    const [editorSaveForm] = Form.useForm();
    const [editorContent, setEditorContent] = useState<string>('');
    const [editorKey, setEditorKey] = useState<string>(Date.now().toString());
    const [editorInstance, setEditorInstance] = useState<any>(null);
    const [isEditorLoading, setIsEditorLoading] = useState<boolean>(true);
    const [selectedPageSizes,  setSelectedPageSizes] = useState<{ 
        id: string;
        width: {
            value: number;
            unit: string
        }; 
        height: {
            value: number;
            unit: string
        }; 
    } | null>(null);
    const [selectedOrientation, setSelectedOrientation] = useState<'p' | 'l' | null>(null);
    const [editorDisabled, setEditorDisabled] = useState<boolean>(true);
    const [saveButtonProp, setSaveButtonProp] = useState<{ confirm: boolean; disable: boolean; error: boolean }>({
        confirm: false,
        disable: true,
        error: false,
    });
    const [documentTypeData, setDocumentTypeData] = useState<{ type: string | null; name: string; }>({
        type: null,
        name: ''
    });
    const [selectedContentId, setSelectedContentId] = useState<string>('');

    useEffect(() => {
        const savedContent = editorContent;
        const savedPageSize = selectedPageSizes;
        const savedOrentation = selectedOrientation;
        const savedEditorDisabled = editorDisabled;
        setEditorKey(Date.now().toString());
        setEditorContent(savedContent);

        setTimeout(() => {
            const height: string = savedPageSize?.height.value + '' + savedPageSize?.height.unit;
            const width: string = savedPageSize?.width.value + '' + savedPageSize?.width.unit;
            
            if (savedOrentation === 'l') {
                setEditorSize(height, width);
            } else {
                setEditorSize(width, height);
            }
        }, 200);
        setTimeout(()=> {
            setIsEditorLoading(false);
        }, 500);
    }, [globalStore.darkTheme, globalStore.language]);

    useEffect(() => {
        // setTimeout(() => {
            handleEditor(editorInstance);
        // }, 500);
    }, [editorInstance, editorDisabled]);

    function handleEditor (editor: any) {
        if (editor) {
            editor.ui.registry.addButton('addLine', {
                text: t('addLineText'),
                icon: 'line',
                onAction: function () {
                    editor.windowManager.open({
                        title: 'Insert Line',
                        body: {
                            type: 'panel',
                            items: [
                            {
                                type: 'selectbox',
                                name: 'lineType',
                                label: 'Line Type',
                                items: [
                                    { text: 'Horizontal', value: 'horizontal' },
                                    { text: 'Vertical', value: 'vertical' }
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `
                                    <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin: 10px 0;">
                                        <span id="thicknessValue" style="font-weight: bold;">2 px</span>
                                        <input 
                                        type="range" 
                                        id="thicknessSlider" 
                                        min="0.1" max="50" step="0.1" value="2"
                                        style="width: 100%;"
                                        />
                                    </div>
                                `
                            },
                            {
                                type: 'colorinput',
                                name: 'color',
                                label: 'Line Color',
                            }
                            ]
                        },
                        buttons: [
                            {
                                type: 'cancel',
                                text: 'Cancel'
                            },
                            {
                                type: 'submit',
                                text: 'Insert',
                                primary: true
                            }
                        ],
                        initialData: { thickness: '2' },
                        onSubmit: function (api: any) {
                            const data = api.getData();
                            const lineType = data.lineType;
                            const thickness = (document.getElementById('thicknessSlider') as HTMLInputElement)?.value || '2';
                            const color = data.color || '#000000';
                    
                            const lineHtml =
                                lineType === 'vertical'
                                    ? `<div style="border-left: ${thickness}px solid ${color}; height: 100%;></div>`
                                    : `<div style="border-top: ${thickness}px solid ${color}; width: 100%;"></div>`;
                    
                            editor.insertContent(lineHtml);
                            api.close();
                        },
                        onChange: function (dialogApi: any, details: any) {
                            if (details.name === 'thickness') {
                            (document.getElementById('thicknessValue') as HTMLSpanElement).innerText = `${details.value} px`;
                            }
                        }
                    });
                    setTimeout(() => {
                        const slider = document.getElementById('thicknessSlider') as HTMLInputElement;
                        const thicknessValue = document.getElementById('thicknessValue') as HTMLSpanElement;
                
                        if (slider && thicknessValue) {
                            slider.addEventListener('input', () => {
                                thicknessValue.innerText = `${slider.value} px`;
                            });
                        }
                    }, 100);
                }
            });
            editor.ui.registry.addButton('setMargins', {
                text: t('setMarginsText'),
                icon: 'visualblocks',
                onAction: function () {
                    editor.windowManager.open({
                        title: 'Set Margins',
                        body: {
                            type: 'panel',
                            items: [
                                {
                                    type: 'htmlpanel',
                                    html: `
                                        <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px 0;">
                                            <label for="marginTop">Top Margin (px)</label>
                                            <input type="number" class="tox-textfield" id="marginTop" value="10" min="0" max="100" style="width: 100%;" />
                                            
                                            <label for="marginBottom">Bottom Margin (px)</label>
                                            <input type="number" class="tox-textfield" id="marginBottom" value="10" min="0" max="100" style="width: 100%;" />
                                            
                                            <label for="marginLeft">Left Margin (px)</label>
                                            <input type="number" class="tox-textfield" id="marginLeft" value="10" min="0" max="100" style="width: 100%;" />
                                            
                                            <label for="marginRight">Right Margin (px)</label>
                                            <input type="number" class="tox-textfield" id="marginRight" value="10" min="0" max="100" style="width: 100%;" />
                                        </div>
                                    `
                                }
                            ]
                        },
                        buttons: [
                            { type: 'cancel', text: 'Cancel' },
                            { type: 'submit', text: 'Apply', primary: true }
                        ],
                        onSubmit: function (api: any) {
                            const marginTop = (document.getElementById('marginTop') as HTMLInputElement)?.value || '10';
                            const marginBottom = (document.getElementById('marginBottom') as HTMLInputElement)?.value || '10';
                            const marginLeft = (document.getElementById('marginLeft') as HTMLInputElement)?.value || '10';
                            const marginRight = (document.getElementById('marginRight') as HTMLInputElement)?.value || '10';

                            const existingContent = editor.getContent();

                            const wrappedContent = `
                                <div id="margin" style="margin: ${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px; border: 0.5px dashed #d3d3d3">
                                    ${existingContent || "<p>Type here...</p>"}
                                </div>
                            `;

                            editor.setContent(wrappedContent);

                            // editorInstance.insertContent(`<div id="margin" style="margin: ${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px; border: 1px solid #d3d3d3">${existingContent}<div>`);
                    
                            api.close();
                        }
                    });
                }
            });
            editor.ui.registry.addButton('hashtags', {
                text: '#',
                // icon: 'line',
                onAction: function () {
                    editor.windowManager.open({
                        title: t('insertHashtagText'),
                        body: {
                            type: 'panel',
                            items: [
                                {
                                    type: 'htmlpanel',
                                    html: `
                                        <div style="position: sticky; top: -16px;">
                                            <input type="text" class="tox-textfield" 
                                                placeholder="${t('searchText')}"
                                                style="width: 100%; margin-bottom: 8px; padding: 5px;"
                                                id="hashtag-search"
                                            />
                                        </div>
                                        <div id="hashtag-container" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; max-height:400px;">
                                            ${hashtags?.map(hashtag => `
                                                <div 
                                                    class="hashtag-item"
                                                    data-id="${hashtag._id}"
                                                    data-name="${hashtag.key}"
                                                    data-key="${hashtag.key.toLowerCase()}"
                                                    data-value="${hashtag.value.toLowerCase()}"
                                                    style="background:${globalStore.darkTheme ? '#1d1d1d' : '#fafafa'}; 
                                                        padding: 4px 8px; border: 1px solid ${globalStore.darkTheme ? '#424242' : '#d9d9d9'}; 
                                                        color:${globalStore.darkTheme ? '#c3c3c3' : '#262626'}; border-radius: 5px; cursor: pointer;
                                                        opacity: 1; transition: opacity 0.3s ease-in-out;"
                                                >
                                                    <span class="hashtag-text">${hashtag.key}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    `
                                },
                            ]
                        },
                        buttons: [
                            {
                                type: 'cancel',
                                text: 'Cancel'
                            },
                        ],
                    });
                    setTimeout(() => {
                        const slider = document.getElementById('thicknessSlider') as HTMLInputElement;
                        const thicknessValue = document.getElementById('thicknessValue') as HTMLSpanElement;
                
                        if (slider && thicknessValue) {
                            slider.addEventListener('input', () => {
                                thicknessValue.innerText = `${slider.value} px`;
                            });
                        }

                        const searchInput = document.getElementById("hashtag-search") as HTMLInputElement;
                        if (searchInput) {
                            searchInput.addEventListener("input", function () {
                                const searchText = searchInput.value.toLowerCase();
                                const hashtagItems = container.querySelectorAll(".hashtag-item");
                        
                                hashtagItems.forEach(item => {
                                    const key = item.getAttribute("data-key") || "";
                                    const fullname = item.getAttribute("data-fullname") || "";
                                    const hashtagText = item.querySelector(".hashtag-text");
                        
                                    if (key.includes(searchText) || fullname.includes(searchText)) {
                                        (item as HTMLElement).style.opacity = "1";
                                        (item as HTMLElement).style.display = "block"; 

                                        if (hashtagText) {
                                            const regex = new RegExp(`(${searchText})`, "gi");
                                            hashtagText.innerHTML = key.replace(regex, `<span style="background: yellow; color: black; font-weight: bold;">$1</span>`);
                                        }
                                    } else {
                                        (item as HTMLElement).style.opacity = "0";
                                        (item as HTMLElement).style.display = "none";
                                    }
                                });
                            });
                        }

                        const container = document.getElementById("hashtag-container") as HTMLDivElement;

                        if (container) {
                            container.addEventListener("click", function (event) {
                                const target = event.target as HTMLElement;
                                const hashtagItem = target.closest(".hashtag-item") as HTMLElement;
                        
                                if (hashtagItem) {
                                    const hashtagName = hashtagItem.getAttribute("data-name");
                                    const hashtagId = hashtagItem.getAttribute("data-id");
                        
                                    if (hashtagName && hashtagId) {
                                        editor.insertContent(`${hashtagName} `);
                                        editor.windowManager.close();
                                    }
                                }
                            });
                        }
                        
                    }, 100);
                }
            });

            setTimeout(() => {
                const brandBar = document.querySelector('.tox-statusbar__branding') as HTMLSpanElement;
                if (brandBar) {
                    brandBar.style.display = 'none';
                }
            }, 100);

            const attachListeners = () => {
                if (!editor.current) return;

                const editorIframe = editor.current.iframeElement;
                const editorDoc = editorIframe?.contentWindow?.document;
                const editorBody = editorDoc?.body;
          
                if (editorBody) {
                    console.log(11)
                    // if (editorDisabled) {
                    //     editorBody.innerHTML = `
                    //         <div style="
                    //         padding: 10px;
                    //         background: ${globalStore.darkTheme ? '#2b2111' : '#fffbe6' };
                    //         color: ${globalStore.darkTheme ? '#fffbe6' : '#2b2111' };
                    //         font-size: 14px;
                    //         display: flex;
                    //         align-items: center;
                    //         justify-content: center;
                    //         ">
                    //             <svg viewBox="64 64 896 896" focusable="false" data-icon="exclamation-circle" width="1em" height="1em" fill="#faad14" aria-hidden="true">
                    //                 <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
                    //             </svg> 
                    //             &nbsp; Editing Disabled: You need to enable editing to modify content.
                    //         </div>
                    //         <p><br data-mce-bogus="1"></p>
                    //     `;

                    //     editorBody.style.pointerEvents = 'none';
                    //     editorBody.removeAttribute('data-mce-placeholder');
                    //     editorIframe.style.pointerEvents = 'none';
                    // } else {
                    //     editorBody.innerHTML = '';
                    //     editorBody.style.pointerEvents = 'auto';
                    //     editorBody.setAttribute('data-mce-placeholder', t('clickToStartText'));
                    //     editorIframe.style.pointerEvents = 'auto';
                    // }

                    // const handleClick = () => {
                    //     if (editorDisabled) {
                    //         console.warn('Editor clicked, but editing is disabled.');
                    //     } else {
                    //         editorBody.removeAttribute('data-mce-placeholder')
                    //     }
                    // };
          
                    // const handleFocus = () => {
                    //     if (editorDisabled) {
                    //         console.warn('Editor focused, but editing is disabled.');
                    //     } else {
                    //         editorBody.removeAttribute('data-mce-placeholder')
                    //     }
                    // };
          
                    // const handleKeydown = (event: KeyboardEvent) => {
                    //     if (editorDisabled) {
                    //         console.warn(`Typing blocked: ${event.key}`);
                    //         // event.preventDefault();
                    //     }
                    // };
          
                    // editorBody.addEventListener('click', handleClick);
                    // editorBody.addEventListener('focusin', handleFocus);
                    // editorBody.addEventListener('keydown', handleKeydown);
          
                    // return () => {
                    //     editorBody.removeEventListener('click', handleClick);
                    //     editorBody.removeEventListener('focusin', handleFocus);
                    //     editorBody.removeEventListener('keydown', handleKeydown);
                    // };
                }
            };
          
            if (editor.current) {
                attachListeners();
            } else {
                const checkEditorReady = setInterval(() => {
                    if (editor.current) {
                        attachListeners();
                        clearInterval(checkEditorReady);
                    }
                }, 500);
                return () => clearInterval(checkEditorReady);
            }
            
            let isHeightExceeded = false;
            editor.on('input', () => {
                const editorIframe = document.querySelector('.tox-edit-area iframe') as HTMLIFrameElement;

                if (editorIframe) {
                    const editorDoc = editorIframe.contentDocument || editorIframe.contentWindow?.document;
                    if (editorDoc) {
                        const body = editorDoc.body;
                        if (body) {
                            const contentHeight = body.scrollHeight;
                            
                            let maxHeight = selectedPageSizes?.height.value || 0;
                            const unit = selectedPageSizes?.height.unit || 'px';

                            if (unit === 'mm') {
                                maxHeight = maxHeight * 3.78;
                            } else if (unit === 'in') {
                                maxHeight = maxHeight * 96;
                            } else if (unit === 'px') {
                            } else {
                                console.warn(`Unsupported unit: ${unit}`);
                                return;
                            }

                            console.log('maxHeight', maxHeight)
                            console.log('contentHeight', contentHeight)

                            if (contentHeight > maxHeight) {
                                if (!isHeightExceeded) {
                                    alert(`Content height cannot exceed ${selectedPageSizes?.height.value}${unit}`);
                                    isHeightExceeded = true;
                                }

                                while (body.scrollHeight > maxHeight && body.lastChild) {
                                    body.removeChild(body.lastChild);
                                }
                            } else {
                                isHeightExceeded = false;
                            }
                        }
                    }
                }
            }); 
        }
    };

    function setEditorSize(width: string, height: string) {
        const editorBody = document.querySelector('.tox-editor-container iframe') as HTMLIFrameElement;
        if (editorBody) {
            editorBody.style.width = width;
            editorBody.style.height = height;
            editorBody.style.overflow = 'auto';
            editorBody.style.boxShadow = 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px';
        }
        const area = document.querySelector('.tox-edit-area') as HTMLDivElement;
        if (area) {
            area.style.overflow = 'auto';
            area.style.display = 'flex';
            area.style.justifyContent = 'center';
        }
        const editor = document.querySelector('.tox-edit-area') as HTMLDivElement;
        if (editor) {
            editor.style.width = width;
            editor.style.height = height;
            editor.style.overflow = 'auto';
            editor.style.boxShadow = 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px';
        }
        const sideBar = document.querySelector('.tox-sidebar-wrap') as HTMLDivElement;
        if (sideBar) {
            sideBar.style.overflow = 'auto';
            sideBar.style.display = 'flex';
            sideBar.style.justifyContent = 'center';
        }
    };

    const handleEditorChange = (content: string) => {
        setEditorContent(content);
    };

    const handleSave = () => {
        if (!editorContent) {
            setSaveButtonProp((prev: any) => ({...prev, error: true}));
            return;
        }
        setSaveButtonProp((prev: any) => ({...prev, confirm: true}));
    };

    const handleUpdate = () => {
        if (!editorContent) {
            setSaveButtonProp((prev: any) => ({...prev, error: true}));
            return;
        }
        const selectedContent = documentMaster.find(doc => doc._id === selectedContentId);
        console.log(selectedContent)
        setDocumentTypeData({ type: selectedContent.documentTypes._id, name: selectedContent.name });
        confirmForm.setFieldsValue({ 'form-editor-confirm-type': selectedContent?.documentTypes?._id });
        confirmForm.setFieldsValue({ 'form-editor-confirm-name': selectedContent?.name });
        setSaveButtonProp((prev: any) => ({...prev, confirm: true}));
    };

    const handlePageSizeChange = (value: string) => {
        const selectedPage = pageSizes.find(page => page._id === value);
        if (selectedPage) {
            setSelectedPageSizes({
                id: selectedPage._id,
                width: selectedPage.width,
                height: selectedPage.height
            });
            setSelectedOrientation(selectedPage.default || null);
            pageSettingForm.setFieldsValue({ 'page-setting-orientation': selectedPage.default || undefined });
        } else {
            setSelectedPageSizes(null);
            setSelectedOrientation(null);
            pageSettingForm.setFieldsValue({ 'page-setting-orientation': undefined });
        }
    };
    
    const handlePageOrientaionChange = (value: 'p' | 'l' | null) => {
        setSelectedOrientation(value);
    };

    const handleCreatePage = async () => {
        try {
            const values = await pageSettingForm.validateFields(); 
            const selectedPage = pageSizes.find(page => page._id === values['page-setting-size']);
            const height: string = selectedPage.height.value + '' + selectedPage.height.unit;
            const width: string = selectedPage.width.value + '' + selectedPage.width.unit;
            
            if (values['page-setting-orientation'] === 'l') {
                setEditorSize(height, width);
            } else {
                setEditorSize(width, height);
            }
            
            setEditorDisabled(false);
            setSaveButtonProp((prev: any) => ({...prev, disable: false}));
        } catch (errorInfo) {
            Notification.error({
                message: t('error'),
                description: t('fillRequiredFields')
            });
        }
    };

    const handleConfirm = async () => {
        globalStore.setLoading(true);
        try {
            const values = await confirmForm.validateFields();
            if (values) {
                const data = { 
                    contentId: selectedContentId || null,
                    content: editorContent, 
                    type: values['form-editor-confirm-type'],
                    name: values['form-editor-confirm-name'],
                    pageType: selectedPageSizes?.id,
                    orientation: selectedOrientation
                }
                await designerStore.saveContent(data);

                Notification.success({
                    message: t('success'),
                    description: t('savedSuccessfully')
                });
                
                setTimeout(() => {
                    setEditorContent('');
                    setEditorKey(Date.now().toString());
                    setEditorInstance(null);
                    setSelectedPageSizes(null);
                    setSelectedOrientation(null);
                    setEditorDisabled(true);
                    setDocumentTypeData({
                        type: null,
                        name: ''
                    });
                    setSaveButtonProp({
                        confirm: false,
                        disable: true,
                        error: false,
                    });
                    setLoadData(true);
                }, 500);
            }
        } catch (error) {
            Notification.error({
                message: t('error'),
                description: t('fillRequiredFields')
            });
        } finally {
            setTimeout(() => {
                globalStore.setLoading(false);
            }, 500);
        }
    };

    const handleInsert: MenuProps['onClick'] = (e) => {
        const contentId = e.key;
        const selectedContent = documentMaster.find(doc => doc._id === contentId);
        setEditorContent(selectedContent?.contentHtml || '');
        setSelectedContentId(contentId);
        setSelectedPageSizes({
            id: selectedContent?.pageType?._id,
            width: selectedContent?.pageType?.width,
            height: selectedContent?.pageType?.height
        });
        setSelectedOrientation(selectedContent.orientation);
        pageSettingForm.setFieldsValue({ 'page-setting-size': selectedContent?.pageType?._id });
        pageSettingForm.setFieldsValue({ 'page-setting-orientation': selectedContent?.orientation });

        const height: string = selectedContent?.pageType?.height.value + '' + selectedContent?.pageType?.height.unit;
        const width: string = selectedContent?.pageType?.width.value + '' + selectedContent?.pageType?.width.unit;
        if (selectedContent.orientation === 'l') {
            setEditorSize(height, width);
        } else {
            setEditorSize(width, height);
        }
        setEditorDisabled(false);
        setSaveButtonProp((prev: any) => ({...prev, disable: false}));
    };

    const docMasterItems: MenuProps['items'] = documentMaster.map((doc) => ({
        key: doc._id,
        label: doc.name,
        onClick: handleInsert
    }));

    return (
        <div>
            <ConfirmModal
                title={t('confirmText')}
                content={
                    <>
                        <Form
                            form={confirmForm}
                            name='form-editor-confirm'
                            id='form-editor-confirm'
                            initialValues={{ remember: true }}
                            autoComplete="off"
                            onKeyDown={(event) => Utility.handleEnterKey(event, 'form-editor-confirm')}
                            layout="vertical"
                        >
                            <Row gutter={[16, 4]} >
                                <Col lg={24} md={24} sm={24} xs={24}>
                                    <Form.Item
                                        label={
                                            <>
                                                {t('documentTypeText')}
                                                <Tooltip placement="top" 
                                                title={t('documentTypeSelectionTooltipText')}>
                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name="form-editor-confirm-type"
                                        id="form-editor-confirm-type"
                                        rules={[
                                            {
                                                required: true,
                                                message: t('documentTypeEmpty'),
                                            },
                                        ]}
                                    >
                                        <Select 
                                        placeholder={t('selectDocumentTypeText')} 
                                        // defaultValue={documentTypeData.type ? documentTypeData.type : (documentTypes?.[0]?._id || undefined)}
                                        onChange={(val: any) => setDocumentTypeData((prev) => ({ ...prev, type: val }))}
                                        value={documentTypeData.type || undefined}
                                        >
                                            {documentTypes.map((doc) => (
                                                <Select.Option key={doc._id} value={doc._id}>
                                                    {doc.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col lg={24} md={24} sm={24} xs={24}>
                                    <Form.Item
                                        label={
                                            <>
                                                {t('documentNameText')}
                                                <Tooltip placement="top" 
                                                title={t('documentNameTooltipText')}>
                                                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name="form-editor-confirm-name"
                                        id="form-editor-confirm-name"
                                        rules={[
                                            {
                                                required: true,
                                                message: t('documentNameEmpty'),
                                            },
                                        ]}
                                    >
                                       <Input 
                                       placeholder={t('documentNameText')}
                                       onChange={(val: any) => setDocumentTypeData((prev) => ({ ...prev, name: val }))}
                                       value={documentTypeData.name}
                                       />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </>
                }
                visible={saveButtonProp.confirm}
                onOk={handleConfirm}
                onCancel={() => setSaveButtonProp((prev: any) => ({...prev, confirm: false}))}
            />
            <Card
            title={t('editorText')}
            >
                <Form
                    form={pageSettingForm}
                    name='form-page-setting'
                    id='form-page-setting'
                    initialValues={{ remember: true }}
                    autoComplete="off"
                    onKeyDown={(event) => Utility.handleEnterKey(event, 'form-page-setting')}
                    // layout="vertical"
                >
                    <Row gutter={[16, 4]} >
                        <Col lg={6} md={6} sm={24} xs={24}>
                            <Form.Item
                                label={
                                    <>
                                        {t('pageSizeText')}
                                        <Tooltip placement="top" 
                                        title={t('pageSizeTooltipText')}>
                                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                        </Tooltip>
                                    </>
                                }
                                name="page-setting-size"
                                id="page-setting-size"
                                rules={[
                                    {
                                        required: true,
                                        message: t('pageSizeEmpty'),
                                    },
                                ]}
                            >
                                <Select 
                                placeholder={t('selectPageSizeText')} 
                                onChange={handlePageSizeChange}
                                value={selectedPageSizes?.id || undefined}
                                >
                                    {pageSizes.map((size) => (
                                        <Select.Option key={size._id} value={size._id}>
                                            {size.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col lg={6} md={6} sm={24} xs={24}>
                            <Form.Item
                                label={
                                    <>
                                        {t('orientationText')}
                                        <Tooltip placement="top" 
                                        title={t('orientationTooltipText')}>
                                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                        </Tooltip>
                                    </>
                                }
                                name="page-setting-orientation"
                                id="page-setting-orientation"
                                rules={[
                                    {
                                        required: true,
                                        message: t('orientationEmpty'),
                                    },
                                ]}
                            >
                                <Select 
                                placeholder={t('selectOrientationText')} 
                                onChange={handlePageOrientaionChange}
                                value={selectedOrientation || undefined}
                                disabled={!selectedPageSizes}
                                >
                                    <Select.Option key='p' value='p'>
                                        {t('portraitText')}
                                    </Select.Option>
                                    <Select.Option key='l' value='l'>
                                        {t('landscapeText')}
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col lg={3} md={3} sm={24} xs={24}>
                            <Form.Item
                                id="page-setting-apply"
                                name="page-setting-apply"
                                // label="&nbsp;"
                            >
                                <Button 
                                color="primary" 
                                variant="solid"
                                block
                                onClick={handleCreatePage}
                                id="create-button"
                                >
                                    {t('createPageText')}
                                </Button>
                            </Form.Item>
                        </Col>
                        <Col lg={5} md={5} sm={24} xs={24}></Col>
                        <Col lg={4} md={4} sm={24} xs={24}>
                            <Dropdown menu={{ items: docMasterItems }} trigger={['click']} 
                                disabled={docMasterItems.length === 0}>
                                <Button block>
                                    <Space style={{ overflow: 'hidden' }}>
                                        {t('insertExistingText')}
                                        <DownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                        </Col>
                    </Row>
                </Form>
                {editorDisabled && (
                    <Alert 
                    message={
                        <Marquee pauseOnHover gradient={false} delay={2}>
                            {t('editorDisabledWarning')} &nbsp; &nbsp; &nbsp; &nbsp;
                        </Marquee> 
                    }
                    type="warning" banner showIcon 
                    style={{ marginBottom: 10 }} 
                    />
                )}
                {!isEditorLoading && (
                    <Editor
                        disabled={editorDisabled}
                        key={editorKey}
                        apiKey="9fg7gvc2kv1t15p7gaxb1n6aoop605h5kkw2l0joprhge3v9"
                        value={editorContent}
                        onEditorChange={handleEditorChange}
                        onInit={(evt, editor) => {
                            editorInstance.current = editor;
                        }}
                        init={{
                            script_url: '/TinyMCE/tinymce.min.js',
                            // disabled: true,
                            disable: 'tracking',
                            height: 500,
                            // menubar: 'file edit view insert format tools table pagebreak help',
                            menubar: false,
                            plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
                            toolbar: 'hashtags | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor removeformat | align numlist bullist | link image table media | lineheight outdent indent | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl | addLine | setMargins',
                            autosave_ask_before_unload: true,
                            autosave_interval: '30s',
                            autosave_prefix: '{path}{query}-{id}-',
                            autosave_restore_when_empty: false,
                            autosave_retention: '2m',
                            image_advtab: true,
                            image_list: [
                                { title: 'My page 1', value: 'https://www.tiny.cloud' },
                                { title: 'My page 2', value: 'http://www.moxiecode.com' },
                            ],
                            importcss_append: true,
                            file_picker_callback: (callback, value, meta) => {
                                if (meta.filetype === 'file') {
                                    callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
                                }
                                if (meta.filetype === 'image') {
                                    callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
                                }
                                if (meta.filetype === 'media') {
                                    callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
                                }
                            },
                            skin: globalStore.darkTheme ? 'oxide-dark' : 'oxide',
                            content_css: globalStore.darkTheme ? 'dark' : 'default',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
                            setup: (editor) => {
                                setEditorInstance(editor);
                                handleEditor(editor);
                            },
                            placeholder: t('clickToStartText')
                        }}
                    />
                )}
                <Form
                    form={editorSaveForm}
                    name='form-editor-save'
                    id='form-editor-save'
                    initialValues={{ remember: true }}
                    autoComplete="off"
                    onKeyDown={(event) => Utility.handleEnterKey(event, 'form-editor-save')}
                >
                    <Form.Item
                        id="editor-save"
                        name="editor-save"
                        style={{ marginBottom: 0 }}
                        validateStatus={saveButtonProp.error ? "error" : ""}
                        help={saveButtonProp.error ? t('contentEmpty') : ""}
                    >
                        <Row style={{ marginTop: 10 }} gutter={24}>  
                            {selectedContentId ? (
                                <>
                                    <Col lg={12} md={12} sm={12} xs={12}>
                                        <Button 
                                        color="primary" 
                                        variant="dashed"
                                        block
                                        onClick={handleUpdate}
                                        disabled={saveButtonProp.disable}
                                        >
                                            {t('updateExistingText')}
                                        </Button>
                                    </Col>
                                    <Col lg={12} md={12} sm={12} xs={12}>
                                        <Button 
                                        color="primary" 
                                        variant="solid"
                                        block
                                        onClick={handleSave}
                                        disabled={saveButtonProp.disable}
                                        >
                                            {t('saveAsNewText')}
                                        </Button>
                                    </Col>
                                </>
                            ) : (
                                <Col lg={24} md={24} sm={24} xs={24}>
                                    <Button 
                                    color="primary" 
                                    variant="solid"
                                    block
                                    onClick={handleSave}
                                    disabled={saveButtonProp.disable}
                                    >
                                        {t('saveText')}
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default inject('globalStore')(observer(EditorBox));
