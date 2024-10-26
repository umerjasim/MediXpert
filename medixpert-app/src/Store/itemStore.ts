import { runInAction } from "mobx";
import i18n from "../i18n";
import globalStore from "./globalStore";
import { ItemCategory, ItemCode, ItemGeneric, ItemMaster, ItemQtyUnit, ItemRisk, ItemType } from "../Global/DataTypes";
import itemService from "../Service/itemService";

class ItemStore {
    itemMaster: ItemMaster[] | [] = [];
    itemType: ItemType[] | [] = [];
    itemCategory: ItemCategory[] | [] = [];
    itemCode: ItemCode[] | [] = [];
    itemQtyUnit: ItemQtyUnit[] | [] = [];
    itemRisk: ItemRisk[] | [] = [];
    itemGeneric: ItemGeneric[] | [] = [];
    items = [];

    getMasterData = async () => {
        try {
            const response: any = await itemService.getMasterData();
            if (response && response?.data) {
                runInAction(() => {
                    this.itemMaster = response?.data?.itemMaster;
                    this.itemType = response?.data?.itemType;
                    this.itemCategory = response?.data?.itemCategory;
                    this.itemCode = response?.data?.itemCode;
                    this.itemQtyUnit = response?.data?.itemQtyUnit;
                    this.itemRisk = response?.data?.itemRisk;
                    this.itemGeneric = response?.data?.itemGeneric;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

    addItem = async (data: any) => {
        try {
          const response: any = await itemService.addItem(data);
          if (response) {
            return Promise.resolve(response);
          }
        } catch (error : any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }

    getItems = async () => {
        try {
            const response: any = await itemService.getItems();
            if (response && response?.data) {
                runInAction(() => {
                    this.items = response?.data?.items;
                });
            }
            return Promise.resolve(null)
        } catch (error: any) {
            return Promise.reject(error?.response?.data?.error?.message || i18n.t('defaultErrorMessage'));
        }
    }
};

export default new ItemStore();