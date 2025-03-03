"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const constants_1 = require("../helpers/constants");
const dbConfig_1 = require("./dbConfig");
const logger_1 = __importDefault(require("../helpers/logger"));
const insertPage = async (collection, value) => {
    try {
        if (!value && !(value === null || value === void 0 ? void 0 : value.route)) {
            throw new Error('Cant insert pages: Insertion value error');
        }
        const existingPage = await (0, dbConfig_1.dbHandler)(collection, 'findOne', { route: value.route });
        if (!existingPage) {
            const pageInsert = await (0, dbConfig_1.dbHandler)(collection, 'insertOne', value);
            const pageId = pageInsert === null || pageInsert === void 0 ? void 0 : pageInsert.insertedId;
            await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.usersRole, 'updateMany', { level: 0 }, {
                $addToSet: {
                    access: new mongodb_1.ObjectId(pageId)
                }
            });
            return pageId;
        }
        return existingPage === null || existingPage === void 0 ? void 0 : existingPage._id;
    }
    catch (error) {
        console.error('Error initializing pages:', error);
        logger_1.default.error(error === null || error === void 0 ? void 0 : error.stack);
        return null;
    }
};
async function initializeDB() {
    try {
        let pageData = {};
        pageData = {
            name: 'Dashboard',
            title: 'Dashboard',
            route: '/dashboard',
            icon: 'DashboardFilled',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.mainPages, pageData);
        pageData = {
            name: 'General',
            title: 'General',
            route: '/general',
            icon: 'AimOutlined',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        const generalId = await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.mainPages, pageData);
        pageData = {
            mainPageId: generalId,
            name: 'Items',
            title: 'Items',
            route: '/items',
            icon: 'DropboxOutlined',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.subPages, pageData);
        pageData = {
            mainPageId: generalId,
            name: 'Suppliers',
            title: 'Suppliers',
            route: '/suppliers',
            icon: 'ClusterOutlined',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.subPages, pageData);
        pageData = {
            name: 'Masters',
            title: 'Masters',
            route: '/masters',
            icon: 'ControlOutlined',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        const masterId = await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.mainPages, pageData);
        pageData = {
            mainPageId: masterId,
            name: 'Taxes',
            title: 'Taxes',
            route: '/taxes',
            icon: 'BookOutlined',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.subPages, pageData);
        pageData = {
            name: 'Transactions',
            title: 'Transactions',
            route: '/transactions',
            icon: 'SwapOutlined',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        const transactionId = await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.mainPages, pageData);
        pageData = {
            mainPageId: transactionId,
            name: 'Purchase Entry',
            title: 'Purchase Entry',
            route: '/purchase-entry',
            icon: 'DiffOutlined',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.subPages, pageData);
        pageData = {
            mainPageId: transactionId,
            name: 'Approve Purchase Entry',
            title: 'Approve Purchase Entry',
            route: '/approve-purchase-entry',
            icon: 'FileDoneOutlined',
            active: true,
            created: {
                by: 'system',
                on: new Date().toLocaleString(),
                date: new Date
            }
        };
        await insertPage(constants_1.collectionNames === null || constants_1.collectionNames === void 0 ? void 0 : constants_1.collectionNames.subPages, pageData);
    }
    catch (error) {
        console.error('Error initializing pages:', error);
        logger_1.default.error(error === null || error === void 0 ? void 0 : error.stack);
        process.exit(1);
    }
}
;
exports.default = initializeDB;
