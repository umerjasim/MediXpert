"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = createToken;
exports.createRefreshToken = createRefreshToken;
exports.authenticate = authenticate;
exports.getTokenData = getTokenData;
exports.getUserData = getUserData;
exports.checkValidUser = checkValidUser;
exports.validateUserAccess = validateUserAccess;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("./constants");
const i18n_1 = require("../i18n");
const mongodb_1 = require("mongodb");
const dbConfig_1 = require("../config/dbConfig");
const user_service_1 = require("../services/user.service");
;
function createToken(user) {
    // const access = [...new Set(user.access.flat(1))];
    return jsonwebtoken_1.default.sign({
        userId: user.userId,
        title: user.title,
        name: user.name,
        accessPages: user.accessPages,
        dob: user.dob,
        picture: user.picture,
        roleId: user.roleId,
        roleName: user.roleName,
        branch: user.branch,
        outlet: user.outlet,
        expiryTime: Date.now() + constants_1.tokenExpiryTime,
    }, process.env.JWT_SECRET);
}
;
function createRefreshToken(user) {
    return jsonwebtoken_1.default.sign({
        userId: user.userId,
        expiryTime: Date.now() + constants_1.tokenExpiryTime,
    }, process.env.JWT_REFRESH_SECRET);
}
;
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (errorResponse, user) => {
            if (errorResponse) {
                return res.status(constants_1.requestCode.FORBIDDEN).send({ error: (0, i18n_1.geti18nResponse)(req, 'forbidden', constants_1.msg.forbidden) });
            }
            const tokenData = await getTokenData(token, user);
            if ((tokenData === null || tokenData === void 0 ? void 0 : tokenData.length) === 0) {
                return res.status(constants_1.requestCode.FORBIDDEN).send({ error: (0, i18n_1.geti18nResponse)(req, 'forbidden', constants_1.msg.forbidden) });
            }
            return performNext(req, res, next, user, token);
        });
    }
    return res.status(constants_1.requestCode.FORBIDDEN).send({ error: (0, i18n_1.geti18nResponse)(req, 'forbidden', constants_1.msg.forbidden) });
}
;
async function getTokenData(token, user) {
    const tokens = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.jwtToken, 'find', { token }, { userId: 1, token: 1, refreshToken: 1 });
    return tokens;
}
;
async function performNext(req, res, next, user, token) {
    const userDetails = await getUserData(user);
    if (userDetails) {
        const isValidUser = checkValidUser(user);
        if (isValidUser) {
            const branchAndOutletAccess = await (0, user_service_1.checkBranchAndOutletAccess)(new mongodb_1.ObjectId(user.userId), user.branch, user.outlet);
            if (branchAndOutletAccess.success) {
                const tokenData = await getTokenData(token, user);
                if (tokenData) {
                    req.user = userDetails;
                    return next();
                }
                return res.status(constants_1.requestCode.FORBIDDEN)
                    .send({ error: (0, i18n_1.geti18nResponse)(req, 'forbidden', constants_1.msg.forbidden) });
            }
            return res.status(constants_1.requestCode.FORBIDDEN)
                .send({ error: (0, i18n_1.geti18nResponse)(req, 'forbidden', constants_1.msg.forbidden) });
        }
        return res.status(constants_1.requestCode.FORBIDDEN)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'forbidden', constants_1.msg.forbidden) });
    }
    return res.status(constants_1.requestCode.FORBIDDEN)
        .send({ error: (0, i18n_1.geti18nResponse)(req, 'forbidden', constants_1.msg.forbidden) });
}
;
async function getUserData(user) {
    const userDetailsArray = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.users, 'aggregate', [
        {
            $match: {
                userId: new mongodb_1.ObjectId(user.userId),
                active: true
            }
        },
        {
            $lookup: {
                from: constants_1.collectionNames.titles,
                localField: 'titleId',
                foreignField: '_id',
                as: 'titleDetails'
            }
        },
        {
            $unwind: {
                path: '$titleDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                userId: 1,
                name: 1,
                dob: 1,
                'picture': {
                    $cond: {
                        if: { $eq: ['$picture.filePath', null] },
                        then: null,
                        else: '$picture.filePath'
                    }
                },
                title: {
                    $cond: {
                        if: { $ifNull: ['$titleDetails._id', null] },
                        then: '$titleDetails.name',
                        else: null
                    }
                }
            }
        }
    ]);
    if (userDetailsArray.length === 1) {
        const usersRole = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersRole, 'findOne', {
            _id: new mongodb_1.ObjectId(user.roleId)
        });
        if (usersRole) {
            userDetailsArray[0].roleId = usersRole._id;
            userDetailsArray[0].roleName = usersRole.name;
            const userAccessArray = usersRole.access;
            const accessPages = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.mainPages, 'find', {
                _id: { $in: userAccessArray },
                active: true
            }, {
                projection: {
                    name: 1,
                    title: 1,
                    route: 1
                }
            });
            userDetailsArray[0].accessPages = accessPages;
            if ((userDetailsArray === null || userDetailsArray === void 0 ? void 0 : userDetailsArray.length) === 1) {
                userDetailsArray[0].branch = user.branch;
                userDetailsArray[0].outlet = user.outlet;
                const userDetails = userDetailsArray[0];
                return userDetails;
            }
            return null;
        }
        return null;
    }
    return null;
}
;
async function checkValidUser(user) {
    const usersLogin = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersLogin, 'findOne', { _id: user.userId, active: true });
    return !!usersLogin;
}
;
function validateUserAccess(routes) {
    return async (req, res, next) => {
        const { userId, roleId, branch, outlet } = req.user;
        if (userId && roleId) {
            const user = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersLogin, 'findOne', { _id: new mongodb_1.ObjectId(userId), active: true }, { _id: 1 });
            if (user) {
                const roleAccess = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersRole, 'findOne', { _id: new mongodb_1.ObjectId(roleId), active: true }, {
                    access: 1
                });
                const mainPages = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.mainPages, 'find', {
                    _id: { $in: roleAccess.access },
                    active: true,
                }, {
                    projection: {
                        name: 1,
                        title: 1,
                        route: 1
                    }
                });
                const subPages = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.subPages, 'find', {
                    _id: { $in: roleAccess.access },
                    active: true
                }, {
                    projection: {
                        name: 1,
                        title: 1,
                        route: 1
                    }
                });
                const pagesMap = new Map();
                [...mainPages, ...subPages].forEach((page) => {
                    pagesMap.set(page._id.toString(), page);
                });
                const pages = Array.from(pagesMap.values());
                const accessCheck = routes.every(route => pages.some(page => page.route === route));
                if (accessCheck) {
                    const branchOutletAccess = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersAccess, 'findOne', {
                        userId,
                        branches: { $in: [new mongodb_1.ObjectId(branch)] },
                        outlets: { $in: [new mongodb_1.ObjectId(outlet)] },
                        active: true
                    });
                    if (branchOutletAccess) {
                        return next();
                    }
                    return res.status(constants_1.requestCode.UNAUTHORIZED)
                        .send({ error: (0, i18n_1.geti18nResponse)(req, 'unauthorisedAccess', constants_1.msg.unauthorisedAccess) });
                }
                return res.status(constants_1.requestCode.UNAUTHORIZED)
                    .send({ error: (0, i18n_1.geti18nResponse)(req, 'unauthorisedAccess', constants_1.msg.unauthorisedAccess) });
            }
            return res.status(constants_1.requestCode.UNAUTHORIZED)
                .send({ error: (0, i18n_1.geti18nResponse)(req, 'unauthorisedAccess', constants_1.msg.unauthorisedAccess) });
        }
        return res.status(constants_1.requestCode.UNAUTHORIZED)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unauthorisedAccess', constants_1.msg.unauthorisedAccess) });
    };
}
