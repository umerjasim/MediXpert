import queryString from "query-string";
import api from "./api";

class SaleService {

    getMasterData = async () => {
        const url = `/sale/getMasterData`;
        return api.get(url);
    }

    getItems = async (item: string) => {
        const query = queryString.stringify({ item }, { skipNull: true });
        const url = `/sale/getItems/${item}`;
        return api.get(url);
    }

    generateInvoice = async (data: any[]) => {
        const url = `/sale/generateInvoice`;
        return api.post(url, data);
    }

    confirmPayment = async (data: any[]) => {
        const url = `/sale/confirmPayment`;
        return api.post(url, data);
    }
}

export default new SaleService();