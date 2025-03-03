"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const constants_1 = require("../helpers/constants");
const validator_1 = require("../helpers/validator");
function login() {
    return [
        (0, validator_1.BODY_STRING)('username', constants_1.msg.loginCredRequired),
        (0, validator_1.BODY_STRING)('password', constants_1.msg.loginCredRequired),
    ];
}
