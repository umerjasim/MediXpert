import { Col, Divider, Form, Modal, Row } from "antd";
import { t } from "i18next";
import Utility from "../../../Global/Utility";
import { inject, observer } from "mobx-react";

interface AddBranchProps {
    isModalOpen: boolean;
    handleOk: (values: any, form: any) => void;
    handleCancel: () => void;
    loading: boolean;
}

const AddBranch: React.FC<AddBranchProps> = ({
    isModalOpen,
    handleOk,
    handleCancel,
    loading
  }) => {

    const [form] = Form.useForm();

    return (
        <Modal
          title={t('addBranchText')}
          open={isModalOpen}
        //   onOk={onFinish}
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
            name='form-add-branch'
            id='form-add-branch'
            initialValues={{ remember: true }}
            // onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
            onKeyDown={(event) => Utility.handleEnterKey(event, 'form-add-branch')}
            layout="vertical"
          >
            <Row gutter={16}>
                <Col lg={24} md={24} sm={24} xs={24}>
                    {/* <Form.Item
                    initialValue={branchStor.branches.map(branch => branch._id)}
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
                    </Form.Item> */}
                </Col>
            </Row>
          </Form>
        </Modal>
    );
};

export default inject('globalStore')(observer(AddBranch));