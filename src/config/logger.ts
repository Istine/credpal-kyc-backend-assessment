import winston from "winston";
import path from "path";
import { MongoDB } from "winston-mongodb";

const { combine, timestamp, json } = winston.format;

const uri = process.env.MONGO_LOGS_URI as string;

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join("./logs", "app.log") }),
  ],
});

logger.add(
  new MongoDB({
    db: uri,
    collection: "app_logs",
  }),
);
export default logger;
