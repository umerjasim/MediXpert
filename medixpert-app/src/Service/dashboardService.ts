import queryString from "query-string";
import api from "./api";
import dayjs from "dayjs";

class DashboardService {

    getTotalData = async (data: any) => {
        const from = data?.dateRange?.[0];
        const to = data?.dateRange?.[1];
        const presetDateRange = data?.presetDateRange;

        const query = queryString.stringify({
            from: dayjs(from).format('DD-MM-YYYY'),
            to: dayjs(to).format('DD-MM-YYYY'),
            preset: presetDateRange
        }, { skipNull: true });

        const url = `/dashboard/getTotalData?${query}`;
        return api.get(url);
    }

    getBranchOutletData = async (data: any) => {
        const from = data?.dateRange?.[0];
        const to = data?.dateRange?.[1];
        const presetDateRange = data?.presetDateRange;
        const outletSegment = data?.outletSegment;
        const branchSegment = data?.branchSegment;

        const query = queryString.stringify({
            from: dayjs(from).format('DD-MM-YYYY'),
            to: dayjs(to).format('DD-MM-YYYY'),
            preset: presetDateRange,
            outletSegment,
            branchSegment
        }, { skipNull: true });

        const url = `/dashboard/getBranchOutletData?${query}`;
        return api.get(url);
    }

    getBranchOutletPatientData = async (data: any) => {
        const from = data?.dateRange?.[0];
        const to = data?.dateRange?.[1];
        const presetDateRange = data?.presetDateRange;
        const branchOrOutlet = data?.branchOrOutlet;

        const query = queryString.stringify({
            from: dayjs(from).format('DD-MM-YYYY'),
            to: dayjs(to).format('DD-MM-YYYY'),
            preset: presetDateRange,
            segment: branchOrOutlet
        }, { skipNull: true });

        const url = `/dashboard/getBranchOutletPatientData?${query}`;
        return api.get(url);
    }

}

export default new DashboardService();