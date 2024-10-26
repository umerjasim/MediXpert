import { runInAction } from "mobx";
import { AccessPagesType } from "../Global/DataTypes";
import accessPagesService from "../Service/accessPagesService";
import i18n from "../i18n";
import globalStore from "./globalStore";

class AccessPagesStore {
    accessPages: AccessPagesType[] | [] = [];

    getAccessPages = async (user: object) => {
        try {
            const response: any = await accessPagesService.getAccessPages(user);
            if (response && response?.data) {
                globalStore.setPages(response?.data?.accessPages);
                runInAction(() => {
                    this.accessPages = response?.data?.accessPages;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }
};

export default new AccessPagesStore();