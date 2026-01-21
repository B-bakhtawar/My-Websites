const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ["Starters", "Main", "Desserts", "Drinks"] },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
