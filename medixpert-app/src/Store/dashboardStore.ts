import { runInAction } from "mobx";
import i18n from "../i18n";
import dashboardService from "../Service/dashboardService";

class DashboardStore {
    branchTotalSale: any = {};
    outletTotalSale: any = {};
    branchCollectionTotalSale: any = {};
    outletCollectionTotalSale: any = {};
    patientCount: any = {};
    branchName: string = '';
    outletName: string = '';
    currentOutletWiseSum: any = [];
    currentBranchWiseSum: any = [];
    currentOutletWiseCollectionSum: any = [];
    currentBranchWiseCollectionSum: any = [];
    branchOutletPatientData: any = [];

    getTotalData = async (data: any) => {
        try {
            const response: any = await dashboardService.getTotalData(data);
            console.log(response)
            if (response) {
                runInAction(() => {
                    this.branchTotalSale = response?.data?.branchTotalSale;
                    this.outletTotalSale = response?.data?.outletTotalSale;
                    this.branchCollectionTotalSale = response?.data?.branchCollectionTotalSale;
                    this.outletCollectionTotalSale = response?.data?.outletCollectionTotalSale;
                    this.patientCount = response?.data?.patientVisitCount;
                    this.branchName = response?.data?.branchName;
                    this.outletName = response?.data?.outletName;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

    getBranchOutletData = async (data: any) => {
        try {
            const response: any = await dashboardService.getBranchOutletData(data);
            if (response && response?.data) {
                runInAction(() => {
                    this.branchName = response?.data?.branchName;
                    this.outletName = response?.data?.outletName;
                    this.currentOutletWiseSum = response?.data?.currentOutletWiseSum;
                    this.currentBranchWiseSum = response?.data?.currentBranchWiseSum;
                    this.currentOutletWiseCollectionSum = response?.data?.currentOutletWiseCollectionSum;
                    this.currentBranchWiseCollectionSum = response?.data?.currentBranchWiseCollectionSum;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

    getBranchOutletPatientData = async (data: any) => {
        try {
            const response: any = await dashboardService.getBranchOutletPatientData(data);
            if (response && response?.data) {
                runInAction(() => {
                    this.branchName = response?.data?.branchName;
                    this.outletName = response?.data?.outletName;
                    this.branchOutletPatientData = response?.data?.branchOutletPatientData;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }
}

export default new DashboardStore();