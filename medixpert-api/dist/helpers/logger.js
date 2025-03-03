"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const transport = new (winston_1.default.transports.DailyRotateFile)({
    filename: './logs/error-%DATE%.log.log',
    datePattern: 'YYYY-MM-DD',
    utc: true,
    zippedArchive: false,
    maxFiles: '7d',
});
const log = winston_1.default.createLogger({
    transports: [
        transport,
    ],
});
function error(errorMsg) {
    log.error({ timeStamp: new Date().toUTCString(), error: errorMsg });
}
module.exports = { error };
