import { Router } from "express";
import {
  createPlan,
  getPlansByEmail,
  deletePlan,
  updatePlan,
  getPlanById,
} from "../controllers/planController.js";

const router = Router();

router.post("/", createPlan);
router.get("/:email", getPlansByEmail);
router.get("/plan/:id", getPlanById);
router.delete("/:id", deletePlan);
router.put("/:id", updatePlan);

export default router;