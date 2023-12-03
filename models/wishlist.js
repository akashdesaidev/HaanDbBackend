const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products", // Reference to the ProductModel
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  });
  
const WishListModel = mongoose.model("wishlist", wishListSchema);
module.exports = { WishListModel };
