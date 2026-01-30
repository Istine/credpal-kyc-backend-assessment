import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import {
  deleteMeKyc,
  getMeKyc,
  patchMeKyc,
  submitMeKyc,
} from "./kyc.controller";

const router = Router();

router.get("/me", requireAuth, getMeKyc);
router.patch("/me", requireAuth, patchMeKyc);
router.post("/me/submit", requireAuth, submitMeKyc);
router.delete("/me", requireAuth, deleteMeKyc);

export default router;
