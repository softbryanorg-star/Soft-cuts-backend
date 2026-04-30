import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
     // ✅ NEW FIELD
    name: {
      type: String,
      default: "",
    },
    service: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    // ✅ NEW FIELD
    type: {
      type: String,
      enum: ["Shop Visit", "Home Service"],
      default: "Shop Visit",
    },
// ✅ NEW FIELD
    address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;