import { AutoComplete, Button, Col, Divider, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Tooltip, message } from "antd";
import { inject, observer } from "mobx-react";
import Notification from "../../../Global/Notification";
import { t } from "i18next";
import Utility from "../../../Global/Utility";
import itemStore from "../../../Store/itemStore";
import { InfoCircleOutlined, MinusCircleOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Mandatory } from "../../../Components/Mandatory";
import { useEffect, useState } from "react";
import branchStore from "../../../Store/branchStore";

interface AddItemProps {
  isModalOpen: boolean;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  loading: boolean;
}

const AddItem: React.FC<AddItemProps> = ({
  isModalOpen,
  handleOk,
  handleCancel,
  loading
}) => {

  const [form] = Form.useForm();

  const [genericInputValue, setGenericInputValue] = useState('');
  const [isDrug, setIsDrug] = useState<boolean>(true);

  useEffect(() => {
    const item = itemStore?.itemMaster?.find(item => item._id === itemStore?.itemMaster?.[0]?._id);
    setIsDrug(item ? item.isDrug : false);
  }, [itemStore?.itemMaster]);

  const onFinishFailed = () => {
    Notification.error({
      message: t('error'),
      description: t('fillRequiredFields')
    });
  };

  const onFinish = async (values: any) => {
    try {
      const values = await form.validateFields();
      if (genericInputValue) {
        values['generic-id'] = genericInputValue;
      }
      handleOk(values);
    } catch (error) {
      onFinishFailed();
    }
  };

  const handleGenericSelect = (value: any, option: any) => {
    setGenericInputValue(option.key);
  };

  const handleGenericChange = (value: any, option: any) => {
    setGenericInputValue(option.key);
  };

  const handleMasterTypeChange = (value: any) => {
    const item = itemStore?.itemMaster?.find(item => item._id === value);
    setIsDrug(item ? item.isDrug : false);
  };

  return (
    <Modal
      title={t('addItemText')}
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
        name='form-add-item'
        id='form-add-item'
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        onKeyDown={(event) => Utility.handleEnterKey(event, 'form-add-item')}
        layout="vertical"
      >
        <Row gutter={16}>
        <Col lg={24} md={24} sm={24} xs={24}>
          <Form.Item
              initialValue={branchStore.branches.map(branch => branch._id)}
              label={
              <>
                  {t('branchesText')}
                  <Tooltip placement="right" title={t('itemBranchesTooltipText')}>
                  <InfoCircleOutlined
                  style={{ marginLeft: 8 }} />
                  </Tooltip>
              </>
              }
              name='item-branch'
              id="item-branch"
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
            initialValue={itemStore?.itemMaster?.[0]?._id}
            label={
            <>
              {t('itemMasterTypeText')}
              <Tooltip placement="right" title={t('itemMasterTypeTooltipText')}>
                <InfoCircleOutlined
                 style={{ marginLeft: 8 }} />
              </Tooltip>
            </>
            }
            name='item-master-type'
            id="item-master-type"
            rules={[
              {
                required: true,
                message: t('itemMasterTypeEmpty'),
              },
            ]}
            >
              <Select onChange={handleMasterTypeChange}>
                {itemStore.itemMaster && itemStore.itemMaster.length > 0 && 
                itemStore.itemMaster.map((master: any) => (
                  <Select.Option key={master._id} value={master._id}>{master.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} sm={12} xs={12}>
          <Form.Item
            label={
            <>
              {t('itemNameText')}
              <Tooltip placement="right" title={t('itemNameTooltipText')}>
                <InfoCircleOutlined
                 style={{ marginLeft: 8 }} />
              </Tooltip>
            </>
            }
            name='item-name'
            id="item-name"
            rules={[
              {
                required: true,
                message: t('itemNameEmpty'),
              },
            ]}
            >
              <Input placeholder={t('itemNameText')} />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} sm={12} xs={12}>
          <Form.Item
            label={
              <>
                {t('genericNameText')}
                <Tooltip placement="right" title={t('genericNameTooltipText')}>
                  <InfoCircleOutlined
                  style={{ marginLeft: 8 }} />
                </Tooltip>
              </>
            }
            name='generic-name'
            id="generic-name"
            rules={[
              {
                required: isDrug,
                message: t('genericNameEmpty'),
              },
            ]}
            >
              <AutoComplete
                onSelect={handleGenericSelect}
                onChange={handleGenericChange}
                options={
                  itemStore.itemGeneric && itemStore.itemGeneric.length > 0 ? itemStore.itemGeneric.map(item => ({
                    value: item.name,
                    key: item._id,
                  })) : []
                }
                placeholder={t('genericNameText')}
                filterOption={(inputValue, option) =>
                  option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
              />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} sm={12} xs={12}>
          <Form.Item
            initialValue={itemStore?.itemType?.[0]?._id}
            label={
              <>
                {t('itemTypeText')}
                <Tooltip placement="right" title={t('itemTypeTooltipText')}>
                  <InfoCircleOutlined
                  style={{ marginLeft: 8 }} />
                </Tooltip>
              </>
            }
            name='item-type'
            id="item-type"
            rules={[
              {
                required: true,
                message: t('itemTypeEmpty'),
              },
            ]}
            >
              <Select>
                {itemStore.itemType && itemStore.itemType.length > 0 && 
                itemStore.itemType.map((type: any) => (
                  <Select.Option key={type._id} value={type._id}>{type.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} sm={12} xs={12}>
          <Form.Item
            initialValue={itemStore?.itemCategory?.[0]?._id}
            label={
              <>
                {t('itemCategoryText')}
                <Tooltip placement="right" title={t('itemCategoryTooltipText')}>
                  <InfoCircleOutlined
                  style={{ marginLeft: 8 }} />
                </Tooltip>
              </>
            }
            name='item-category'
            id="item-category"
            >
              <Select>
                {itemStore.itemCategory && itemStore.itemCategory.length > 0 && 
                itemStore.itemCategory.map((category: any) => (
                  <Select.Option key={category._id} value={category._id}>{category.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} sm={12} xs={12}>
          <Form.Item
            initialValue={itemStore?.itemQtyUnit?.[0]?._id}
            label={
            <>
              {t('itemQtyUnitText')}
              <Tooltip placement="right" title={t('itemQtyUnitTooltipText')}>
                <InfoCircleOutlined
                style={{ marginLeft: 8 }} />
              </Tooltip>
            </>
            }
            name='item-qty-unit'
            id="item-qty-unit"
            rules={[
              {
                required: true,
                message: t('itemQtyUnitEmpty'),
              },
            ]}
            >
              <Select>
                {itemStore.itemQtyUnit && itemStore.itemQtyUnit.length > 0 && 
                itemStore.itemQtyUnit.map((unit: any) => (
                  <Select.Option key={unit._id} value={unit._id}>{unit.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={12} md={12} sm={12} xs={12}>
          <Form.Item
            label={
            <>
              {t('itemReorderQtyText')}
              <Tooltip placement="right" title={t('itemReorderQtyTooltipText')}>
                <InfoCircleOutlined
                style={{ marginLeft: 8 }} />
              </Tooltip>
            </>
            }
            name='item-reorder-qty'
            id="item-reorder-qty"
            rules={[
              {
                required: true,
                message: t('itemReorderQtyEmpty'),
              },
            ]}
            >
              <InputNumber placeholder={t('itemReorderQtyText')} 
              style={{ width: '100%' }}/>
            </Form.Item>
          </Col>
          <Col lg={24} md={24} sm={24} xs={24}>
          {itemStore.itemRisk && itemStore.itemRisk.length > 0 && (
            <Form.Item 
            initialValue={itemStore?.itemRisk?.[0]?._id}
            label={
              <>
                {t('itemRiskText')}
                <Tooltip placement="right" title={t('itemRiskTooltipText')}>
                  <InfoCircleOutlined
                  style={{ marginLeft: 8 }} />
                </Tooltip>
              </>
            }
            name='item-risk'
            id="item-risk"
            rules={[
              {
                required: true,
                message: t('itemRiskEmpty'),
              },
            ]}
            >
              <Radio.Group>
                {itemStore.itemRisk.map((risk: any) => (
                  <Radio key={risk._id} value={risk._id} style={{ color: risk.color }}> {risk.name} </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          )}
          </Col>
        </Row>
        <Form.List name="form-item-remarks-list">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row gutter={16} key={key}>
                  <Col lg={24} md={24} sm={24} xs={24}>
                    <Form.Item
                      label={
                        <>
                          {t('itemRemarksTitleText')}
                          <Tooltip placement="right" title={t('itemRemarksTitleTooltipText')}>
                            <InfoCircleOutlined
                            style={{ marginLeft: 8 }} />
                          </Tooltip>
                        </>
                      }
                      {...restField}
                      name={[name, 'title']}
                      rules={[{ 
                        required: true, 
                        message: t('itemRemarksTitleEmpty')
                      }]}
                    >
                      <Input placeholder={t('itemRemarksTitleText')} />
                    </Form.Item>
                  </Col>
                  <Col lg={24} md={24} sm={24} xs={24}>
                    <Form.Item
                      label={
                        <>
                          {t('itemRemarksDescriptionText')}
                          <Tooltip placement="right" title={t('itemRemarksDescriptionTooltipText')}>
                            <InfoCircleOutlined
                            style={{ marginLeft: 8 }} />
                          </Tooltip>
                        </>
                      }
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ 
                        required: true, 
                        message: t('itemRemarksDescriptionEmpty')
                      }]}
                    >
                      <Input.TextArea placeholder={t('itemRemarksDescriptionText')} />
                    </Form.Item>
                  </Col>
                  <Col lg={24} md={24} sm={24} xs={24}>
                    <Form.Item>
                      <Button icon={<MinusOutlined />} 
                      onClick={() => remove(name)}
                      block 
                      variant="dashed"
                      color="danger"
                      >
                        {t('removeRemarksText')}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button 
                variant="dashed"
                color="primary"
                onClick={() => add()} 
                block icon={<PlusOutlined />}
                >
                  {t('addRemarksText')}
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

export default inject('globalStore')(observer(AddItem));
