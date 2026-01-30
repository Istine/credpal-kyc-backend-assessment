import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { randomUUID } from "crypto";

import { errorHandler } from "./middlewares/errorHandler";
import morganMiddleware from "./middlewares/morganMiddleware";
import authRoutes from "./modules/auth/auth.routes";
import kycRoutes from "./modules/kyc/kyc.routes";
import adminKycRoutes from "./modules/admin/admin.kyc.routes";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());

app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", requestId);
  req.requestId = requestId;
  next();
});

if (process.env.NODE_ENV !== "test") {
  app.use(morganMiddleware);
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "development",
  });
});

//Routes

app.use(authRoutes);
app.use("/kyc", kycRoutes);
app.use("/admin", adminKycRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
