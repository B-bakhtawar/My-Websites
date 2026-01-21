const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    address: String,
    items: Array,
    totalQty: Number,
    totalPrice: Number,
    status: { type: String, default: "Placed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema, "orders");

