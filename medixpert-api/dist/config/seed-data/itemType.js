"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemType = void 0;
const mongodb_1 = require("mongodb");
exports.itemType = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'Alcohol',
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
        _id: new mongodb_1.ObjectId(),
        name: 'Tablet',
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
        _id: new mongodb_1.ObjectId(),
        name: 'Injection',
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
        _id: new mongodb_1.ObjectId(),
        name: 'Ointments',
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
