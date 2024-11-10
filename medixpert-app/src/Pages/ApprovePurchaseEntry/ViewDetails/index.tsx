import { Collapse, Descriptions, DescriptionsProps, Divider, Modal } from "antd";
import dayjs from "dayjs";
import { t } from "i18next";
import { inject, observer } from "mobx-react";
import { ItemType } from "rc-collapse/es/interface";
import Constant from "../../../Global/Constant";

interface ViewDetailsProps {
    isModalOpen: boolean;
    handleOk: (values: any) => void;
    data: any[]
}
  
const ViewDetails: React.FC<ViewDetailsProps> = ({
    isModalOpen,
    handleOk,
    data = []
}) => {

    const items: ItemType[] | undefined = data.map((item: any, index) => ({
        key: String(index),
        label: <span style={{ fontWeight: 600 }}>{item?.itemName}</span>,
        children: (
            <>
                <Descriptions
                    bordered
                    // title={item?.itemName}
                    size={'small'}
                    // extra={<Button type="primary">Edit</Button>}
                    items={[
                        { 
                            key: '1', 
                            label: t('manufacturerText'), 
                            children: item?.manufacturer 
                        },
                        { 
                            key: '2', 
                            label: t('hsnNoText'), 
                            children: item?.hsnNo 
                        },
                        { 
                            key: '3', 
                            label: t('batchNoText'), 
                            children: item?.batchNo 
                        },
                        { 
                            key: '4', 
                            label: t('rackNoText'), 
                            children: item?.rackNo 
                        },
                        { 
                            key: '5', 
                            label: t('expiryText'), 
                            children: item?.expiry ? dayjs(item?.expiry).format('DD MMM, YYYY') : ''
                        },
                        { 
                            key: '6', 
                            label: t('packText'), 
                            children: item?.pack
                        },
                        { 
                            key: '7', 
                            label: t('packUnitText'), 
                            children: item?.packUnit
                        },
                        { 
                            key: '8', 
                            label: t('quantityText'), 
                            children: item?.qty
                        },
                        { 
                            key: '9', 
                            label: t('totalQuantityText'), 
                            children: item?.totalQty
                        },
                        { 
                            key: '10', 
                            label: t('freeQuantityText'), 
                            children: item?.freeQty
                        },
                        { 
                            key: '11', 
                            label: t('totalFreeQuantityText'), 
                            children: item?.totalFreeQty
                        },
                        { 
                            key: '12', 
                            label: t('rateText'), 
                            children: item?.rate.toFixed(Constant.roundOffs.purchaseEntry.rate) + ' ' +
                                (Constant.currencySymbol || Constant.currencyShort)
                        },
                        { 
                            key: '13', 
                            label: t('totalCostText'), 
                            children: item?.totalCost
                                .toFixed(Constant.roundOffs.purchaseEntry.totalCost) + ' ' +
                                (Constant.currencySymbol || Constant.currencyShort)
                        },
                        { 
                            key: '14', 
                            label: t('costPerQuantityText'), 
                            children: item?.costPerQty
                                .toFixed(Constant.roundOffs.purchaseEntry.costPerQty) + ' ' +
                                (Constant.currencySymbol || Constant.currencyShort)
                        },
                        { 
                            key: '15', 
                            label: t('mrpText'), 
                            children: item?.mrp.toFixed(Constant.roundOffs.purchaseEntry.mrp) + ' ' +
                                (Constant.currencySymbol || Constant.currencyShort)
                        },
                        { 
                            key: '16', 
                            label: t('mrpPerQuantityText'), 
                            children: item?.mrpPerQty
                                .toFixed(Constant.roundOffs.purchaseEntry.mrpPerQty) + ' ' +
                                (Constant.currencySymbol || Constant.currencyShort)
                        },
                        { 
                            key: '17', 
                            label: t('discountText'), 
                            children: item?.discount
                        },
                        { 
                            key: '18', 
                            label: t('discountAmountText'), 
                            children: item?.discountAmount
                                .toFixed(Constant.roundOffs.purchaseEntry.discount) + ' ' + 
                                (Constant.currencySymbol || Constant.currencyShort)
                        },
                        { 
                            key: '19', 
                            label: <span style={{ fontWeight: 600 }}>{t('totalAmountText')}</span>, 
                            children: <span style={{ fontWeight: 600 }}>{item?.totalAmount
                                .toFixed(Constant.roundOffs.purchaseEntry.totalAmount) + ' ' +
                                (Constant.currencySymbol || Constant.currencyShort)}</span>
                        },
                        { 
                            key: '20', 
                            label: t('taxText'), 
                            children: (
                                <>
                                    {item?.tax?.type === 'percentage' ? (
                                        <>
                                            {
                                                item?.tax?.name + ' ( ' + item?.tax?.value + ' % )'
                                            }
                                        </>
                                    ) : (
                                        <>
                                            {
                                                item?.tax?.name + ' ( ' + item?.tax?.value + ' ' +
                                                Constant.currencySymbol || Constant.currencyShort +
                                                ' )'
                                            }
                                        </>
                                    )}
                                </>
                            )
                        },
                        { 
                            key: '21', 
                            label: t('taxInclusiveText'), 
                            children: item?.taxInclusive ? 'Yes' : 'No'
                        },
                        { 
                            key: '22', 
                            label: t('taxOnFreeText'), 
                            children: item?.taxForFree ? (
                                <>
                                    {item?.taxForFree?.type === 'percentage' ? (
                                        <>
                                            {
                                                item?.taxForFree?.name + ' ( ' + 
                                                item?.taxForFree?.value + ' % )'
                                            }
                                        </>
                                    ) : (
                                        <>
                                            {
                                                item?.taxForFree?.name + ' ( ' + 
                                                item?.taxForFree?.value + ' ' +
                                                Constant.currencySymbol || Constant.currencyShort +
                                                ' )'
                                            }
                                        </>
                                    )}
                                </>
                            ) : null
                        },
                        { 
                            key: '23', 
                            label: t('marginText') + ' (%)', 
                            children: item?.margin
                        },
                        { 
                            key: '24', 
                            label: t('ptrText'), 
                            children: item?.ptr
                        },
                        { 
                            key: '25', 
                            label: t('outletText'), 
                            children: item?.outlet
                        },
                    ]}
                />
            </>
        )
    }));

    return (
        <Modal
            title={t('itemsText')}
            open={isModalOpen}
            onOk={handleOk}
            maskClosable={false}
            okText={t('okText')}
            cancelButtonProps={{ style: { display: 'none' } }}
            width={1000}
            centered
            onCancel={handleOk}
        >
            <Divider />
            <div style={{ height: '60vh', overflowY: 'auto', paddingRight: 5 }}>
                <Collapse
                size="small"
                items={items}
                defaultActiveKey={data.map((_, index) => String(index))}
                />
            </div>
        </Modal>
      );
};
  
export default inject('globalStore')(observer(ViewDetails));