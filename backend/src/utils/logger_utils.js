import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.cli(),
  transports: [new winston.transports.Console({ timestamp: true })],
});

export default logger;
