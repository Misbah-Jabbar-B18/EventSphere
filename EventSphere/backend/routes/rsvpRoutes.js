import express from "express";
import RSVP from "../models/RSVP.js";
import { authRequired, requireRoles } from "../middleware/auth.js";
import {
  createRsvp,
  listRsvpsByEvent,
  cancelRsvp,
  listAllRsvps,
  listOrganizerRsvps,
  listMyRsvps,
} from "../controllers/rsvpController.js";

const router = express.Router();

// existing routes
router.post("/", authRequired, createRsvp);
router.get("/event/:eventId", authRequired, listRsvpsByEvent);
router.delete("/event/:eventId", authRequired, cancelRsvp);
router.get("/", authRequired, requireRoles("admin"), listAllRsvps);
router.get(
  "/organizer",
  authRequired,
  requireRoles("organizer", "admin"),
  listOrganizerRsvps
);
router.get("/my", authRequired, listMyRsvps);

// ==================================================
// ✅ QR CHECK-IN ROUTE (ADMIN / ORGANIZER)
// ==================================================
router.post(
  "/checkin",
  authRequired,
  requireRoles("admin", "organizer"),
  async (req, res) => {
    try {
      const { rsvpId, eventId } = req.body;

      const rsvp = await RSVP.findOne({
        _id: rsvpId,
        event: eventId,
      }).populate("user", "name email");

      if (!rsvp) {
        return res.status(404).json({ message: "RSVP not found" });
      }

      if (rsvp.status !== "going") {
        return res.status(400).json({ message: "RSVP not confirmed" });
      }

      if (rsvp.checkedIn) {
        return res.status(400).json({ message: "Already checked in" });
      }

      rsvp.checkedIn = true;
      rsvp.checkedInAt = new Date();
      await rsvp.save();

      res.json({
        message: "✅ Attendee checked in successfully",
        attendee: {
          name: rsvp.user.name,
          email: rsvp.user.email,
        },
      });
    } catch (err) {
      console.error("QR Check-in Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
