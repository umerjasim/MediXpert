import { ObjectId } from "mongodb";
import { SendMailAuth } from "../dbTypes";
import { encrypt } from "../../utility/utility";

export const sendMailAuth: SendMailAuth = {
        _id: new ObjectId(),
        mail: process.env.SEND_MAIL,
        passKey: encrypt(process.env.SEND_MAIL_PASS_KEY),
        active: true,
        created: {
            by: 'system',
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
};