import { runInAction } from "mobx";
import i18n from "../i18n";
import taxService from "../Service/taxService";


class TaxStore {
    taxes = [];

    getTaxes = async () => {
        try {
            const response: any = await taxService.getTaxes();
            if (response && response?.data) {
                runInAction(() => {
                    this.taxes = response?.data?.taxes;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

    addTax = async (data: any) => {
        try {
          const response: any = await taxService.addTax(data);
          if (response) {
            return Promise.resolve(response);
          }
        } catch (error : any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

};

export default new TaxStore();