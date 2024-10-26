import { runInAction } from "mobx";
import i18n from "../i18n";
import { Outlets } from "../Global/DataTypes";
import outletService from "../Service/outletService";


class OutletStore {
    outlets: Outlets[] = [];

    getOutlets = async () => {
        try {
            const response: any = await outletService.getOutlets();
            if (response && response?.data) {
                runInAction(() => {
                    this.outlets = response?.data?.outlets;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

};

export default new OutletStore();