import Event from "../models/Event.js";

/* ===================== LIST EVENTS ===================== */
export const listEvents = async (req, res) => {
  try {
    const filter = {};

    // public events only (default)
    if (req.query.all !== "true") {
      filter.isPublic = true;
    }

    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    return res.json({ events });
  } catch (error) {
    console.error("LIST EVENTS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===================== GET SINGLE EVENT ===================== */
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json({ event });
  } catch (error) {
    console.error("GET EVENT ERROR:", error);
    return res.status(500).json({ message: "Invalid event ID" });
  }
};

/* ===================== CREATE EVENT ===================== */
export const createEvent = async (req, res) => {
  
  try {
    const {
      title,
      description,
      category,
      date,
      location,
      image,
      isPublic,
    } = req.body;

    if (!title || !description || !category || !date || !location) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date: new Date(date),
      location,
      image,
      isPublic,
      organizer: req.user._id, // 🔐 secure
    });

    return res.status(201).json({ event });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    return res.status(400).json({ message: error.message });
  }
};

/* ===================== UPDATE EVENT ===================== */
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 🔐 only owner or admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatableFields = [
      "title",
      "description",
      "category",
      "date",
      "location",
      "image",
      "isPublic",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] =
          field === "date" ? new Date(req.body[field]) : req.body[field];
      }
    });

    await event.save();
    return res.json({ event });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    return res.status(400).json({ message: error.message });
  }
};

/* ===================== DELETE EVENT ===================== */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await event.deleteOne();
    return res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
