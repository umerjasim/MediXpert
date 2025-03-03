"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberKeyWords = exports.collectionNames = exports.userAccess = exports.requestCode = exports.msg = exports.otpValidMinutes = exports.tokenExpiryTime = exports.cryptoAlgorithm = exports.DB_NAME = exports.DB_URL = exports.defaultPassword = exports.defaultPasswordLength = exports.defaultMail = exports.defaultUsername = exports.appUrl = exports.appName = exports.GROUP_TYPE = void 0;
const utility_1 = require("../utility/utility");
exports.GROUP_TYPE = '[groupType]';
exports.appName = 'MediXpert';
exports.appUrl = 'http://localhost:3500';
exports.defaultUsername = 'admin';
exports.defaultMail = 'umerjasim47@gmail.com';
exports.defaultPasswordLength = 8;
exports.defaultPassword = (0, utility_1.generateRandomPassword)(exports.defaultPasswordLength);
exports.DB_URL = process.env.DB_URL;
exports.DB_NAME = process.env.DB_NAME;
exports.cryptoAlgorithm = 'aes-256-cbc';
exports.tokenExpiryTime = 24 * 3600 * 1000; // 24 hours in milliseconds
exports.otpValidMinutes = 10;
exports.msg = {
    success: {
        message: 'Success',
    },
    loginCredRequired: {
        message: 'Please enter your sign-in credentials.',
        code: 100
    },
    inactiveUser: {
        code: 101,
        message: 'User not active.'
    },
    invalidLogin: {
        message: 'Invalid sign-in credentials.',
        code: 102
    },
    unknownError: {
        message: 'Something went wrong. Please try again later.',
        code: 103
    },
    noAnyAccess: {
        message: 'User does not have any access. Please contact your manager.',
        code: 104
    },
    forbidden: {
        code: 105,
        message: 'Permission denied.',
    },
    userNotExist: {
        code: 106,
        message: 'User does not exist.',
    },
    unauthorisedAccess: {
        code: 107,
        message: 'Unauthorised access.',
    },
    itemAlreadyExist: {
        code: 108,
        message: 'Item Name already exist. Please enter different name.',
    },
    branchMandatory: {
        code: 110,
        message: 'Please select your Branch.',
    },
    outletMandatory: {
        code: 111,
        message: 'Please select your Outlet.',
    },
    noBranchAccess: {
        code: 112,
        message: 'You do not have access to login in this Branch.',
    },
    noOutletAccess: {
        code: 113,
        message: 'You do not have access to login in this Outlet.',
    },
    supplierAlreadyExist: {
        code: 114,
        message: 'Supplier already exist. Please enter different name.',
    },
    missingRequiredValues: {
        code: 115,
        message: 'Missing required value(s)',
    },
    taxAlreadyExist: {
        code: 116,
        message: 'Tax already exist. Please enter different name.',
    },
    docNameAlreadyExist: {
        code: 117,
        message: 'Given already exist. Please enter different name.',
    },
};
exports.requestCode = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    SERVER_ERROR: 503,
    SUCCESS: 200,
    FORBIDDEN: 403,
    DUPLICATE_KEY: 11000,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    UNSUPPORTED_MEDIA_TYPE: 415,
    METHOD_NOT_ALLOWED: 405,
    NOT_FOUND: 404,
};
exports.userAccess = {
    user: 1,
    role: 2,
    general: 3,
    client: 4,
    plant: 5,
    equipment: 6,
    checklist: 7,
    task: 8,
    report: 9,
    configuration: 10,
    dashboard: 20,
    thicknessSummary: 26,
};
exports.collectionNames = {
    genders: 'genders',
    titles: 'titles',
    usersLogin: 'usersLogin',
    users: 'users',
    mainPages: 'mainPages',
    subPages: 'subPages',
    subModules: 'subModules',
    usersRole: 'usersRole',
    usersAccess: 'usersAccess',
    usersAddress: 'usersAddress',
    jwtToken: 'jwtToken',
    attachements: 'attachements',
    sendMailAuth: 'sendMailAuth',
    lastLoginLogout: 'lastLoginLogout',
    itemMaster: 'itemMaster',
    itemType: 'itemType',
    itemCategory: 'itemCategory',
    itemQtyUnit: 'itemQtyUnit',
    itemCode: 'itemCode',
    itemRisk: 'itemRisk',
    itemSuppliers: 'itemSuppliers',
    genericNames: 'genericNames',
    items: 'items',
    branches: 'branches',
    outlets: 'outlets',
    taxes: 'taxes',
    purchaseFormTypes: 'purchaseFormTypes',
    purchaseTypes: 'purchaseTypes',
    manufacturers: 'manufacturers',
    purchaseEntries: 'purchaseEntries',
    purchaseEntryAmounts: 'purchaseEntryAmounts',
    purchaseEntryItems: 'purchaseEntryItems',
    itemsStock: 'itemsStock',
    itemsStockTemp: 'itemsStockTemp',
    paymentTypes: 'paymentTypes',
    saleMaster: 'saleMaster',
    saleItems: 'saleItems',
    salePatientMaster: 'salePatientMaster',
    salePatientVisit: 'salePatientVisit',
    saleInvoice: 'saleInvoice',
    doctors: 'doctors',
    places: 'places',
    billMaster: 'billMaster',
    billDetails: 'billDetails',
    saleBill: 'saleBill',
    pageSizes: 'pageSizes',
    replacingHashtags: 'replacingHashtags',
    documentTypes: 'documentTypes',
    documentMaster: 'documentMaster'
};
exports.numberKeyWords = {
    grnNo: 'GRN',
    grnNoStart: '00000001',
    invoiceNo: 'IN',
    invoiceNoStart: '00000001',
    billNo: 'BL',
    billNoStart: '00000001',
};
