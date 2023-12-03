const mongoose = require("mongoose");

const addToCartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const AddToCartModel = mongoose.model("addToCart", addToCartSchema);
module.exports = { AddToCartModel };
