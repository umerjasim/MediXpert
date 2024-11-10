import { runInAction } from "mobx";
import i18n from "../i18n";
import saleService from "../Service/saleService";

class SaleStore {
    titles = [];
    genders = [];
    items = [];

    getMasterData = async () => {
        try {
            const response: any = await saleService.getMasterData();
            if (response && response?.data) {
                runInAction(() => {
                    this.titles = response?.data?.titles;
                    this.genders = response?.data?.genders;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

    getItems = async (item: string) => {
        try {
            const response: any = await saleService.getItems(item);
            if (response && response?.data) {
                runInAction(() => {
                    this.items = response?.data?.items;
                });
                return Promise.resolve(null);
            }
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }
}

export default new SaleStore();