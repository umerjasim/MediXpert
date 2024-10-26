import api from "./api";

class AccessPagesService {

    getAccessPages = async (user: object) => {
        const url = `/accessPages/getAccessPages`;
        return api.post(url, user);
    }
}

export default new AccessPagesService();
