"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutlets = getOutlets;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
const mongodb_1 = require("mongodb");
async function getOutlets(req, res) {
    try {
        const { userId } = req.user;
        const userAccess = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersAccess, 'findOne', {
            userId: new mongodb_1.ObjectId(userId),
            active: true
        });
        if (!userAccess || !userAccess.outlets) {
            return res.status(constants_1.requestCode.UNAUTHORIZED)
                .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
        }
        const outletIds = userAccess.outlets;
        const accessibleOutlets = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.outlets, 'find', {
            _id: { $in: outletIds },
            active: true
        });
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ outlets: accessibleOutlets });
    }
    catch (error) {
        console.log(error);
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
