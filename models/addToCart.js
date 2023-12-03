const mongoose = require("mongoose");

const addToCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const AddToCartModel = mongoose.model("addToCart", addToCartSchema);
module.exports = { AddToCartModel };
