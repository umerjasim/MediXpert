"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchesAndOutlets = getBranchesAndOutlets;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
async function getBranchesAndOutlets(req, res) {
    try {
        const branches = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.branches, 'find', { active: true }, { name: 1 });
        const outlets = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.outlets, 'find', { active: true }, { name: 1 });
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ branches, outlets });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
