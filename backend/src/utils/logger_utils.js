// logger_facade.js
import winston from "winston";

function formatMessage(level, msg) {
  const caller = new Error().stack.split("\n")[3]?.match(/at (\S+)/)?.[1] || 'unknown';
  return `[${caller}] ${msg}`;
}

const baseLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

const LoggerFacade = {
  info: (msg) => baseLogger.info(formatMessage('info', msg)),
  error: (msg) => baseLogger.error(formatMessage('error', msg)),
  warn: (msg) => baseLogger.warn(formatMessage('warn', msg)),
  log: (level, msg) => baseLogger.log(level, formatMessage(level, msg))
};

export default LoggerFacade;
