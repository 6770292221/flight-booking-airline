import winston from "winston";

export class Logger {
  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.cli()
      ),
      transports: [new winston.transports.Console()]
    });
  }

  log(message, level = "info") {
    switch (level) {
      case "info":
        this.logger.info(`✅ ${message}`);
        break;

      case "error":
        this.logger.error(`❌ ${message}`);
        break;

      case "warn":
        this.logger.warn(`⚠️ ${message}`);
        break;

      case "debug":
        this.logger.debug(`🐞 ${message}`);
        break;

      default:
        this.logger.info(`ℹ️ ${message}`); // Default to info
    }
  }
}

export default new Logger();
