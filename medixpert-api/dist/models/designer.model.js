"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageSizes = getPageSizes;
exports.getReplacingHashtags = getReplacingHashtags;
exports.getDocumentTypes = getDocumentTypes;
exports.getDocumentMasterWithName = getDocumentMasterWithName;
exports.upsertDocumentMaster = upsertDocumentMaster;
exports.getDocumentMaster = getDocumentMaster;
const dbConfig_1 = require("../config/dbConfig");
const constants_1 = require("../helpers/constants");
const logger_1 = __importDefault(require("../helpers/logger"));
async function getPageSizes() {
    try {
        const pageSizes = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.pageSizes, 'find', { active: true });
        return pageSizes;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getReplacingHashtags() {
    try {
        const hashtags = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.replacingHashtags, 'find', { active: true });
        return hashtags;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getDocumentTypes() {
    try {
        const docTypes = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.documentTypes, 'find', { active: true });
        return docTypes;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function getDocumentMasterWithName(name) {
    try {
        const docMaster = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.documentMaster, 'findOne', { active: true, name });
        return docMaster;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
async function upsertDocumentMaster(data, contentId) {
    try {
        const filter = contentId ? { _id: contentId } : {};
        const update = { $set: data };
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.documentMaster, 'createOrUpdate', filter, update);
        return true;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
async function getDocumentMaster() {
    try {
        const docMaster = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.documentMaster, 'aggregate', [
            {
                $match: {
                    active: true
                }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.documentTypes,
                    localField: "docType",
                    foreignField: "_id",
                    as: "documentTypes"
                }
            },
            {
                $unwind: { path: "$documentTypes" }
            },
            {
                $lookup: {
                    from: constants_1.collectionNames.pageSizes,
                    localField: "pageType",
                    foreignField: "_id",
                    as: "pageType"
                }
            },
            {
                $unwind: { path: "$pageType" }
            },
            {
                $project: {
                    contentHtml: 1,
                    name: 1,
                    orientation: 1,
                    'documentTypes._id': 1,
                    'documentTypes.value': 1,
                    'documentTypes.name': 1,
                    'pageType._id': 1,
                    'pageType.name': 1,
                    'pageType.height': 1,
                    'pageType.width': 1,
                }
            }
        ]);
        return docMaster;
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return null;
    }
}
;
