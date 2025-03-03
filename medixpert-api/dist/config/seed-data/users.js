"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const mongodb_1 = require("mongodb");
exports.users = [
    {
        _id: new mongodb_1.ObjectId(),
        userId: null,
        titleId: null,
        name: {
            first: 'System',
            last: 'Admin'
        },
        dob: null,
        age: {
            number: null,
            on: null
        },
        picture: {
            fileName: null,
            filePath: null,
            fileSize: null,
            fileType: null
        },
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
