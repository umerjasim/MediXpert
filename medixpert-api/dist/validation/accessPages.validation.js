"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.access = access;
const constants_1 = require("../helpers/constants");
const validator_1 = require("../helpers/validator");
function access() {
    return [
        (0, validator_1.BODY_STRING)('userId', constants_1.msg.userNotExist),
        (0, validator_1.BODY_STRING)('name', constants_1.msg.userNotExist),
        (0, validator_1.BODY_ARRAY)('accessPages', constants_1.msg.userNotExist),
        (0, validator_1.BODY_STRING)('roleId', constants_1.msg.userNotExist),
        (0, validator_1.BODY_STRING)('roleName', constants_1.msg.userNotExist),
    ];
}
