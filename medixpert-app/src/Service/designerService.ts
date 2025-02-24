import queryString from "query-string";
import api from "./api";
import dayjs from "dayjs";

class DesignerService {

    getData = async () => {
        const url = `/designer/getData`;
        return api.get(url);
    }

}

export default new DesignerService();