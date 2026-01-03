import mongoose from "mongoose";

const rsvpSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["going", "interested", "not_going"],
      default: "going",
    },

    // ✅ QR CHECK-IN
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// one RSVP per user per event
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

const RSVP = mongoose.model("RSVP", rsvpSchema);
export default RSVP;
