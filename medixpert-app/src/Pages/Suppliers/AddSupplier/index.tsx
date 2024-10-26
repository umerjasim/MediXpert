import { Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Tooltip } from "antd";
import { t } from "i18next";
import Utility from "../../../Global/Utility";
import { InfoCircleOutlined } from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import branchStore from "../../../Store/branchStore";
import { Mandatory } from "../../../Components/Mandatory";
import Notification from "../../../Global/Notification";

interface AddSupplierProps {
    isModalOpen: boolean;
    handleOk: (values: any) => void;
    handleCancel: () => void;
    loading: boolean;
}

const AddSupplier: React.FC<AddSupplierProps> = ({
    isModalOpen,
    handleOk,
    handleCancel,
    loading
  }) => {

    const [form] = Form.useForm();

    const onFinish = async () => {
        try {
            const values = await form.validateFields();
            handleOk(values);
        } catch (error) {
            onFinishFailed();
        }
    };

    const onFinishFailed = async () => {
        Notification.error({
            message: t('error'),
            description: t('fillRequiredFields')
        });
    };

    return (
        <Modal
          title={t('addSupplierText')}
          open={isModalOpen}
          onOk={onFinish}
          onCancel={handleCancel}
          maskClosable={false}
          okText={t('saveText')}
          cancelText={t('cancelText')}
          width={750}
          confirmLoading={loading}
          centered
        >
          <Divider />
          <Form
            form={form}
            name='form-add-supplier'
            id='form-add-supplier'
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            onKeyDown={(event) => Utility.handleEnterKey(event, 'form-add-supplier')}
            layout="vertical"
          >
            <Row gutter={16}>
            <Col lg={24} md={24} sm={24} xs={24}>
                <Form.Item
                    initialValue={branchStore.branches.map(branch => branch._id)}
                    label={
                    <>
                        {t('branchesText')}
                        <Tooltip placement="right" title={t('supplierBranchesTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                        </Tooltip>
                    </>
                    }
                    name='supplier-branch'
                    id="supplier-branch"
                    rules={[
                    {
                        required: true,
                        message: t('branchesEmpty'),
                    },
                    ]}
                    >
                    <Select placeholder={t('branchText')} mode="multiple">
                        {branchStore.branches && branchStore.branches.length > 0 && 
                        branchStore.branches.map((branch: any) => (
                            <Select.Option key={branch._id} value={branch._id}>
                                {branch.name}
                            </Select.Option>
                        ))}
                    </Select>
                    </Form.Item>
                </Col>
                <Col lg={24} md={24} sm={24} xs={24}>
                    <Form.Item
                    label={
                    <>
                    {t('supplierNameText')}
                    <Tooltip placement="right" title={t('supplierNameTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-name'
                    id="supplier-name"
                    rules={[
                    {
                        required: true,
                        message: t('supplierNameEmpty'),
                    },
                    ]}
                    >
                        <Input placeholder={t('supplierNameText')} />
                    </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('gstText')}
                    <Tooltip placement="right" title={t('gstTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-gst'
                    id="supplier-gst"
                    >
                        <Input placeholder={t('gstText')} />
                    </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('licenceNoText')}
                    <Tooltip placement="right" title={t('licenceNoTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-licence-no'
                    id="supplier-licence-no"
                    >
                        <Input placeholder={t('licenceNoText')} />
                    </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('emailText')}
                    <Tooltip placement="right" title={t('emailTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-email'
                    id="supplier-email"
                    rules={[
                        {
                            type: 'email',
                            message: t('emailValidMessage'),
                        },
                    ]}
                    >
                        <Input placeholder={t('emailText')} />
                    </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('mobileNoText')}
                    <Tooltip placement="right" title={t('mobileNoTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-mobile-no'
                    id="supplier-mobile-no"
                    rules={[
                        {
                            pattern: /^[0-9]{10}$/,
                            message: t('mobileNoValidText'),
                        }
                    ]}
                    >
                        <InputNumber max={9999999999} maxLength={10}
                        style={{ width: '100%' }}
                        placeholder={t('mobileNoText')} />
                    </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('addressLine1Text')}
                    <Tooltip placement="right" title={t('addressLine1TooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-address-line-1'
                    id="supplier-address-line-1"
                    >
                        <Input placeholder={t('addressLine1Text')} />
                    </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('addressLine2Text')}
                    <Tooltip placement="right" title={t('addressLine2TooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-address-line-2'
                    id="supplier-address-line-2"
                    >
                        <Input placeholder={t('addressLine2Text')} />
                    </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('placeText')}
                    <Tooltip placement="right" title={t('placeTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-place'
                    id="supplier-place"
                    >
                        <Input placeholder={t('placeText')} />
                    </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('zipOrPinCodeText')}
                    <Tooltip placement="right" title={t('zipOrPinCodeTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='supplier-zip-code'
                    id="supplier-zip-code"
                    rules={[
                        {
                            pattern: /^[0-9]{6}$/,
                            message: t('zipCodeValidText'),
                        }
                    ]}
                    >
                        <InputNumber max={999999} maxLength={6}
                        style={{ width: '100%' }}
                        placeholder={t('zipOrPinCodeText')} />
                    </Form.Item>
                </Col>
            </Row>
          </Form>
          <Mandatory />
        </Modal>
    );
};

export default inject('globalStore')(observer(AddSupplier));