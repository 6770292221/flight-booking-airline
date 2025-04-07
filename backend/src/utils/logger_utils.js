import winston from "winston";

function getCallerInfo() {
  const stack = new Error().stack;
  const lines = stack.split("\n");

  // Line 3 is usually the caller
  const callerLine = lines[3] || '';
  const match = callerLine.match(/at (\S+)/);
  return match ? match[1] : "unknown";
}

class Logger {
  constructor() {
    if (!Logger.instance) {
      const baseLogger = winston.createLogger({
        level: "info",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level}: ${message}`;
          })
        ),
        transports: [
          new winston.transports.Console(),
        ],
      });


      Logger.instance = {
        info: (msg) => {
          const caller = getCallerInfo();
          baseLogger.info(`[${caller}] ${msg}`);
        },
        error: (msg) => {
          const caller = getCallerInfo();
          baseLogger.error(`[${caller}] ${msg}`);
        },
        warn: (msg) => {
          const caller = getCallerInfo();
          baseLogger.warn(`[${caller}] ${msg}`);
        },

        log: (level, msg) => {
          const caller = getCallerInfo();
          baseLogger.log(level, `[${caller}] ${msg}`);
        }
      };
    }

    return Logger.instance;
  }
}

const logger = new Logger();
export default logger;
