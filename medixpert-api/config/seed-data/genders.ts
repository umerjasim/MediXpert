import { ObjectId } from "mongodb";
import { Gender, Title } from "../dbTypes";

export const genders: Gender[] = [
    { 
        _id: new ObjectId(), 
        name: 'Male', 
        code: 'M', 
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
        name: 'Female', 
        code: 'F',
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
        name: 'Others', 
        code: 'O',
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