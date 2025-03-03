"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainPages = void 0;
const mongodb_1 = require("mongodb");
exports.mainPages = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'Dashboard',
        title: 'Dashboard',
        route: '/dashboard',
        icon: 'DashboardFilled',
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
