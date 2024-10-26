import api from "./api";

class BranchService {

    getBranches = async () => {
        const url = `/branch/getBranches`;
        return api.get(url);
    }
}

export default new BranchService();
