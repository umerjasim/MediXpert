import api from "./api";

class SupplierService {

    getSuppliers = async () => {
        const url = `/supplier/getSuppliers`;
        return api.get(url);
    }

    addSupplier = async (data: any) => {
        const url = `/supplier/addSupplier`;
        return api.post(url, data);
    }
}

export default new SupplierService();
