import { ObjectId } from "mongodb";
import { ItemMaster } from "../dbTypes";

export const itemMaster: ItemMaster[] = [
    { 
        _id: new ObjectId(), 
        name: 'Medicine',
        isDrug: true,
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
    { 
        _id: new ObjectId(), 
        name: 'General',
        isDrug: false,
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