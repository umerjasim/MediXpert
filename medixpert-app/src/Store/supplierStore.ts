import { runInAction } from "mobx";
import supplierService from "../Service/supplierService";
import i18n from "../i18n";
import { Suppliers } from "../Global/DataTypes";


class SupplierStore {
    suppliers = [];

    getSuppliers = async () => {
        try {
            const response: any = await supplierService.getSuppliers();
            if (response && response?.data) {
                runInAction(() => {
                    this.suppliers = response?.data?.suppliers;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

    addSupplier = async (data: any) => {
        try {
          const response: any = await supplierService.addSupplier(data);
          if (response) {
            return Promise.resolve(response);
          }
        } catch (error : any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

};

export default new SupplierStore();