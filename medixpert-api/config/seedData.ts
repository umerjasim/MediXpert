
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { Branches, Gender, ItemCategory, ItemCode, ItemMaster, 
    ItemQtyUnit, ItemType, MainPages, Outlets, PageSizes, PaymentTypes, PurchaseFormTypes, 
    PurchaseTypes, SendMailAuth, Title, Users, UsersAccess, UsersLogin, 
    UsersRole } from './dbTypes';
import { genders } from './seed-data/genders';
import { titles } from './seed-data/titles';
import { appName, appUrl, collectionNames, defaultMail, defaultUsername } from '../helpers/constants';
import bcrypt from "bcrypt";
import { usersLogin } from './seed-data/usersLogin';
import { users } from './seed-data/users';
import logger from '../helpers/logger';
import { mainPages } from './seed-data/mainPages';
import { usersRole } from './seed-data/usersRole';
import { sendMailAuth } from './seed-data/sendMailAuth';
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import { itemMaster } from './seed-data/itemMaster';
import { itemType } from './seed-data/itemType';
import { itemCategory } from './seed-data/itemCategory';
import { itemQtyUnit } from './seed-data/itemQtyUnit';
import { itemCode } from './seed-data/itemCode';
import { itemRisk } from './seed-data/itemRisk';
import { branches } from './seed-data/branches';
import { outlets } from './seed-data/outlets';
import { usersAccess } from './seed-data/usersAccess';
import { purchaseFormTypes } from './seed-data/purchaseFormTypes';
import { purchaseTypes } from './seed-data/purchaseTypes';
import { paymentTypes } from './seed-data/paymentTypes';
import { pageSizes } from './seed-data/pageSizes';

dotenv.config();

const url = process.env.DB_URL as string;
const dbName = process.env.DB_NAME as string;

async function seedDatabase(): Promise<void> {
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);

        // Start :: main pages insert
        const mainPagesCollection = db.collection<MainPages>(collectionNames.mainPages);
        await mainPagesCollection.drop().catch(() => console.log("mainPages collection doesn't exist, creating new one"));

        const mainPagesResult = await mainPagesCollection.insertMany(mainPages);
        console.log('Inserted main pages into the collection');

        const insertedMainPagesIds: ObjectId[] = Object.values(mainPagesResult.insertedIds);
        // End :: main pages insert

        //Start :: admin role
        const usersRoleCollection = db.collection<UsersRole>(collectionNames.usersRole);
        await usersRoleCollection.drop().catch(() => console.log("usersRole collection doesn't exist, creating new one"));

        const updatedUsersRole = await Promise.all(usersRole.map(async (role) => {
            return {
                ...role,
                access: insertedMainPagesIds,
            };
        }));

        const usersRoleResult = await usersRoleCollection.insertMany(updatedUsersRole);
        console.log('Inserted users role into the collection');

        const insertedUsersRoleIds: { [key: number]: ObjectId } = usersRoleResult.insertedIds;

        const level0Index = usersRole.findIndex(role => role.level === 0);
        const level0ObjectId = level0Index !== -1 ? insertedUsersRoleIds[level0Index] : undefined;
        //End :: admin role

        //Start :: admin login
        const username = defaultUsername;
        const password = usersLogin[0].password;
        const HASH_SALT: number = parseInt(process.env.HASH_SALT || '10', 10);

        const updatedUsersLogin = await Promise.all(usersLogin.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, HASH_SALT);
            
            return {
                ...user,
                password: hashedPassword,
                roleId: level0ObjectId
            };
        }));
        
        const usersLoginCollection = db.collection<UsersLogin>(collectionNames.usersLogin);
        await usersLoginCollection.drop().catch(() => console.log("usersLogin collection doesn't exist, creating new one"));

        const usersLoginResult = await usersLoginCollection.insertOne(updatedUsersLogin[0]);
        console.log('Inserted default user:', username, 'with password:', password);

        const insertedUsersId = usersLoginResult.insertedId;
        //End :: admin role

        //Start :: admin user
        const updatedUsers = await Promise.all(users.map(async (user) => {
            return {
                ...user,
                userId: insertedUsersId,
            };
        }));

        const usersCollection = db.collection<Users>(collectionNames.users);
        await usersCollection.drop().catch(() => console.log("users collection doesn't exist, creating new one"));

        await usersCollection.insertOne(updatedUsers[0]);
        console.log('Inserted deafult user into the collection');
        //End :: admin user

        //Start :: send mail auth
        const sendMailAuthCollection = db.collection<SendMailAuth>(collectionNames.sendMailAuth);
        await sendMailAuthCollection.drop().catch(() => console.log("sendMailAuth collection doesn't exist, creating new one"));

        await sendMailAuthCollection.insertOne(sendMailAuth);
        console.log('Inserted deafult send mail authorization into the collection');
        //End :: send mail auth

        //Start :: send otp to admin email
        sendAdminMail(username, password);
        //End :: send otp to admin email

        //Start :: genders
        const gendersCollection = db.collection<Gender>(collectionNames.genders);
        await gendersCollection.drop().catch(() => console.log("genders collection doesn't exist, creating new one"));

        const gendersResult = await gendersCollection.insertMany(genders);
        console.log('Inserted genders into the collection');

        const insertedGendersIds = gendersResult.insertedIds;
        //End :: genders

        //Start :: titles
        const genderMap: { [key: string]: ObjectId } = {};
        for (const [key, id] of Object.entries(insertedGendersIds)) {
            const genderCode = genders[+key].code;
            genderMap[genderCode] = id as ObjectId;
        }

        const updatedTitles = titles.map(title => {
            let genderId: ObjectId | undefined;
        
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

        const titlesCollection = db.collection<Title>(collectionNames.titles);
        await titlesCollection.drop().catch(() => console.log("titles collection doesn't exist, creating new one"));

        await titlesCollection.insertMany(updatedTitles as Title[]);
        console.log('Inserted titles into the collection');
        //End :: titles

        //Start :: item master
        const itemMasterCollection = db.collection<ItemMaster>(collectionNames.itemMaster);
        await itemMasterCollection.drop().catch(() => console.log("itemMaster collection doesn't exist, creating new one"));

        await itemMasterCollection.insertMany(itemMaster);
        console.log('Inserted item master into the collection');
        //End :: item master

        //Start :: item type
        const itemTypeCollection = db.collection<ItemType>(collectionNames.itemType);
        await itemTypeCollection.drop().catch(() => console.log("itemType collection doesn't exist, creating new one"));

        await itemTypeCollection.insertMany(itemType);
        console.log('Inserted item type into the collection');
        //End :: item type

        //Start :: item category
        const itemCategoryCollection = db.collection<ItemCategory>(collectionNames.itemCategory);
        await itemCategoryCollection.drop().catch(() => console.log("itemCategory collection doesn't exist, creating new one"));

        await itemCategoryCollection.insertMany(itemCategory);
        console.log('Inserted item category into the collection');
        //End :: item category
        
        //Start :: item qty unit
        const itemQtyUnitCollection = db.collection<ItemQtyUnit>(collectionNames.itemQtyUnit);
        await itemQtyUnitCollection.drop().catch(() => console.log("itemQtyUnit collection doesn't exist, creating new one"));

        await itemQtyUnitCollection.insertMany(itemQtyUnit);
        console.log('Inserted item qty unit into the collection');
        //End :: item qty unit

        //Start :: item code
        const itemCodeCollection = db.collection<ItemCode>(collectionNames.itemCode);
        await itemCodeCollection.drop().catch(() => console.log("itemCode collection doesn't exist, creating new one"));

        await itemCodeCollection.insertMany(itemCode);
        console.log('Inserted item code into the collection');
        //End :: item code

        //Start :: item risk
        const itemRiskCollection = db.collection<ItemCode>(collectionNames.itemRisk);
        await itemRiskCollection.drop().catch(() => console.log("itemRisk collection doesn't exist, creating new one"));

        await itemRiskCollection.insertMany(itemRisk);
        console.log('Inserted item risk into the collection');
        //End :: item risk

        //Start :: branches
        const branchesCollection = db.collection<Branches>(collectionNames.branches);
        await branchesCollection.drop().catch(() => console.log("branches collection doesn't exist, creating new one"));

        const branchResult = await branchesCollection.insertMany(branches);
        console.log('Inserted branches into the collection');

        const insertedBranchIds: ObjectId[] = Object.values(branchResult.insertedIds);
        //End :: branches

        //Start :: outlets
        const updatedOutlets = outlets.map((outlet, index) => ({
            ...outlet,
            branchId: insertedBranchIds[index],
        }));
        const outletsCollection = db.collection<Outlets>(collectionNames.outlets);
        await outletsCollection.drop().catch(() => console.log("outlets collection doesn't exist, creating new one"));

        const outletResult = await outletsCollection.insertMany(updatedOutlets);
        console.log('Inserted outlets into the collection');

        const insertedOutletIds: ObjectId[] = Object.values(outletResult.insertedIds);
        //End :: outlets

        // Start :: users access insert
        const usersAccessCollection = db.collection<UsersAccess>(collectionNames.usersAccess);
        await usersAccessCollection.drop().catch(() => console.log("usersAccess collection doesn't exist, creating new one"));

        const updatedUsersAccess = await Promise.all(usersAccess.map(async (access) => {
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
        const updatedFormTypes = purchaseFormTypes.map((form, index) => ({
            ...form,
            branches: insertedBranchIds,
        }));
        const purchaseFormTypesCollection = db.collection<PurchaseFormTypes>(collectionNames.purchaseFormTypes);
        await purchaseFormTypesCollection.drop().catch(() => console.log("purchaseFormTypes collection doesn't exist, creating new one"));

        await purchaseFormTypesCollection.insertMany(updatedFormTypes);
        console.log('Inserted purchase form types into the collection');
        //End :: purchaseFormTypes

        //Start :: purchaseTypes
        const updatedPurchaseTypes = purchaseTypes.map((type, index) => ({
            ...type,
            branches: insertedBranchIds,
        }));
        const purchaseTypesCollection = db.collection<PurchaseTypes>(collectionNames.purchaseTypes);
        await purchaseTypesCollection.drop().catch(() => console.log("purchaseTypes collection doesn't exist, creating new one"));

        await purchaseTypesCollection.insertMany(updatedPurchaseTypes);
        console.log('Inserted purchase types into the collection');
        //End :: purchaseTypes

        //Start :: paymentTypes
        const updatedPaymentTypes = paymentTypes.map((type, index) => ({
            ...type,
            branches: insertedBranchIds,
        }));
        const paymentTypesCollection = db.collection<PaymentTypes>(collectionNames.paymentTypes);
        await paymentTypesCollection.drop().catch(() => console.log("paymentTypes collection doesn't exist, creating new one"));

        await paymentTypesCollection.insertMany(updatedPaymentTypes);
        console.log('Inserted payment types into the collection');
        //End :: paymentTypes

        //Start :: page sizes
        const pageSizesCollection = db.collection<PageSizes>(collectionNames.pageSizes);
        await pageSizesCollection.drop().catch(() => console.log("pageSizes collection doesn't exist, creating new one"));

        await pageSizesCollection.insertMany(pageSizes);
        console.log('Inserted page sizes into the collection');
        //End :: page sizes

    } catch (err) {
        logger.error(err?.stack)
        console.error('Error seeding database:', err);
    } finally {
        await client.close();
        console.log('Connection to MongoDB closed');
    }
};

const sendAdminMail = async (username: string, password: string) => {
    const templatesFilePath = path.join(__dirname, '../templates/mail/admin_mail.html');
    let data: Buffer | null = null;
    if (fs.existsSync(templatesFilePath)) {
        try {
            data = fs.readFileSync(templatesFilePath);
        } catch (error) {
            console.error('Error reading email template file:', error);
            logger.error(error?.stack);
            return false;
        }
    }
    if (data) {
        const mailBody = data.toString()
            .replace('[app-url]', appUrl)
            .replace('[user-name]', username)
            .replace('[password]', password)
            .replace('[app-name]', appName);

        const subject = `Welcome, to ${appName}`;
        const mailOptions = {
            from: `${appName} <${process.env.SEND_MAIL}>`,
            to: process.env.ADMIN_MAIL || defaultMail,
            subject,
            html: mailBody,
            attachDataUrls: true,
        };

        const mailTransport = nodemailer.createTransport({
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
        } catch (error) {
            console.error('Error while sending email:', error);
            logger.error(error?.stack);
            return false;
        }
    } else {
        console.error('No email template data found');
        return false;
    }
};

seedDatabase().catch(console.error);