import api from "./api";

class TaxService {

    getTaxes = async () => {
        const url = `/tax/getTaxes`;
        return api.get(url);
    }

    addTax = async (data: any) => {
        const url = `/tax/addTax`;
        return api.post(url, data);
    }
}

export default new TaxService();
