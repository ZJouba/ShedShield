import { app } from "electron";
import winston from "winston";
import path from 'path';
import util from 'util';

const combineMessageAndSplat = () => ({
  transform: (info: any) => {
    const args = [info.message, ...(info[Symbol.for('splat')] || [])];
    info.message = args;

    const msg = args.map(arg => {
        if (typeof arg === 'object')
            return util.inspect(arg, {compact: true, depth: Infinity});
        return arg;
    }).join(' ');

    info[Symbol.for('message')] = `${info[Symbol.for('level')]}: ${msg}${info.stack ? ' ' + info.stack : ''}`;

    return info;
  }
})

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.timestamp(),
    combineMessageAndSplat(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}\n${info.stack}`)
  )
});

const logPath = process.env.NODE_ENV === 'production' ? app.getPath('userData') : '.';

logger.add(new winston.transports.File(
  { 
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug', 
    filename: path.join(logPath, 'shedshield.log'), 
    options: { 
      flags: 'a' 
    },
    maxsize: 1000000,
    maxFiles: 1
  }));

export default logger;