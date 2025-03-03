"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersLogin = void 0;
const mongodb_1 = require("mongodb");
const constants_1 = require("../../helpers/constants");
exports.usersLogin = [
    {
        _id: new mongodb_1.ObjectId(),
        username: constants_1.defaultUsername,
        password: constants_1.defaultPassword,
        active: true,
        roleId: null,
        loginAttempts: {
            count: 0,
            lastDate: null
        },
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
