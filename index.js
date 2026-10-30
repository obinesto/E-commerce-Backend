const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

if (require.main === module) require("dotenv").config();

const Route = require("./app/Routes/userRoute");
const checkHealth = require("./app/controllers/healthController");
const keepAlive = require("./app/scripts/keepAlive");

const App = express();
App.set("trust proxy", 1);
App.use(cors(process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL, credentials: true }
  : {}));
App.use(express.json());
App.use(express.urlencoded({ extended: false }));
App.use(cookieParser());

App.get("/", (_req, res) => res.status(200).json("Home Page"));
App.get("/health", checkHealth);
App.use("/v1/api/user", Route);

if (require.main === module) {
  if (!process.env.JWT_KEY) {
    console.error("JWT_KEY must be configured before starting the server.");
    process.exitCode = 1;
  } else {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        App.listen(process.env.PORT || 3000, () => {
          console.log("Server started.");
          keepAlive();
        });
      })
      .catch((error) => {
        console.error("Database connection failed:", error.name);
        process.exitCode = 1;
      });
  }
}

module.exports = App;
