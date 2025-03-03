"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRole = void 0;
const mongodb_1 = require("mongodb");
exports.usersRole = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'System Admin',
        level: 0,
        access: null,
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
