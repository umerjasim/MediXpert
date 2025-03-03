"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersAccess = void 0;
const mongodb_1 = require("mongodb");
exports.usersAccess = [
    {
        _id: new mongodb_1.ObjectId(),
        userId: null,
        mainPages: null,
        subPages: null,
        subModules: null,
        branches: null,
        outlets: null,
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
