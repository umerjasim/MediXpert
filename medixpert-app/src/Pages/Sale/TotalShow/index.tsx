import { Descriptions, Popover } from "antd";
import Constant from "../../../Global/Constant";
import { t } from "i18next";
import globalStore from "../../../Store/globalStore";

interface TotalShowProps {
    isOpen: boolean;
    totalAmount: {
        amount: number;
        discount: number;
        tax: number;
    };
    title?: string;
    children: React.ReactNode;
}

const TotalShow: React.FC<TotalShowProps> = ({
    isOpen,
    totalAmount,
    title = '',
    children
  }) => {

    return (
        <Popover
        title={title}
        content={totalAmount && (
            <>
            {totalAmount.discount ? (
                <Descriptions 
                column={4}
                bordered 
                size="small" 
                layout="vertical">
                    <Descriptions.Item label={t('amountText')} >
                        {totalAmount?.amount?.toFixed(Constant.roundOffs.sale.amount) + ' ' +
                        (Constant.currencySymbol || Constant.currencyShort)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('discountText')} >
                        {totalAmount?.discount?.toFixed(Constant.roundOffs.sale.discount) + ' ' +
                        (Constant.currencySymbol || Constant.currencyShort)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('taxText')} >
                        {totalAmount?.tax?.toFixed(Constant.roundOffs.sale.tax) + ' ' +
                        (Constant.currencySymbol || Constant.currencyShort)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('totalText')} >
                        <span style={{ fontWeight: 600 }}>
                            {((totalAmount?.amount - totalAmount?.discount) + totalAmount?.tax)
                                ?.toFixed(Constant.roundOffs.sale.amount) + ' ' +
                            (Constant.currencySymbol || Constant.currencyShort)}
                        </span>
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <Descriptions 
                column={3}
                bordered 
                size="small" 
                layout="vertical">
                    <Descriptions.Item label={t('amountText')} >
                        {totalAmount?.amount?.toFixed(Constant.roundOffs.sale.amount) + ' ' +
                        (Constant.currencySymbol || Constant.currencyShort)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('taxText')} >
                        {totalAmount?.tax?.toFixed(Constant.roundOffs.sale.tax) + ' ' +
                        (Constant.currencySymbol || Constant.currencyShort)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('totalText')} >
                        <span style={{ fontWeight: 600 }}>
                            {(totalAmount?.amount + totalAmount?.tax)
                                ?.toFixed(Constant.roundOffs.sale.amount) + ' ' +
                            (Constant.currencySymbol || Constant.currencyShort)}
                        </span>
                    </Descriptions.Item>
                </Descriptions>
            )}
            </>
        )}
        placement={globalStore.screenSize.lg || globalStore.screenSize.lg ?
            "topRight" : "top"}
        arrow={false}
        open={isOpen}
        >
            {children}
        </Popover>
    );
}

export default TotalShow;