"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOut = void 0;
exports.login = login;
exports.checkBranchAndOutletAccess = checkBranchAndOutletAccess;
const constants_1 = require("../helpers/constants");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbConfig_1 = require("../config/dbConfig");
const logger_1 = __importDefault(require("../helpers/logger"));
const i18n_1 = require("../i18n");
const jwt_1 = require("../helpers/jwt");
const mongodb_1 = require("mongodb");
async function login(req, res) {
    try {
        const { username, password, branch, outlet } = req.body;
        const user = await authenticateUser(username, password);
        if (user) {
            const branchAndOutletAccess = await checkBranchAndOutletAccess(user._id, branch, outlet);
            if (!(branchAndOutletAccess === null || branchAndOutletAccess === void 0 ? void 0 : branchAndOutletAccess.success)) {
                return res.status(constants_1.requestCode.UNAUTHORIZED)
                    .send({ error: (0, i18n_1.geti18nResponse)(req, branchAndOutletAccess === null || branchAndOutletAccess === void 0 ? void 0 : branchAndOutletAccess.msgKey, branchAndOutletAccess === null || branchAndOutletAccess === void 0 ? void 0 : branchAndOutletAccess.msg) });
            }
            if (user.active) {
                const userDetails = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.users, 'aggregate', [
                    {
                        $match: {
                            userId: user._id,
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
                if (userDetails) {
                    const usersRole = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersRole, 'findOne', { _id: user.roleId });
                    userDetails[0].roleId = usersRole._id;
                    userDetails[0].roleName = usersRole.name;
                    const userAccessArray = usersRole.access;
                    const accessMainPages = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.mainPages, 'find', {
                        _id: { $in: userAccessArray },
                        active: true
                    }, {
                        projection: {
                            name: 1,
                            title: 1,
                            route: 1
                        }
                    });
                    const accessSubPages = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.subPages, 'find', {
                        _id: { $in: userAccessArray },
                        active: true
                    }, {
                        projection: {
                            name: 1,
                            title: 1,
                            route: 1
                        }
                    });
                    const uniquePagesMap = new Map();
                    [...accessMainPages, ...accessSubPages].forEach((page) => {
                        uniquePagesMap.set(page._id.toString(), page);
                    });
                    const accessPages = Array.from(uniquePagesMap.values());
                    userDetails[0].accessPages = accessPages;
                    if (accessPages) {
                        userDetails[0].branch = new mongodb_1.ObjectId(branch);
                        userDetails[0].outlet = new mongodb_1.ObjectId(outlet);
                        const token = (0, jwt_1.createToken)(userDetails[0]);
                        const refreshToken = (0, jwt_1.createRefreshToken)(userDetails[0]);
                        const jwtToken = {
                            _id: new mongodb_1.ObjectId,
                            userId: user._id,
                            token,
                            refreshToken,
                            active: true,
                            created: {
                                by: user._id,
                                on: new Date().toLocaleString(),
                                date: new Date()
                            }
                        };
                        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.jwtToken, 'insertOne', jwtToken);
                        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.lastLoginLogout, 'createOrUpdate', {
                            userId: user._id
                        }, {
                            $set: {
                                loginOn: new Date().toLocaleString(),
                                loginDate: new Date(),
                                logoutOn: null,
                                logoutDate: null,
                            },
                        });
                        return res.status(constants_1.requestCode.SUCCESS)
                            .send({ token: token, refreshToken, accessPages });
                    }
                    await updateLoginAttempts(username);
                    return res.status(constants_1.requestCode.UNAUTHORIZED)
                        .send({ error: (0, i18n_1.geti18nResponse)(req, 'noAnyAccess', constants_1.msg.noAnyAccess) });
                }
                await updateLoginAttempts(username);
                return res.status(constants_1.requestCode.UNAUTHORIZED)
                    .send({ error: (0, i18n_1.geti18nResponse)(req, 'inactiveUser', constants_1.msg.inactiveUser) });
            }
            await updateLoginAttempts(username);
            return res.status(constants_1.requestCode.UNAUTHORIZED)
                .send({ error: (0, i18n_1.geti18nResponse)(req, 'inactiveUser', constants_1.msg.inactiveUser) });
        }
        await updateLoginAttempts(username);
        return res.status(constants_1.requestCode.UNAUTHORIZED)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'invalidLogin', constants_1.msg.invalidLogin) });
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
}
;
async function authenticateUser(username, password) {
    try {
        const user = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersLogin, 'findOne', { username });
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }
    catch (error) {
        logger_1.default.error(error === null || error === void 0 ? void 0 : error.toString());
        return null;
    }
}
;
const logOut = async (req, res) => {
    var _a;
    const { userId } = (_a = req.body) === null || _a === void 0 ? void 0 : _a.user;
    const { token } = req.body;
    try {
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.lastLoginLogout, 'updateOne', { userId }, {
            $set: {
                logoutOn: new Date().toLocaleString(),
                logoutDate: new Date()
            }
        });
        await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.jwtToken, 'deleteMany', {
            token
        });
        return res.status(constants_1.requestCode.SUCCESS).send((0, i18n_1.geti18nResponse)(req, 'success', constants_1.msg.success));
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return res.status(constants_1.requestCode.SERVER_ERROR)
            .send({ error: (0, i18n_1.geti18nResponse)(req, 'unknownError', constants_1.msg.unknownError) });
    }
};
exports.logOut = logOut;
const updateLoginAttempts = async (username) => {
    await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersLogin, 'updateOne', {
        username
    }, {
        $set: {
            'loginAttempts.lastDate': new Date()
        },
        $inc: {
            'loginAttempts.count': 1
        }
    });
};
async function checkBranchAndOutletAccess(userId, branchId, outletId) {
    try {
        if (!branchId) {
            return { success: false, msg: constants_1.msg.branchMandatory, msgKey: 'branchMandatory' };
        }
        if (!outletId) {
            return { success: false, msg: constants_1.msg.outletMandatory, msgKey: 'outletMandatory' };
        }
        const branchAccess = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersAccess, 'findOne', {
            userId,
            branches: { $in: [new mongodb_1.ObjectId(branchId)] },
            active: true
        });
        if (!branchAccess) {
            return { success: false, msg: constants_1.msg.noBranchAccess, msgKey: 'noBranchAccess' };
        }
        const outletAccess = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersAccess, 'findOne', {
            userId,
            outlets: { $in: [new mongodb_1.ObjectId(outletId)] },
            active: true
        });
        if (!outletAccess) {
            return { success: false, msg: constants_1.msg.noOutletAccess, msgKey: 'noOutletAccess' };
        }
        return { success: true };
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return { success: false, msg: constants_1.msg.unknownError, msgKey: 'unknownError' };
    }
}
