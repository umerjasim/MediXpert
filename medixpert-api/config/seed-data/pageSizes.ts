import { ObjectId } from "mongodb";
import { PageSizes } from "../dbTypes";

export const pageSizes: PageSizes[] = [
    {
        _id: new ObjectId(), 
        name: "A4",
        height: { value: 297, unit: "mm" },
        width: { value: 210, unit: "mm" },
        default: 'p',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        _id: new ObjectId(),
        name: "A5",
        height: { value: 210, unit: "mm" },
        width: { value: 148, unit: "mm" },
        default: 'p',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        _id: new ObjectId(),
        name: "Letter",
        height: { value: 279.4, unit: "mm" },
        width: { value: 215.9, unit: "mm" },
        default: 'p',
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    }
]