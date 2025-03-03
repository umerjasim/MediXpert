"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const genders_1 = require("./seed-data/genders");
const titles_1 = require("./seed-data/titles");
const constants_1 = require("../helpers/constants");
const bcrypt_1 = __importDefault(require("bcrypt"));
const usersLogin_1 = require("./seed-data/usersLogin");
const users_1 = require("./seed-data/users");
const logger_1 = __importDefault(require("../helpers/logger"));
const mainPages_1 = require("./seed-data/mainPages");
const usersRole_1 = require("./seed-data/usersRole");
const sendMailAuth_1 = require("./seed-data/sendMailAuth");
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const itemMaster_1 = require("./seed-data/itemMaster");
const itemType_1 = require("./seed-data/itemType");
const itemCategory_1 = require("./seed-data/itemCategory");
const itemQtyUnit_1 = require("./seed-data/itemQtyUnit");
const itemCode_1 = require("./seed-data/itemCode");
const itemRisk_1 = require("./seed-data/itemRisk");
const branches_1 = require("./seed-data/branches");
const outlets_1 = require("./seed-data/outlets");
const usersAccess_1 = require("./seed-data/usersAccess");
const purchaseFormTypes_1 = require("./seed-data/purchaseFormTypes");
const purchaseTypes_1 = require("./seed-data/purchaseTypes");
const paymentTypes_1 = require("./seed-data/paymentTypes");
const pageSizes_1 = require("./seed-data/pageSizes");
dotenv_1.default.config();
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;
console.log(url);
console.log(dbName);
async function seedDatabase() {
    const client = new mongodb_1.MongoClient(url);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        // Start :: main pages insert
        const mainPagesCollection = db.collection(constants_1.collectionNames.mainPages);
        await mainPagesCollection.drop().catch(() => console.log("mainPages collection doesn't exist, creating new one"));
        const mainPagesResult = await mainPagesCollection.insertMany(mainPages_1.mainPages);
        console.log('Inserted main pages into the collection');
        const insertedMainPagesIds = Object.values(mainPagesResult.insertedIds);
        // End :: main pages insert
        //Start :: admin role
        const usersRoleCollection = db.collection(constants_1.collectionNames.usersRole);
        await usersRoleCollection.drop().catch(() => console.log("usersRole collection doesn't exist, creating new one"));
        const updatedUsersRole = await Promise.all(usersRole_1.usersRole.map(async (role) => {
            return {
                ...role,
                access: insertedMainPagesIds,
            };
        }));
        const usersRoleResult = await usersRoleCollection.insertMany(updatedUsersRole);
        console.log('Inserted users role into the collection');
        const insertedUsersRoleIds = usersRoleResult.insertedIds;
        const level0Index = usersRole_1.usersRole.findIndex(role => role.level === 0);
        const level0ObjectId = level0Index !== -1 ? insertedUsersRoleIds[level0Index] : undefined;
        //End :: admin role
        //Start :: admin login
        const username = constants_1.defaultUsername;
        const password = usersLogin_1.usersLogin[0].password;
        const HASH_SALT = parseInt(process.env.HASH_SALT || '10', 10);
        const updatedUsersLogin = await Promise.all(usersLogin_1.usersLogin.map(async (user) => {
            const hashedPassword = await bcrypt_1.default.hash(user.password, HASH_SALT);
            return {
                ...user,
                password: hashedPassword,
                roleId: level0ObjectId
            };
        }));
        const usersLoginCollection = db.collection(constants_1.collectionNames.usersLogin);
        await usersLoginCollection.drop().catch(() => console.log("usersLogin collection doesn't exist, creating new one"));
        const usersLoginResult = await usersLoginCollection.insertOne(updatedUsersLogin[0]);
        console.log('Inserted default user:', username, 'with password:', password);
        const insertedUsersId = usersLoginResult.insertedId;
        //End :: admin role
        //Start :: admin user
        const updatedUsers = await Promise.all(users_1.users.map(async (user) => {
            return {
                ...user,
                userId: insertedUsersId,
            };
        }));
        const usersCollection = db.collection(constants_1.collectionNames.users);
        await usersCollection.drop().catch(() => console.log("users collection doesn't exist, creating new one"));
        await usersCollection.insertOne(updatedUsers[0]);
        console.log('Inserted deafult user into the collection');
        //End :: admin user
        //Start :: send mail auth
        const sendMailAuthCollection = db.collection(constants_1.collectionNames.sendMailAuth);
        await sendMailAuthCollection.drop().catch(() => console.log("sendMailAuth collection doesn't exist, creating new one"));
        await sendMailAuthCollection.insertOne(sendMailAuth_1.sendMailAuth);
        console.log('Inserted deafult send mail authorization into the collection');
        //End :: send mail auth
        //Start :: send otp to admin email
        sendAdminMail(username, password);
        //End :: send otp to admin email
        //Start :: genders
        const gendersCollection = db.collection(constants_1.collectionNames.genders);
        await gendersCollection.drop().catch(() => console.log("genders collection doesn't exist, creating new one"));
        const gendersResult = await gendersCollection.insertMany(genders_1.genders);
        console.log('Inserted genders into the collection');
        const insertedGendersIds = gendersResult.insertedIds;
        //End :: genders
        //Start :: titles
        const genderMap = {};
        for (const [key, id] of Object.entries(insertedGendersIds)) {
            const genderCode = genders_1.genders[+key].code;
            genderMap[genderCode] = id;
        }
        const updatedTitles = titles_1.titles.map(title => {
            let genderId;
            switch (title.name) {
                case 'Mr':
                    genderId = genderMap['M'];
                    break;
                case 'Mrs':
                    genderId = genderMap['F'];
                    break;
                case 'Miss':
                    genderId = genderMap['F'];
                    break;
                default:
                    genderId = undefined;
            }
            return {
                ...title,
                genderId
            };
        });
        const titlesCollection = db.collection(constants_1.collectionNames.titles);
        await titlesCollection.drop().catch(() => console.log("titles collection doesn't exist, creating new one"));
        await titlesCollection.insertMany(updatedTitles);
        console.log('Inserted titles into the collection');
        //End :: titles
        //Start :: item master
        const itemMasterCollection = db.collection(constants_1.collectionNames.itemMaster);
        await itemMasterCollection.drop().catch(() => console.log("itemMaster collection doesn't exist, creating new one"));
        await itemMasterCollection.insertMany(itemMaster_1.itemMaster);
        console.log('Inserted item master into the collection');
        //End :: item master
        //Start :: item type
        const itemTypeCollection = db.collection(constants_1.collectionNames.itemType);
        await itemTypeCollection.drop().catch(() => console.log("itemType collection doesn't exist, creating new one"));
        await itemTypeCollection.insertMany(itemType_1.itemType);
        console.log('Inserted item type into the collection');
        //End :: item type
        //Start :: item category
        const itemCategoryCollection = db.collection(constants_1.collectionNames.itemCategory);
        await itemCategoryCollection.drop().catch(() => console.log("itemCategory collection doesn't exist, creating new one"));
        await itemCategoryCollection.insertMany(itemCategory_1.itemCategory);
        console.log('Inserted item category into the collection');
        //End :: item category
        //Start :: item qty unit
        const itemQtyUnitCollection = db.collection(constants_1.collectionNames.itemQtyUnit);
        await itemQtyUnitCollection.drop().catch(() => console.log("itemQtyUnit collection doesn't exist, creating new one"));
        await itemQtyUnitCollection.insertMany(itemQtyUnit_1.itemQtyUnit);
        console.log('Inserted item qty unit into the collection');
        //End :: item qty unit
        //Start :: item code
        const itemCodeCollection = db.collection(constants_1.collectionNames.itemCode);
        await itemCodeCollection.drop().catch(() => console.log("itemCode collection doesn't exist, creating new one"));
        await itemCodeCollection.insertMany(itemCode_1.itemCode);
        console.log('Inserted item code into the collection');
        //End :: item code
        //Start :: item risk
        const itemRiskCollection = db.collection(constants_1.collectionNames.itemRisk);
        await itemRiskCollection.drop().catch(() => console.log("itemRisk collection doesn't exist, creating new one"));
        await itemRiskCollection.insertMany(itemRisk_1.itemRisk);
        console.log('Inserted item risk into the collection');
        //End :: item risk
        //Start :: branches
        const branchesCollection = db.collection(constants_1.collectionNames.branches);
        await branchesCollection.drop().catch(() => console.log("branches collection doesn't exist, creating new one"));
        const branchResult = await branchesCollection.insertMany(branches_1.branches);
        console.log('Inserted branches into the collection');
        const insertedBranchIds = Object.values(branchResult.insertedIds);
        //End :: branches
        //Start :: outlets
        const updatedOutlets = outlets_1.outlets.map((outlet, index) => ({
            ...outlet,
            branchId: insertedBranchIds[index],
        }));
        const outletsCollection = db.collection(constants_1.collectionNames.outlets);
        await outletsCollection.drop().catch(() => console.log("outlets collection doesn't exist, creating new one"));
        const outletResult = await outletsCollection.insertMany(updatedOutlets);
        console.log('Inserted outlets into the collection');
        const insertedOutletIds = Object.values(outletResult.insertedIds);
        //End :: outlets
        // Start :: users access insert
        const usersAccessCollection = db.collection(constants_1.collectionNames.usersAccess);
        await usersAccessCollection.drop().catch(() => console.log("usersAccess collection doesn't exist, creating new one"));
        const updatedUsersAccess = await Promise.all(usersAccess_1.usersAccess.map(async (access) => {
            return {
                ...access,
                userId: insertedUsersId,
                branches: insertedBranchIds,
                outlets: insertedOutletIds,
            };
        }));
        await usersAccessCollection.insertMany(updatedUsersAccess);
        console.log('Inserted users access into the collection');
        // End :: users access insert
        //Start :: purchaseFormTypes
        const updatedFormTypes = purchaseFormTypes_1.purchaseFormTypes.map((form, index) => ({
            ...form,
            branches: insertedBranchIds,
        }));
        const purchaseFormTypesCollection = db.collection(constants_1.collectionNames.purchaseFormTypes);
        await purchaseFormTypesCollection.drop().catch(() => console.log("purchaseFormTypes collection doesn't exist, creating new one"));
        await purchaseFormTypesCollection.insertMany(updatedFormTypes);
        console.log('Inserted purchase form types into the collection');
        //End :: purchaseFormTypes
        //Start :: purchaseTypes
        const updatedPurchaseTypes = purchaseTypes_1.purchaseTypes.map((type, index) => ({
            ...type,
            branches: insertedBranchIds,
        }));
        const purchaseTypesCollection = db.collection(constants_1.collectionNames.purchaseTypes);
        await purchaseTypesCollection.drop().catch(() => console.log("purchaseTypes collection doesn't exist, creating new one"));
        await purchaseTypesCollection.insertMany(updatedPurchaseTypes);
        console.log('Inserted purchase types into the collection');
        //End :: purchaseTypes
        //Start :: paymentTypes
        const updatedPaymentTypes = paymentTypes_1.paymentTypes.map((type, index) => ({
            ...type,
            branches: insertedBranchIds,
        }));
        const paymentTypesCollection = db.collection(constants_1.collectionNames.paymentTypes);
        await paymentTypesCollection.drop().catch(() => console.log("paymentTypes collection doesn't exist, creating new one"));
        await paymentTypesCollection.insertMany(updatedPaymentTypes);
        console.log('Inserted payment types into the collection');
        //End :: paymentTypes
        //Start :: page sizes
        const pageSizesCollection = db.collection(constants_1.collectionNames.pageSizes);
        await pageSizesCollection.drop().catch(() => console.log("pageSizes collection doesn't exist, creating new one"));
        await pageSizesCollection.insertMany(pageSizes_1.pageSizes);
        console.log('Inserted page sizes into the collection');
        //End :: page sizes
    }
    catch (err) {
        logger_1.default.error(err === null || err === void 0 ? void 0 : err.stack);
        console.error('Error seeding database:', err);
    }
    finally {
        await client.close();
        console.log('Connection to MongoDB closed');
    }
}
;
const sendAdminMail = async (username, password) => {
    const templatesFilePath = path_1.default.join(__dirname, '../templates/mail/admin_mail.html');
    let data = null;
    if (fs_1.default.existsSync(templatesFilePath)) {
        try {
            data = fs_1.default.readFileSync(templatesFilePath);
        }
        catch (error) {
            console.error('Error reading email template file:', error);
            logger_1.default.error(error === null || error === void 0 ? void 0 : error.stack);
            return false;
        }
    }
    console.log(data);
    console.log(templatesFilePath);
    if (data) {
        const mailBody = data.toString()
            .replace('[app-url]', constants_1.appUrl)
            .replace('[user-name]', username)
            .replace('[password]', password)
            .replace('[app-name]', constants_1.appName);
        const subject = `Welcome, to ${constants_1.appName}`;
        const mailOptions = {
            from: `${constants_1.appName} <${process.env.SEND_MAIL}>`,
            to: process.env.ADMIN_MAIL || constants_1.defaultMail,
            subject,
            html: mailBody,
            attachDataUrls: true,
        };
        const mailTransport = nodemailer_1.default.createTransport({
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_PORT, 10),
            secure: parseInt(process.env.MAIL_PORT, 10) === 465,
            requireTLS: process.env.MAIL_REQUIRED_TLS === 'true',
            auth: {
                user: process.env.SEND_MAIL,
                pass: process.env.SEND_MAIL_PASS_KEY,
            },
        });
        try {
            await mailTransport.sendMail(mailOptions);
            console.log('Admin login credentials sent.');
            return true;
        }
        catch (error) {
            console.error('Error while sending email:', error);
            logger_1.default.error(error === null || error === void 0 ? void 0 : error.stack);
            return false;
        }
    }
    else {
        console.error('No email template data found');
        return false;
    }
};
seedDatabase().catch(console.error);
