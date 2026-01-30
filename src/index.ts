import dotenv from "dotenv";
import path from "path";
import http from "http";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { connectDB } from "./config/db";

import logger from "./config/logger";

import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`API listening on http://localhost:${PORT}`);
    logger.info(`Health: http://localhost:${PORT}/health`);
  });

  const closeServer = () =>
    new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.info(`\nReceived ${signal}. Shutting down gracefully...`);

    const forceTimer = setTimeout(() => {
      logger.error("Forced shutdown after 10s.");
      process.exit(1);
    }, 10_000);
    forceTimer.unref();

    try {
      await closeServer();
      logger.info("HTTP server closed.");

      await mongoose.connection.close();
      logger.info("MongoDB connection closed.");

      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", async (reason) => {
    logger.error("Unhandled Rejection:", reason);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  });

  process.on("uncaughtException", async (err) => {
    logger.error("Uncaught Exception:", err);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to bootstrap the server:", err);
  process.exit(1);
});
