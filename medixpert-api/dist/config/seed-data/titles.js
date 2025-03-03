"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.titles = void 0;
const mongodb_1 = require("mongodb");
exports.titles = [
    {
        _id: new mongodb_1.ObjectId(),
        name: 'Mr',
        genderId: null,
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
        name: 'Mrs',
        genderId: null,
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
        name: 'Miss',
        genderId: null,
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
        name: 'Dr',
        genderId: null,
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
        name: 'Baby',
        genderId: null,
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
