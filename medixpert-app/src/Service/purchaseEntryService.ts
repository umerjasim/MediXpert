import api from "./api";

class PurchaseEntryService {

    getMasterData = async () => {
        const url = `/purchase-entry/getMasterData`;
        return api.get(url);
    }

    addPurchaseEntry = async (data: any) => {
        const url = `/purchase-entry/addPurchaseEntry`;
        return api.post(url, data);
    }

}

export default new PurchaseEntryService();
