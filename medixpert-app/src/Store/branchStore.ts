import { runInAction } from "mobx";
import supplierService from "../Service/supplierService";
import i18n from "../i18n";
import branchService from "../Service/branchService";
import { Branches } from "../Global/DataTypes";


class BranchStore {
    branches: Branches[] = [];

    getBranches = async () => {
        try {
            const response: any = await branchService.getBranches();
            if (response && response?.data) {
                runInAction(() => {
                    this.branches = response?.data?.branches;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

};

export default new BranchStore();