import express from "express";
import { authRequired, requireRoles } from "../middleware/auth.js";
import { listEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/eventController.js";

const router = express.Router();

router.get("/", listEvents);
router.get("/:id", getEvent);
router.post("/", authRequired, requireRoles("organizer", "admin"), createEvent);
router.put("/:id", authRequired, requireRoles("organizer", "admin"), updateEvent);
router.delete("/:id", authRequired, requireRoles("organizer", "admin"), deleteEvent);

export default router;


