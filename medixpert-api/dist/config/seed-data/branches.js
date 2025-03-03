"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branches = void 0;
const mongodb_1 = require("mongodb");
exports.branches = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'Main',
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
