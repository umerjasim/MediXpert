import api from "./api";

class LoginService {

    getBranchesAndOutlets = async () => {
        const url = `/login/getBranchesAndOutlets`;
        return api.get(url);
    }
}

export default new LoginService();
