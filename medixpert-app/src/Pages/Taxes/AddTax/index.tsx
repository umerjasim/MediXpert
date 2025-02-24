import { t } from "i18next";
import Notification from "../../../Global/Notification";
import { Button, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Tooltip } from "antd";
import Utility from "../../../Global/Utility";
import { Mandatory } from "../../../Components/Mandatory";
import { inject, observer } from "mobx-react";
import branchStore from "../../../Store/branchStore";
import { InfoCircleOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import Constant from "../../../Global/Constant";

interface AddTaxProps {
    isModalOpen: boolean;
    handleOk: (values: any, form: any) => void;
    handleCancel: () => void;
    loading: boolean;
}

const AddTax: React.FC<AddTaxProps> = ({
    isModalOpen,
    handleOk,
    handleCancel,
    loading
  }) => {

    const [form] = Form.useForm();

    const onFinish = async () => {
        try {
            const values = await form.validateFields();
            handleOk(values, form);
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

    const handleAddSubTaxField = (fieldsCount: number) => {
        const values = form.getFieldsValue();
        const taxValue = values['tax-value'];
        const taxType = values['tax-type'];
        const taxName = values['tax-name'];

        const errors: Record<string, { errors: string[] }> = {};
        if (!taxName) {
            errors['tax-name'] = {
                errors: [t('taxNameEmpty')],
            };
        }
        if (!taxValue || typeof taxValue !== 'number') {
            errors['tax-value'] = {
                errors: [t('taxValueEmpty')],
            };
        }
        if (!taxType) {
            errors['tax-type'] = {
                errors: [t('taxTypeEmpty')],
            };
        }
        if (Object.keys(errors).length > 0) {
            form.setFields(Object.entries(errors).map(([key, value]) => ({
                name: key,
                errors: value.errors,
            })));
            return;
        }

        const round = Constant.roundOffs.taxSplit;
        let totalRounded = 0;
        let shares: number[] = [];

        const equalShare = taxValue / (fieldsCount + 1);

        for (let i = 0; i < fieldsCount + 1; i++) {
          const roundedValue = parseFloat((equalShare).toFixed(round));
          shares.push(roundedValue);
          totalRounded += roundedValue;
        }

        const difference = parseFloat((taxValue - totalRounded).toFixed(round));
        shares[shares.length - 1] += difference;

        const existingSubTaxFields = values['form-sub-tax-list'] || [];
        const updatedValues = shares.map((value, idx) => ({
            name: existingSubTaxFields[idx]?.name, // Retain or create new name
            value,
            type: taxType,
        }));

        form.setFieldsValue({
          'form-sub-tax-list': updatedValues,
        });

        return true;
    };

    const handleTaxValueChange = (newTaxValue: number) => {
        const currentValues = form.getFieldsValue();
        const fieldsCount = currentValues['form-sub-tax-list']?.length || 0;

        if (!newTaxValue || typeof newTaxValue !== 'number' || fieldsCount === 0) {
          return;
        }

        const round = Constant.roundOffs.taxSplit;
        let totalRounded = 0;
        let shares: number[] = [];

        const equalShare = newTaxValue / fieldsCount;

        for (let i = 0; i < fieldsCount; i++) {
          const roundedValue = parseFloat(equalShare.toFixed(round));
          shares.push(roundedValue);
          totalRounded += roundedValue;
        }

        const difference = parseFloat((newTaxValue - totalRounded).toFixed(round));
        shares[shares.length - 1] += difference;

        const updatedValues = currentValues['form-sub-tax-list'].map((field: any, index: number) => ({
          ...field,
          value: shares[index],
        }));

        form.setFieldsValue({
          'form-sub-tax-list': updatedValues,
          'tax-value': newTaxValue,
        });
    };

    const handleTaxTypeChange = (newTaxType: string) => {
        const currentValues = form.getFieldsValue();
        const fieldsCount = currentValues['form-sub-tax-list']?.length || 0;

        if (fieldsCount === 0) {
          return;
        }

        const updatedTypes = currentValues['form-sub-tax-list'].map((field: any) => ({
          ...field,
          type: newTaxType,
        }));

        form.setFieldsValue({
          'form-sub-tax-list': updatedTypes,
          'tax-type': newTaxType,
        });
    };

    const handleSubTaxTypeChange = (newSubTaxType: string) => {
        const currentValues = form.getFieldsValue();
        const fieldsCount = currentValues['form-sub-tax-list']?.length || 0;

        if (fieldsCount === 0) {
          return;
        }

        const updatedSubTaxes = currentValues['form-sub-tax-list'].map((field: any) => ({
          ...field,
          type: newSubTaxType,
        }));

        form.setFieldsValue({
          'form-sub-tax-list': updatedSubTaxes,
          'tax-type': newSubTaxType,
        });
    };

    const handleRemoveSubTaxField = (index: number, remove: any) => {
        remove(index);

        const values = form.getFieldsValue();
        const taxValue = values['tax-value'];

        if (!taxValue || typeof taxValue !== 'number') return;

        const remainingFields = form.getFieldValue('form-sub-tax-list') || [];
        const newCount = remainingFields.length;

        const newSplitValues = recalculateSubTaxValues(taxValue, newCount);

        const updatedFields = newSplitValues.map((value: number, idx: number) => ({
            name: [`form-sub-tax-list`, idx, 'value'],
            value,
        }));

        form.setFields(updatedFields);
    };
    
    const recalculateSubTaxValues = (taxValue: number, count: number) => {
        const roundTo = Constant.roundOffs.taxSplit;
        let total = taxValue;

        let baseValue = parseFloat((total / count).toFixed(roundTo));
        const values = new Array(count).fill(baseValue);

        const currentTotal = values.reduce((acc, val) => acc + val, 0);
        values[values.length - 1] += parseFloat((total - currentTotal).toFixed(roundTo));

        return values;
    };

    return (
        <Modal
          title={t('addTaxText')}
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
            name='form-add-tax'
            id='form-add-tax'
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            onKeyDown={(event) => Utility.handleEnterKey(event, 'form-add-tax')}
            layout="vertical"
          >
            <Row gutter={16}>
                <Col lg={24} md={24} sm={24} xs={24}>
                    <Form.Item
                    initialValue={branchStore.branches.map(branch => branch._id)}
                    label={
                    <>
                        {t('branchesText')}
                        <Tooltip placement="right" title={t('taxBranchesTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                        </Tooltip>
                    </>
                    }
                    name='tax-branch'
                    id="tax-branch"
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
                <Col lg={12} md={12} sm={24} xs={24}>
                    <Form.Item
                    label={
                    <>
                    {t('taxNameText')}
                    <Tooltip placement="right" title={t('taxNameTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='tax-name'
                    id="tax-name"
                    rules={[
                    {
                        required: true,
                        message: t('taxNameEmpty'),
                    },
                    ]}
                    >
                        <Input placeholder={t('taxNameText')} />
                    </Form.Item>
                </Col>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Form.Item
                    label={
                    <>
                    {t('taxValueText')}
                    <Tooltip placement="right" title={t('taxValueTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='tax-value'
                    id="tax-value"
                    rules={[
                    {
                        required: true,
                        message: t('taxValueEmpty'),
                    },
                    ]}
                    >
                        <InputNumber style={{ width: '100%' }}
                        placeholder={t('taxValueText')}
                        onChange={(value: any) => handleTaxValueChange(value)}
                        />
                    </Form.Item>
                </Col>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Form.Item
                    initialValue='percentage'
                    label={
                    <>
                    {t('taxTypeText')}
                    <Tooltip placement="right" title={t('taxTypeTooltipText')}>
                        <InfoCircleOutlined
                        style={{ marginLeft: 8 }} />
                    </Tooltip>
                    </>
                    }
                    name='tax-type'
                    id="tax-type"
                    rules={[
                    {
                        required: true,
                        message: t('taxTypeEmpty'),
                    },
                    ]}
                    >
                        <Select placeholder={t('taxTypeText')}
                        onChange={(value) => handleTaxTypeChange(value)}
                        >
                            <Select.Option key='tax-type-percentage' value='percentage'>
                                {t('percentageText')}
                            </Select.Option>
                            <Select.Option key='tax-type-amount' value='amount'>
                                {t('amountText')}
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Form.List name="form-sub-tax-list">
                {(fields, { add, remove }) => (
                    <>
                    {fields.map(({ key, name, ...restField }, index) => (
                        <Row gutter={16} key={key}>
                        <Col lg={12} md={12} sm={24} xs={24}>
                            <Form.Item
                            label={
                                <>
                                {t('subTaxNameText')}
                                <Tooltip placement="right" title={t('subTaxNameTooltipText')}>
                                    <InfoCircleOutlined
                                    style={{ marginLeft: 8 }} />
                                </Tooltip>
                                </>
                            }
                            {...restField}
                            name={[name, 'name']}
                            rules={[{ 
                                required: true, 
                                message: t('subTaxNameEmpty')
                            }]}
                            >
                            <Input placeholder={t('subTaxNameText')} />
                            </Form.Item>
                        </Col>
                        <Col lg={6} md={6} sm={12} xs={12}>
                            <Form.Item
                            label={
                                <>
                                {t('subTaxValueText')}
                                <Tooltip placement="right" title={t('subTaxValueTooltipText')}>
                                    <InfoCircleOutlined
                                    style={{ marginLeft: 8 }} />
                                </Tooltip>
                                </>
                            }
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ 
                                required: true, 
                                message: t('subTaxValueEmpty')
                            }]}
                            >
                            <Input placeholder={t('subTaxValueText')} />
                            </Form.Item>
                        </Col>
                        <Col lg={6} md={6} sm={12} xs={12}>
                            <Form.Item
                            initialValue='percentage'
                            label={
                                <>
                                {t('subTaxTypeText')}
                                <Tooltip placement="right" title={t('subTaxTypeTooltipText')}>
                                    <InfoCircleOutlined
                                    style={{ marginLeft: 8 }} />
                                </Tooltip>
                                </>
                            }
                            {...restField}
                            name={[name, 'type']}
                            rules={[{ 
                                required: true, 
                                message: t('subTaxTypeEmpty')
                            }]}
                            >
                                 <Select placeholder={t('subTaxTypeText')}
                                 onChange={(value) => handleSubTaxTypeChange(value)}
                                 >
                                    <Select.Option key='sub-tax-type-percentage' value='percentage'>
                                        {t('percentageText')}
                                    </Select.Option>
                                    <Select.Option key='sub-tax-type-amount' value='amount'>
                                        {t('amountText')}
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col lg={24}>
                            <Form.Item>
                            <Button icon={<MinusOutlined />} 
                            onClick={() => handleRemoveSubTaxField(index, remove)}
                            block
                            variant="dashed"
                            color="danger"
                            >
                                {t('removeSubTaxText')}
                            </Button>
                            </Form.Item>
                        </Col>
                        </Row>
                    ))}
                    <Form.Item>
                        <Button  
                        variant="dashed"
                        color="primary"
                        onClick={() => {
                            handleAddSubTaxField(fields.length)
                        }} 
                        block icon={<PlusOutlined />}
                        >
                        {t('addSubTaxText')}
                        </Button>
                    </Form.Item>
                    </>
                )}
                </Form.List>
          </Form>
          <Mandatory />
        </Modal>
    );
};

export default inject('globalStore')(observer(AddTax));