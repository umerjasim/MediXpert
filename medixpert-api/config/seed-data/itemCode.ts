import { ObjectId } from "mongodb";
import { ItemCode } from "../dbTypes";

export const itemCode: ItemCode[] = [
    { 
        _id: new ObjectId(), 
        name: 'Normal',
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
        name: 'H1',
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
    }
];