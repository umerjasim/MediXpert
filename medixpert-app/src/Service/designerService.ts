import queryString from "query-string";
import api from "./api";
import dayjs from "dayjs";

class DesignerService {

    getData = async () => {
        const url = `/designer/getData`;
        return api.get(url);
    }

    saveContent = async (data: any[]) => {
        const url = `/designer/saveContent`;
        return api.post(url, data);
    }

}

export default new DesignerService();