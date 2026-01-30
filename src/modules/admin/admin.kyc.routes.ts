import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { getKyc, listKyc, reviewKyc } from "./admin.kyc.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/kyc", listKyc);
router.get("/kyc/:id", getKyc);
router.patch("/kyc/:id/review", reviewKyc);

export default router;
