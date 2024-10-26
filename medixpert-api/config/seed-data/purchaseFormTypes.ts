import { ObjectId } from "mongodb";
import { PurchaseFormTypes } from "../dbTypes";

export const purchaseFormTypes: PurchaseFormTypes[] = [
    { 
        _id: new ObjectId(), 
        name: 'Form 8',
        branches: null,
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
        name: 'Form 8B',
        branches: null,
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
        name: 'Form 8H',
        branches: null,
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