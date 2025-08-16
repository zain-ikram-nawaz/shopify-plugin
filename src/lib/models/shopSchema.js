const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopDomain: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
  },
  { timestamps: true }
);

// Check if model already exists (Next.js hot reload issue)
const Shop = mongoose.models.Shop || mongoose.model("Shop", shopSchema);

module.exports = Shop;
