import winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new (winston.transports.DailyRotateFile)({
  filename: './logs/error-%DATE%.log.log',
  datePattern: 'YYYY-MM-DD',
  utc: true,
  zippedArchive: false,
  maxFiles: '7d',
});

const log = winston.createLogger({
  transports: [
    transport,
  ],
});

function error(errorMsg: string | undefined): void {
  log.error({ timeStamp: new Date().toUTCString(), error: errorMsg });
}

export = { error }
