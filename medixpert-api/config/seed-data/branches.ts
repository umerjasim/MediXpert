import { ObjectId } from "mongodb";
import { Branches } from "../dbTypes";

export const branches: Branches[] = [
    { 
        _id: new ObjectId(), 
        name: 'Main',
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