import api from "./api";

class OutletService {

    getOutlets = async () => {
        const url = `/outlet/getOutlets`;
        return api.get(url);
    }
}

export default new OutletService();
