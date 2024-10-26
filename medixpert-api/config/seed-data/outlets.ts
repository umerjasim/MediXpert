import { ObjectId } from "mongodb";
import { Outlets } from "../dbTypes";

export const outlets: Outlets[] = [
    { 
        _id: new ObjectId(), 
        name: 'Outlet 1',
        branchId: null,
        active: true,
        created: {
            on: new Date().toLocaleString(),
            by: 'system',
            date: new Date()
        },
        modified: {
            on: null,
            by: null,
            date: null
        }
    },
]