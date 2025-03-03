"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const constants_1 = require("../helpers/constants");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(constants_1.requestCode.BAD_REQUEST).send({ error: errors.array()[0].msg });
};
exports.default = validate;
