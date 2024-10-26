import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Upload } from "antd";
import { t } from "i18next";
import { useState } from "react";

interface DraggerProps {
    name?: string;
    multiple?: boolean;
    showUploadList?: boolean;
    height?: number;
    accept?: string | undefined;
    onFileChange: (files: any[]) => void;
}

const { Dragger } = Upload;

export const UploadDragger: React.FC<DraggerProps> = ({ 
    name = '',
    multiple = false,
    showUploadList = false,
    height = 55,
    accept = undefined,
    onFileChange
}) => {

    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    const beforeUpload = (file: any, fileList: any) => {
        setUploadedFiles(fileList);
        onFileChange(fileList)
        return false;
    };

    const handleRemove = (fileToRemove: any, event: React.MouseEvent) => {
        event.stopPropagation(); 
        const updatedFiles = uploadedFiles.filter(file => file.uid !== fileToRemove.uid);
        setUploadedFiles(updatedFiles);
        onFileChange(updatedFiles)
    };

    return (
        <>
            <Dragger
                name={name}
                multiple={true}
                accept={accept}
                showUploadList={showUploadList}
                height={height}
                beforeUpload={beforeUpload} 
            >
                {uploadedFiles.length === 0 ? (
                    <div style={{ fontSize: 20, color: 'gray' }}>
                        <UploadOutlined />
                    </div>
                ) : (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        fontSize: '11px',
                        color: 'gray'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '93%'
                        }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {uploadedFiles[0]?.name}
                            </span>
                            <Button 
                                type="text"
                                color="danger"
                                icon={<DeleteOutlined style={{ color: '#ff6161' }} />} 
                                size="small" 
                                onClick={(e) => handleRemove(uploadedFiles[0], e)}
                            />
                        </div>
                        {uploadedFiles.length > 1 && (
                            <div style={{ marginTop: '-5px' }}>
                                +{uploadedFiles.length - 1} more...
                            </div>
                        )}
                    </div>                    
                )}
            </Dragger>
            <div style={{ 
                color: 'gray', 
                fontSize: '12px', 
                textAlign: 'right',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis' ,
                marginTop: '1.5px'
            }}>
                {t('uploadFormatsText')}: {accept}
            </div>
        </>
    );
};