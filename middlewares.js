const fs = require("fs");
const path = require("path");
var jwt = require("jsonwebtoken");
const logger = (req, res, next) => {
  const start = Date.now();
  next();
  const end = Date.now();
  const total = end - start;
  const data = {
    method: req.method,
    URL: req.path,
    time: total + " ms",
  };
  console.log(data);
  const logEntry = JSON.stringify(data) + "\n";
  fs.appendFileSync(path.join(__dirname, "logs.txt"), logEntry);
};

const Authentication = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, "Akash", function (err, decoded) {
    if (err) {
      console.log(token);
      return res.send("something went wrong");
    }
    req.userId = decoded.user._id;
    
    next();
  });
};

module.exports = { logger, Authentication };
