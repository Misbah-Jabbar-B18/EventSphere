import express from "express";
import { register, login, profile, forgotPassword, resetPassword, listUsers, createAdmin } from "../controllers/authController.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, profile);
router.get("/users", authRequired, requireRoles("admin"), listUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/admin", authRequired, requireRoles("admin"), createAdmin);

export default router;


