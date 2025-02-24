import { runInAction } from "mobx";
import i18n from "../i18n";
import designerService from "../Service/designerService";

class DesignerStore {
    pageSizes: any[] = [];
    hashtags: any[] = [];

    getData = async () => {
        try {
            const response: any = await designerService.getData();
            if (response) {
                runInAction(() => {
                    this.pageSizes = response?.data?.pageSizes;
                    this.hashtags = response?.data?.hashtags;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }
}

export default new DesignerStore();