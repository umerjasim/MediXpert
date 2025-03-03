"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemQtyUnit = void 0;
const mongodb_1 = require("mongodb");
exports.itemQtyUnit = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'Number',
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
        name: 'Mg',
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
        name: 'Strip',
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
