import RSVP from "../models/RSVP.js";
import Event from "../models/Event.js";
import { sendEmail } from "../services/emailService.js"; // Nodemailer service


// Create RSVP & send confirmation email
export const createRsvp = async (req, res) => {
  try {
    const { eventId, status } = req.body;
    if (!eventId) return res.status(400).json({ message: "eventId is required" });

    // Check if event exists and get its date
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if event date has passed
    const currentDate = new Date();
    const eventDate = new Date(event.date);
    currentDate.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < currentDate) {
      return res.status(400).json({ message: "Cannot RSVP to events that have already passed" });
    }

    // Save RSVP in database
    const rsvp = await RSVP.create({
      event: eventId,
      user: req.user._id,
      status: status || "going",
    });

    // Send confirmation email
    const userEmail = req.user.email;
    const userName = req.user.name;
    const htmlContent = `
      <h2>Hello ${userName},</h2>
      <p>You have successfully registered for the event:</p>
      <ul>
        <li><strong>Event:</strong> ${event.title}</li>
        <li><strong>Date:</strong> ${event.date.toDateString()}</li>
        <li><strong>Venue:</strong> ${event.location}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `;
    await sendEmail(userEmail, `RSVP Confirmation for ${event.title}`, htmlContent);

    return res.status(201).json({ rsvp, message: "RSVP created and email sent!" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already RSVPed" });
    }
    return res.status(400).json({ message: "Validation error", error: error.message });
  }
};

// List RSVPs for a specific event
export const listRsvpsByEvent = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.eventId })
      .populate("user", "name email");
    return res.json({ rsvps });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: list all RSVPs (with user + event)
export const listAllRsvps = async (req, res) => {
  try {
    const rsvps = await RSVP.find({})
      .populate("user", "name email")
      .populate("event", "title date organizer");
    return res.json({ rsvps });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Organizer: RSVPs for events created by this organizer
export const listOrganizerRsvps = async (req, res) => {
  try {
    const rsvps = await RSVP.find({})
      .populate({
        path: "event",
        select: "title date organizer",
        match: { organizer: req.user._id },
      })
      .populate("user", "name email");

    const filtered = rsvps.filter((r) => r.event); // Only RSVPs for this organizer
    return res.json({ rsvps: filtered });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Cancel RSVP
export const cancelRsvp = async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({ event: req.params.eventId, user: req.user._id });
    if (!rsvp) return res.status(404).json({ message: "RSVP not found" });
    await rsvp.deleteOne();
    return res.json({ message: "RSVP cancelled" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Logged-in attendee: list own RSVPs (with event populated)
export const listMyRsvps = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id })
      .populate("event", "title date location category organizer")
      .populate("user", "name email");
    return res.json({ rsvps });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
