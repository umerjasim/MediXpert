import { ObjectId } from "mongodb";
import { ItemRisk } from "../dbTypes";

export const itemRisk: ItemRisk[] = [
    { 
        _id: new ObjectId(), 
        name: 'Normal',
        color: 'green',
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
        name: 'Medium',
        color: 'orange',
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
        name: 'High',
        color: 'Red',
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
        name: 'Banned',
        color: 'maroon',
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