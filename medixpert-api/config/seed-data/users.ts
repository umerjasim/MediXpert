import { ObjectId } from "mongodb";
import { Users } from "../dbTypes";

export const users: Users[] = [
    { 
        _id: new ObjectId(), 
        userId: null, 
        titleId: null,
        name: {
            first: 'System',
            last: 'Admin'
        },
        dob: null,
        age: {
            number: null,
            on: null
        },
        picture: {
            fileName: null,
            filePath: null,
            fileSize: null,
            fileType: null
        },
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