"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessPages = getAccessPages;
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const dbConfig_1 = require("../config/dbConfig");
const mongodb_1 = require("mongodb");
const logger_1 = __importDefault(require("../helpers/logger"));
async function getAccessPages(req, res) {
    const { userId, roleId } = req.body;
    try {
        if (userId && roleId) {
            const usersRole = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersRole, 'findOne', { _id: new mongodb_1.ObjectId(roleId) });
            if (!usersRole) {
                return res.status(constants_1.requestCode.UNAUTHORIZED)
                    .send({ error: (0, i18n_1.geti18nResponse)(req, 'noAnyAccess', constants_1.msg.noAnyAccess) });
            }
            const userAccessArray = usersRole === null || usersRole === void 0 ? void 0 : usersRole.access;
            const accessPages = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.mainPages, 'aggregate', [
                {
                    $match: {
                        _id: { $in: userAccessArray },
                        active: true
                    }
                },
                {
                    $lookup: {
                        from: constants_1.collectionNames.subPages,
                        localField: "_id",
                        foreignField: "mainPageId",
                        as: "subPages"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        title: 1,
                        route: 1,
                        icon: 1,
                        subPages: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$subPages",
                                        as: "subPage",
                                        cond: {
                                            $and: [
                                                { $in: ["$$subPage._id", userAccessArray] },
                                                { $eq: ["$$subPage.active", true] }
                                            ]
                                        }
                                    }
                                },
                                as: "subPage",
                                in: {
                                    _id: "$$subPage._id",
                                    name: "$$subPage.name",
                                    title: "$$subPage.title",
                                    route: "$$subPage.route",
                                    icon: "$$subPage.icon"
                                }
                            }
                        }
                    }
                }
            ]);
            return res.status(constants_1.requestCode.SUCCESS)
                .send({ accessPages });
        }
        return res.status(constants_1.requestCode.UNAUTHORIZED)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'noAnyAccess', constants_1.msg.noAnyAccess) });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
