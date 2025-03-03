"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemCode = void 0;
const mongodb_1 = require("mongodb");
exports.itemCode = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'Normal',
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
        name: 'H1',
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
