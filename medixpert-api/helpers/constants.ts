import path from 'path';
import { generateRandomPassword } from '../utility/utility';

export const GROUP_TYPE = '[groupType]';

export const appName = 'MediXpert';
export const appUrl = 'http://localhost:3500';

export const defaultUsername = 'admin';
export const defaultMail = 'umerjasim47@gmail.com';
export const defaultPasswordLength = 8;
export const defaultPassword = generateRandomPassword(defaultPasswordLength);
export const DB_URL = process.env.DB_URL;
export const DB_NAME = process.env.DB_NAME;

export const cryptoAlgorithm = 'aes-256-cbc';

export const tokenExpiryTime = 24 * 3600 * 1000; // 24 hours in milliseconds
export const otpValidMinutes = 10;

export const msg = {
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
};

export const requestCode = {
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

export const userAccess = {
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

export const collectionNames = {
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
    itemsStockTemp: 'itemsStockTemp'
};