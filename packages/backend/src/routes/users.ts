import { Router } from "express";
import { googleLogin, register, login } from "../controllers/userController.js";

const router = Router();

router.post("/google-login", googleLogin);
router.post("/register", register);
router.post("/login", login);

export default router;