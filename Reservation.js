const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    date: String,
    time: String,
    guests: Number,
    notes: String,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", ReservationSchema, "reservations");
