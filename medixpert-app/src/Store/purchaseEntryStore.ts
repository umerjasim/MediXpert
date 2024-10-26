import { runInAction } from "mobx";
import i18n from "../i18n";
import { PurchaseFormTypes } from "../Global/DataTypes";
import purchaseEntryService from "../Service/purchaseEntryService";


class PurchaseEntryStore {
    items = [];
    manufacturers = [];
    qtyUnits = [];
    taxes = [];
    outlets = [];
    suppliers = [];
    purchaseFormTypes: PurchaseFormTypes[] = [];
    purchaseTypes = [];

    getMasterData = async () => {
        try {
            const response: any = await purchaseEntryService.getMasterData();
            ;
            if (response && response?.data) {
                runInAction(() => {
                    this.items = response?.data?.items;
                    this.manufacturers = response?.data?.manufacturers;
                    this.qtyUnits = response?.data?.qtyUnits;
                    this.taxes = response?.data?.taxes;
                    this.outlets = response?.data?.outlets;
                    this.suppliers = response?.data?.suppliers;
                    this.purchaseFormTypes = response?.data?.purchaseFormTypes;
                    this.purchaseTypes = response?.data?.purchaseTypes;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

    addPurchaseEntry = async (data: any) => {
        try {
          const response: any = await purchaseEntryService.addPurchaseEntry(data);
          console.log(data)
          if (response) {
            return Promise.resolve(response);
          }
        } catch (error : any) {
            console.log(error)
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }
};

export default new PurchaseEntryStore();