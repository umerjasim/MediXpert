import { runInAction } from "mobx";
import i18n from "../i18n";
import loginService from "../Service/loginService";
import { Branches, Outlets } from "../Global/DataTypes";



class LoginStore {
    branches: Branches[] = [];
    outlets: Outlets[] = [];

    getBranchesAndOutlets = async () => {
        try {
            const response: any = await loginService.getBranchesAndOutlets();
            if (response && response?.data) {
                runInAction(() => {
                    this.branches = response?.data?.branches;
                    this.outlets = response?.data?.outlets;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }
};

export default new LoginStore();