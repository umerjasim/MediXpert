"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemMaster = void 0;
const mongodb_1 = require("mongodb");
exports.itemMaster = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'Medicine',
        isDrug: true,
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
        name: 'General',
        isDrug: false,
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
