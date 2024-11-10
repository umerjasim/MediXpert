import queryString from "query-string";
import api from "./api";
import dayjs from "dayjs";

class PurchaseEntryService {

    getMasterData = async () => {
        const url = `/purchase-entry/getMasterData`;
        return api.get(url);
    }

    addPurchaseEntry = async (data: any) => {
        const url = `/purchase-entry/addPurchaseEntry`;
        return api.post(url, data);
    }

    getApprovePurchaseEntry = async (dateRange: any) => {
        const { from, to } = dateRange;
        const query = queryString.stringify({
            from: dayjs(from).format('DD-MM-YYYY'),
            to: dayjs(to).format('DD-MM-YYYY'),
        }, { skipNull: true });
        const url =  `/purchase-entry/getApprovePurchaseEntry?${query}`;
        return api.get(url);
    }

    approvePurchaseEntry = async (data: any) => {
        const url = `/purchase-entry/approvePurchaseEntry`;
        return api.post(url, data);
    }

    getPurchaseEntryItems = async (id: any) => {
        const url =  `/purchase-entry/getPurchaseEntryItems/${id}`;
        return api.get(url);
    }

}

export default new PurchaseEntryService();
