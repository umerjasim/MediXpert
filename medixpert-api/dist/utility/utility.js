"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPassword = exports.capitalizeText = void 0;
exports.sendVerificationCode = sendVerificationCode;
exports.sendMail = sendMail;
exports.sendMailUsingAuthClient = sendMailUsingAuthClient;
exports.sendMailUsingConventionalWay = sendMailUsingConventionalWay;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.parseDate = parseDate;
exports.calculateDateOfBirth = calculateDateOfBirth;
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("../helpers/constants");
const i18n_1 = require("../i18n");
const logger_1 = __importDefault(require("../helpers/logger"));
const dbConfig_1 = require("../config/dbConfig");
const googleapis_1 = require("googleapis");
const { OAuth2 } = googleapis_1.google.auth;
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const generateRandomPassword = (length) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const allCharacters = uppercase + lowercase + numbers + specialChars;
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allCharacters.length);
        password += allCharacters[randomIndex];
    }
    return password;
};
exports.generateRandomPassword = generateRandomPassword;
function encrypt(text) {
    const algorithm = process.env.CRYPTO_ALGORITHM || constants_1.cryptoAlgorithm;
    const keyHex = process.env.CRYPTO_KEY;
    if (!keyHex)
        throw new Error("CRYPTO_KEY is not set in the environment variables.");
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32)
        throw new Error("Invalid CRYPTO_KEY length. Must be 32 bytes (64 hex characters).");
    const IV_LENGTH = 16;
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
}
function decrypt(encryptedData) {
    const algorithm = process.env.CRYPTO_ALGORITHM || constants_1.cryptoAlgorithm;
    const keyHex = process.env.CRYPTO_KEY;
    if (!keyHex)
        throw new Error("CRYPTO_KEY is not set in the environment variables.");
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32)
        throw new Error("Invalid CRYPTO_KEY length. Must be 32 bytes (64 hex characters).");
    const [ivHex, encryptedText] = encryptedData.split(':');
    if (!ivHex || !encryptedText)
        throw new Error("Invalid encrypted data format.");
    const ivBuffer = Buffer.from(ivHex, 'base64');
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
async function sendVerificationCode(field, otp, email, name, language) {
    try {
        const data = (0, i18n_1.geti18nResponseTemplate)(language, field, false);
        const mailBody = data
            .replace('[email]', email)
            .replace('[OTP]', `${otp}`)
            .replace('[project]', `${constants_1.appName}`)
            .replace('[otp_valid_minutes]', `${constants_1.otpValidMinutes}`)
            .replace('[site_url]', `${constants_1.appUrl}`)
            .replace('[name]', (0, exports.capitalizeText)(name))
            .split('[project]')
            .join(`${constants_1.appName}`);
        const sendOtpSubject = (0, i18n_1.geti18nText)(language, 'signupOtpSubject');
        return await sendMail(email, mailBody, sendOtpSubject);
    }
    catch (error) {
        logger_1.default.error(error.stack);
        return false;
    }
}
;
const capitalizeText = (str, lower = false) => (lower ? str.toLowerCase() : str).replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
exports.capitalizeText = capitalizeText;
async function sendMail(email, body, subject, ccmail, attachments = []) {
    const sendMailCred = await (0, dbConfig_1.dbHandler)(constants_1.collectionNames.sendMailAuth, 'findOne', { active: true }, { mail: 1, passKey: 1 });
    const sendMail = (sendMailCred === null || sendMailCred === void 0 ? void 0 : sendMailCred.mail) || process.env.SEND_MAIL;
    const sendMailPassKey = (sendMailCred === null || sendMailCred === void 0 ? void 0 : sendMailCred.passKey) ? decrypt(sendMailCred === null || sendMailCred === void 0 ? void 0 : sendMailCred.passKey) : process.env.SEND_MAIL_PASS_KEY;
    const mailOptions = {
        from: `${constants_1.appName} <${sendMail}>`,
        to: email,
        cc: ccmail,
        subject,
        html: body,
        attachDataUrls: true,
        attachments,
    };
    let status = false;
    if (process.env.MAIL_OAUTH2_CLIENT === 'gmail') {
        status = await sendMailUsingAuthClient(mailOptions, sendMail);
    }
    else if (process.env.MAIL_OAUTH2_CLIENT === 'ms365') {
        status = await sendMailByM65(mailOptions, sendMail);
    }
    else {
        status = await sendMailUsingConventionalWay(mailOptions, sendMail, sendMailPassKey);
    }
    return status;
}
;
async function sendMailUsingAuthClient(mailOptions, sendMail) {
    const oauth2Client = new OAuth2(process.env.MAIL_CLIENT_ID, process.env.MAIL_CLIENT_SECRET, process.env.MAIL_AUTHORIZATION_URI);
    oauth2Client.setCredentials({
        refresh_token: process.env.MAIL_REFRESH_TOKEN,
    });
    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                console.log(err);
                logger_1.default.error(err.stack);
                reject('Failed to create access token');
            }
            resolve(token);
        });
    });
    const config = {
        service: 'gmail',
        secure: true,
        pool: true,
        maxConnections: 20,
        maxMessages: 500,
        auth: {
            type: 'OAuth2',
            user: sendMail,
            accessToken,
            clientId: process.env.MAIL_CLIENT_ID,
            clientSecret: process.env.MAIL_CLIENT_SECRET,
            refreshToken: process.env.MAIL_REFRESH_TOKEN,
        },
        tls: {
            rejectUnauthorized: false,
        },
    };
    const mailTransport = nodemailer_1.default.createTransport(config);
    return mailTransport.sendMail(mailOptions).then(() => true).catch((error) => {
        console.log('There was an error while sending email :', error);
        logger_1.default.error(error.stack);
        return false;
    });
}
;
async function sendMailByM65(mailOptions, sendMail) {
    var _a;
    let oAuthToken = {};
    await (0, axios_1.default)({
        method: 'post',
        url: `https://login.microsoftonline.com/${process.env.MAIL_TENANT_ID}/oauth2/token`,
        data: new URLSearchParams({
            client_id: process.env.MAIL_CLIENT_ID,
            client_secret: process.env.MAIL_CLIENT_SECRET,
            resource: 'https://graph.microsoft.com',
            grant_type: 'client_credentials',
        }).toString(),
    }).then((r) => {
        oAuthToken = r;
    });
    const ccRecipients = (_a = mailOptions === null || mailOptions === void 0 ? void 0 : mailOptions.cc) === null || _a === void 0 ? void 0 : _a.map((email) => ({
        emailAddress: {
            address: email,
        },
    }));
    const msgPayload = {
        // Ref: https://learn.microsoft.com/en-us/graph/api/resources/message#properties
        message: {
            subject: mailOptions === null || mailOptions === void 0 ? void 0 : mailOptions.subject,
            body: {
                contentType: 'HTML',
                content: mailOptions === null || mailOptions === void 0 ? void 0 : mailOptions.html,
            },
            toRecipients: [{ emailAddress: { address: mailOptions === null || mailOptions === void 0 ? void 0 : mailOptions.to } }],
            ccRecipients,
        },
    };
    await (0, axios_1.default)({
        method: 'post',
        url: `https://graph.microsoft.com/v1.0/users/${sendMail}/sendMail`,
        headers: {
            Authorization: `Bearer ${oAuthToken === null || oAuthToken === void 0 ? void 0 : oAuthToken.data.access_token}`,
            'Content-Type': 'application/json',
        },
        data: msgPayload,
    });
    return true;
}
;
async function sendMailUsingConventionalWay(mailOptions, sendMail, sendMailPassKey) {
    const mailTransport = nodemailer_1.default.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        secure: parseInt(process.env.MAIL_PORT, 10) === 465,
        requireTLS: process.env.MAIL_REQUIRED_TLS === 'true',
        auth: {
            user: sendMail,
            pass: sendMailPassKey,
        },
    });
    return mailTransport.sendMail(mailOptions).then(() => true).catch((error) => {
        console.log('There was an error while sending email :', error);
        return false;
    });
}
;
function parseDate(date, format = 'DD-MM-YYYY', isStartOfDay = true) {
    if (!date)
        return undefined;
    const parsedDate = moment_1.default.utc(date, format, true);
    if (!parsedDate.isValid())
        return undefined;
    return isStartOfDay
        ? parsedDate.startOf('day').toDate()
        : parsedDate.endOf('day').toDate();
}
function calculateDateOfBirth(age) {
    if (!age.years && !age.months && !age.days) {
        return null;
    }
    const today = new Date();
    let yearsToSubtract = age.years || 0;
    let monthsToSubtract = age.months || 0;
    let daysToSubtract = age.days || 0;
    if (monthsToSubtract >= 12) {
        yearsToSubtract += Math.floor(monthsToSubtract / 12);
        monthsToSubtract %= 12;
    }
    const dob = new Date(today);
    if (daysToSubtract) {
        dob.setDate(today.getDate() - daysToSubtract);
    }
    if (monthsToSubtract) {
        dob.setMonth(today.getMonth() - monthsToSubtract);
    }
    if (yearsToSubtract) {
        dob.setFullYear(today.getFullYear() - yearsToSubtract);
    }
    return dob;
}
