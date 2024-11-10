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
}

export default new SaleService();