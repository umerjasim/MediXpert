import crypto from 'crypto';
import { appName, appUrl, collectionNames, cryptoAlgorithm, otpValidMinutes } from '../helpers/constants';
import { geti18nResponseTemplate, geti18nText } from '../i18n';
import logger from '../helpers/logger';
import { dbHandler } from '../config/dbConfig';
import { SendMailAuth } from '../config/dbTypes';
import { google } from 'googleapis';
const { OAuth2 } = google.auth;
import nodemailer from 'nodemailer';
import axios from 'axios';
import moment from 'moment';

const generateRandomPassword = (length: number): string => {
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

function encrypt(text: string): string {
    const algorithm = process.env.CRYPTO_ALGORITHM || cryptoAlgorithm;
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

function decrypt(encryptedData: string): string {
    const algorithm = process.env.CRYPTO_ALGORITHM || cryptoAlgorithm;
    const key = crypto.randomBytes(32);
    const [ivHex, encryptedText] = encryptedData.split(':');
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};

export async function sendVerificationCode(field: string, otp: string, email: string, name: string, language: string) {
    try {
      const data = geti18nResponseTemplate(language, field, false);
  
      const mailBody = data
                    .replace('[email]', email)
                    .replace('[OTP]', `${otp}`)
                    .replace('[project]', `${appName}`)
                    .replace('[otp_valid_minutes]', `${otpValidMinutes}`)
                    .replace('[site_url]', `${appUrl}`)
                    .replace('[name]', capitalizeText(name))
                    .split('[project]')
                    .join(`${appName}`);
      const sendOtpSubject = geti18nText(language, 'signupOtpSubject');
      return await sendMail(email, mailBody, sendOtpSubject);
    } catch (error) {
      logger.error(error.stack);
      return false;
    }
};

export const capitalizeText = (str:string, lower = false) => (lower ? str.toLowerCase() : str).replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

export async function sendMail(
    email: string,
    body: string,
    subject: string,
    ccmail?: string,
    attachments: { filename: string, path?: string, content?: string, cid?: string }[] = [],
  ): Promise<boolean> {
    const sendMailCred: SendMailAuth = await dbHandler(
        collectionNames.sendMailAuth,
        'findOne',
        { active: true },
        { mail: 1, passKey: 1 }
    );
    const sendMail = sendMailCred?.mail || process.env.SEND_MAIL;
    const sendMailPassKey = sendMailCred?.passKey ? decrypt(sendMailCred?.passKey) : process.env.SEND_MAIL_PASS_KEY;

    const mailOptions = {
      from: `${appName} <${sendMail}>`,
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
    } else if (process.env.MAIL_OAUTH2_CLIENT === 'ms365') {
      status = await sendMailByM65(mailOptions, sendMail);
    } else {
      status = await sendMailUsingConventionalWay(mailOptions, sendMail, sendMailPassKey);
    }
    return status;
};

export async function sendMailUsingAuthClient(
    mailOptions: any,
    sendMail: string
  ): Promise<boolean> {
    const oauth2Client = new OAuth2(
      process.env.MAIL_CLIENT_ID,
      process.env.MAIL_CLIENT_SECRET,
      process.env.MAIL_AUTHORIZATION_URI,
    );
  
    oauth2Client.setCredentials({
      refresh_token: process.env.MAIL_REFRESH_TOKEN,
    });
  
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err: Error, token: unknown) => {
        if (err) {
          console.log(err);
          logger.error(err.stack);
          reject('Failed to create access token');
        }
        resolve(token);
      });
    });
  
    const config: unknown = {
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
  
    const mailTransport = nodemailer.createTransport(config);
    return mailTransport.sendMail(mailOptions).then(() => true).catch((error: Error) => {
      console.log('There was an error while sending email :', error);
      logger.error(error.stack);
      return false;
    });
};
  
async function sendMailByM65(
    mailOptions: any,
    sendMail: string
  ) {
    let oAuthToken: any = {};
  
    await axios({
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
  
    const ccRecipients = mailOptions?.cc?.map((email: string) => ({
      emailAddress: {
        address:
          email,
      },
    }));
  
    const msgPayload = {
      // Ref: https://learn.microsoft.com/en-us/graph/api/resources/message#properties
      message: {
        subject: mailOptions?.subject,
        body: {
          contentType: 'HTML',
          content: mailOptions?.html,
        },
        toRecipients: [{ emailAddress: { address: mailOptions?.to } }],
        ccRecipients,
      },
    };
  
    await axios({
      method: 'post',
      url: `https://graph.microsoft.com/v1.0/users/${sendMail}/sendMail`,
      headers: {
        Authorization: `Bearer ${oAuthToken?.data.access_token}`,
        'Content-Type': 'application/json',
      },
      data: msgPayload,
    });
  
    return true;
};
  
export async function sendMailUsingConventionalWay(
    mailOptions: unknown,
    sendMail: string,
    sendMailPassKey: string
  ): Promise<boolean> {
    const mailTransport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10),
      secure: parseInt(process.env.MAIL_PORT, 10) === 465,
      requireTLS: process.env.MAIL_REQUIRED_TLS === 'true',
      auth: {
        user: sendMail,
        pass: sendMailPassKey,
      },
    });
  
    return mailTransport.sendMail(mailOptions).then(() => true).catch((error: Error) => {
      console.log('There was an error while sending email :', error);
      return false;
    });
};

function parseDate(
  date: string | undefined, 
  format: string = 'DD-MM-YYYY', 
  isStartOfDay: boolean = true
): Date | undefined {
  if (!date) return undefined;

  const parsedDate = moment.utc(date, format, true);

  if (!parsedDate.isValid()) return undefined;

  return isStartOfDay
    ? parsedDate.startOf('day').toDate()
    : parsedDate.endOf('day').toDate();
}

export { 
    generateRandomPassword,
    encrypt,
    decrypt,
    parseDate
};