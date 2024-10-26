import { ObjectId } from "mongodb";
import { MainPages } from "../dbTypes";

export const mainPages: MainPages[] = [
    { 
        _id: new ObjectId(), 
        name: 'Dashboard',
        title: 'Dashboard',
        route: '/dashboard',
        icon: 'DashboardFilled',
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
];