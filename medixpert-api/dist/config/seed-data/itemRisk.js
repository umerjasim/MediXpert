"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemRisk = void 0;
const mongodb_1 = require("mongodb");
exports.itemRisk = [
    {
        _id: new mongodb_1.ObjectId(),
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
        _id: new mongodb_1.ObjectId(),
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
        _id: new mongodb_1.ObjectId(),
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
        _id: new mongodb_1.ObjectId(),
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
