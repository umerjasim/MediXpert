import { ObjectId } from "mongodb";
import { UsersAccess } from "../dbTypes";

export const usersAccess: UsersAccess[] = [
    { 
        _id: new ObjectId(), 
        userId: null, 
        mainPages: null,
        subPages: null,
        subModules: null,
        branches: null,
        outlets: null,
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