import React, { useState } from 'react';
import { Modal, Input } from 'antd';
import { t } from 'i18next';

interface ConfirmModalProps {
  title: string;
  content: React.ReactNode;
  visible: boolean;
  onOk: (inputValue: string) => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  content,
  visible = false,
  onOk,
  onCancel,
  okText = t('confirmText'),
  cancelText = t('cancelText'),
}) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Modal
      title={title}
      open={visible}
      onOk={() => onOk(inputValue)}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
    >
      <div>{content}</div>
    </Modal>
  );
};

export default ConfirmModal;