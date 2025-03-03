"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outlets = void 0;
const mongodb_1 = require("mongodb");
exports.outlets = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'Outlet 1',
        branchId: null,
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
