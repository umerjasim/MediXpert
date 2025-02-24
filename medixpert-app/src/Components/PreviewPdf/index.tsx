import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'antd';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import globalStore from '../../Store/globalStore';

interface PreviewPdfProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    pdfUrl: string | null;
    fileName: string | null;
};

const PreviewPdf: React.FC<PreviewPdfProps> = ({
    open,
    setOpen,
    pdfUrl,
    fileName
}) => {

  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !globalStore.screenSize.lg && !globalStore.screenSize.md && pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName || 'document.pdf';
      link.click();
      setOpen(false);
    }
  }, [open, pdfUrl, fileName, setOpen]);

  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    setOpen(false);
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    setOpen(false);
  };

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <>
        {open && globalStore.screenSize.lg && globalStore.screenSize.md && (
        <Modal
          title={
            <div
              style={{ width: '100%', cursor: 'move' }}
              onMouseOver={() => disabled && setDisabled(false)}
              onMouseOut={() => setDisabled(true)}
            >
              {fileName}
            </div>
          }
          open={open}
          centered
          onOk={handleOk}
          onCancel={handleCancel}
          cancelButtonProps={{ style: { display: 'none' } }}
          width={'50%'}
          modalRender={(modal) => (
            <Draggable
              disabled={disabled}
              bounds={bounds}
              nodeRef={draggleRef}
              onStart={onStart}
            >
              <div ref={draggleRef}>{modal}</div>
            </Draggable>
          )}
        >
          <iframe
            src={pdfUrl || undefined}
            width="100%"
            style={{ height: '60vh' }}
            title={fileName || undefined}
          />
        </Modal>
      )}
    </>
  );
};

export default PreviewPdf;