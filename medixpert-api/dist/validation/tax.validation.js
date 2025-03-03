"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTax = addTax;
const constants_1 = require("../helpers/constants");
const validator_1 = require("../helpers/validator");
function addTax() {
    return [
        (0, validator_1.BODY_ARRAY)('tax-branch', constants_1.msg.missingRequiredValues),
        (0, validator_1.BODY_STRING)('tax-name', constants_1.msg.missingRequiredValues),
        (0, validator_1.BODY_STRING)('tax-value', constants_1.msg.missingRequiredValues),
        (0, validator_1.BODY_STRING)('tax-type', constants_1.msg.missingRequiredValues),
    ];
}
