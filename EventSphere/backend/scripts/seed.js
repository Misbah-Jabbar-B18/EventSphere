import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import RSVP from "../models/RSVP.js"; // ✅ added

dotenv.config();

async function run() {
  try {
    await connectDB();

    const organizerEmail = "organizer@example.com";
    let organizer = await User.findOne({ email: organizerEmail });

    // 🧍‍♂️ Create or update organizer user
    if (!organizer) {
      const hashed = await bcrypt.hash("password123", 10);
      organizer = await User.create({
        name: "Demo Organizer",
        email: organizerEmail,
        password: hashed,
        role: "organizer",
      });
      console.log("🆕 Created organizer:", organizer.email);
    } else {
      const hashed = await bcrypt.hash("password123", 10);
      organizer.name = "Demo Organizer (Updated)";
      organizer.password = hashed;
      organizer.role = "organizer";
      await organizer.save();
      console.log("🔁 Updated existing organizer:", organizer.email);
    }

    // 📅 Event templates
    const baseEvents = [
      {
        title: "Tech Conference 2025",
        description: "Join us for the biggest tech conference of the year!",
        category: "Conference",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: "City Convention Center",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        isPublic: true,
      },
      {
        title: "Summer Music Festival",
        description: "A fantastic summer music festival with top artists!",
        category: "Concert",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: "Riverside Park",
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
        isPublic: true,
      },
      {
        title: "Startup Networking Night",
        description: "Connect with fellow entrepreneurs and investors.",
        category: "Networking",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        location: "Innovation Hub",
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
        isPublic: true,
      },
    ];

    // 🗓 Insert events if none exist
    const existingCount = await Event.countDocuments({ organizer: organizer._id });
    let events;
    if (existingCount === 0) {
      const toInsert = baseEvents.map((e) => ({ ...e, organizer: organizer._id }));
      events = await Event.insertMany(toInsert);
      console.log(`🎉 Inserted ${events.length} new events.`);
    } else {
      events = await Event.find({ organizer: organizer._id });
      console.log(`ℹ️ Organizer already has ${existingCount} events. Skipping insert.`);
    }

    // 📩 Seed RSVP data (one RSVP per event for this organizer)
    const existingRSVPs = await RSVP.countDocuments({ user: organizer._id });
    if (existingRSVPs === 0) {
      const rsvps = events.map((e) => ({
        event: e._id,
        user: organizer._id,
        status: "going",
      }));

      await RSVP.insertMany(rsvps);
      console.log(`📨 Inserted ${rsvps.length} RSVP records.`);
    } else {
      console.log(`ℹ️ ${existingRSVPs} RSVP(s) already exist. Skipping.`);
    }

    console.log("\n✅ Seed complete. You can login with:");
    console.log("Email:", organizerEmail);
    console.log("Password: password123");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exitCode = 1;
  } finally {
    // Wait briefly to flush logs
    setTimeout(() => process.exit(), 300);
  }
}

run();
