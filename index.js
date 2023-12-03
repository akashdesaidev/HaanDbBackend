const express = require("express");
var cors = require("cors");
const app = express();
const PORT = 3000;

const { logger, Authentication } = require("./middlewares");

const { connection } = require("./db");
const { UserModel } = require("./models/userModel");
const { ProductModel } = require("./models/productModel");
const { AddToCartModel } = require("./models/addToCart");
const { WishListModel } = require("./models/wishlist");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json());
//loggermiddleware
app.use(logger);

app.use(cors());
app.get("/", (req, res) => {
  // ProductModel.insertMany( );

  res.json({ message: "working" });
});
app.post("/signup", async (req, res) => {
  const { name, age, email, city, phone_no, password } = req.body;

  bcrypt.hash(password, 10, async function (err, hash) {
    if (err) {
      return res.json({ error: "Hashing error" });
    }
    try {
      const user = new UserModel({
        name,
        email,
        city,
        phone_no,
        password: hash,
      });

      const Existinguser = await UserModel.findOne({ email: email });
      if (Existinguser) {
        res.status(300).json({
          message: "user already exist",
        });
      } else {
        await user.save();
        res.json(user);
      }
    } catch (err) {
      res.json({ error: "User creation error" });
    }
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email: email });

  if (!user) {
    return res.json({ error: "Invalid email or password" });
  }

  const hash = user.password;
  bcrypt.compare(password, hash, function (err, result) {
    if (err || !result) {
      return res.json({ error: "Invalid email or password" });
    }

    const userWithoutPassword = {
      _id: user._id,
      username: user.name,
      email: user.email,
    };

    var token = jwt.sign({ user: userWithoutPassword }, "Akash");
    res.json({ message: "Login successful", token });
  });
});

app.get("/products", async (req, res) => {
  console.log(req.query);
  try {
    const query = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
    };

    if (req.query.warranty) {
      query.warranty = req.query.warranty;
    }

    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const totalCount = await ProductModel.countDocuments();

    const totalPages = Math.ceil(totalCount / query.limit);

    const products = await ProductModel.find({
      // Add your other query parameters here
      warranty: query.warranty, // Example: include warranty in the query
    })
      .skip(skip)
      .limit(limit);

    res.json({ products, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//authorization middleware
app.use(Authentication);

app.post("/addToCart", async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;

  if (!productId || !quantity || !userId) {
    return res.json({ error: "All required fields must be provided" });
  }

  const newaddToCart = new AddToCartModel({
    productId,
    userId,
    quantity,
  });

  const ExistingaddToCart = await AddToCartModel.findOne({
    productId,
  });

  if (ExistingaddToCart) {
    ExistingaddToCart.quantity = ExistingaddToCart.quantity + 1;

    // Save the updated document
    await ExistingaddToCart.save();

    res.status(200).json({
      message: "Quantity increased in cart",
      updatedCart: ExistingaddToCart,
    });
  } else {
    await newaddToCart.save();
    res.json(newaddToCart);
  }
});
app.post("/wishlist", async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;

  if (!productId || !quantity || !userId) {
    return res.json({ error: "All required fields must be provided" });
  }

  const newWishList = new WishListModel({
    productId,
    userId,
    quantity,
  });

  const ExistingWishList = await WishListModel.findOne({
    productId,
  });
  if (ExistingWishList) {
    res.status(300).json({
      message: "Product is already in wishlist",
    });
  } else {
    await newWishList.save();
    res.status(200).json(newWishList);
  }
});
app.get("/wishlist", async (req, res) => {
  const userId = req.userId;

  const wishlistItems = await WishListModel.find({
    userId,
  }).populate("productId");

  const productsInWishlist = wishlistItems.map((item) => ({
    id: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,
    pack: item.productId.pack,
    description: item.productId.description,
    category: item.productId.category,
    img: item.productId.img,
    discounted_price: item.productId.discounted_price,

    // other product details
  }));

  if (!wishlistItems) {
    res.status(300).json({
      message: "No products in wishlist",
    });
  } else {
    res.status(200).json(productsInWishlist);
  }
});

app.put("/products/:productID", async (req, res) => {
  try {
    const productId = req.params.productID;
    const updatedData = req.body;

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      // If the product doesn't exist, return a 404 Not Found response
      return res.json({ error: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.json({ error: "Internal server error" });
  }
});

app.delete("/products/:productID", async (req, res) => {
  try {
    const productId = req.params.productID;
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  try {
    connection;
    console.log(`Listening on port:${PORT}`);
  } catch (err) {
    console.error(err);
  }
});
