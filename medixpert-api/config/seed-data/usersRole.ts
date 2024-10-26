import { ObjectId } from "mongodb";
import { UsersRole } from "../dbTypes";

export const usersRole: UsersRole[] = [
    { 
        _id: new ObjectId(), 
        name: 'System Admin', 
        level: 0,
        access: null,
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