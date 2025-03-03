"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = getData;
exports.saveContent = saveContent;
const logger_1 = __importDefault(require("../helpers/logger"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const designer_model_1 = require("../models/designer.model");
const mongodb_1 = require("mongodb");
async function getData(req, res) {
    try {
        const { branch, outlet } = req.user;
        const pageSizes = await (0, designer_model_1.getPageSizes)();
        const hashtags = await (0, designer_model_1.getReplacingHashtags)();
        const documentTypes = await (0, designer_model_1.getDocumentTypes)();
        const documentMaster = await (0, designer_model_1.getDocumentMaster)();
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ pageSizes, hashtags, documentTypes, documentMaster });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
async function saveContent(req, res) {
    try {
        const { branch, outlet, userId } = req.user;
        const { contentId, content, type, name, pageType, orientation } = req.body;
        const docMaster = await (0, designer_model_1.getDocumentMasterWithName)(name);
        if (docMaster) {
            return res.status(constants_1.requestCode.BAD_REQUEST)
                .send({ error: (0, i18n_1.geti18nResponse)(req, 'docNameAlreadyExist', constants_1.msg.docNameAlreadyExist) });
        }
        const documentMasterData = {
            _id: new mongodb_1.ObjectId(),
            docType: new mongodb_1.ObjectId(type),
            name,
            contentHtml: content,
            pageType: new mongodb_1.ObjectId(pageType),
            orientation,
            active: true,
            created: {
                by: new mongodb_1.ObjectId(userId),
                on: new Date().toLocaleString(),
                date: new Date()
            },
            modified: {
                by: null,
                on: null,
                date: null
            }
        };
        await (0, designer_model_1.upsertDocumentMaster)(documentMasterData, contentId);
        return res.status(constants_1.requestCode.SUCCESS)
            .send({ message: (0, i18n_1.geti18nResponse)(req, 'success', constants_1.msg.success) });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
