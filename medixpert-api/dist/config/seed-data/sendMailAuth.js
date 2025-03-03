"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailAuth = void 0;
const mongodb_1 = require("mongodb");
const utility_1 = require("../../utility/utility");
exports.sendMailAuth = {
    _id: new mongodb_1.ObjectId(),
    mail: process.env.SEND_MAIL,
    passKey: (0, utility_1.encrypt)(process.env.SEND_MAIL_PASS_KEY),
    active: true,
    created: {
        by: 'system',
        on: new Date().toLocaleString(),
        date: new Date()
    },
    modified: {
        by: null,
        on: null,
        date: null
    }
};
