import api from "./api";

class ItemService {

    getMasterData = async () => {
        const url = `/item/getMasterData`;
        return api.get(url);
    }

    addItem = async (data: any) => {
        const url = `/item/addItem`;
        return api.post(url, data);
    }

    getItems = async () => {
        const url = `/item/getItems`;
        return api.get(url);
    }
}

export default new ItemService();
