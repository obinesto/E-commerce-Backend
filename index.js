const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const mongoose = require("mongoose");
const Route = require("./app/Routes/userRoute");

// configure env
env.config();

const port = process.env.PORT;

// Initialize express as an app
const App = express();

// middleware
App.use(cors());
App.use(express.json());
App.use(express.urlencoded({ extended: false }));

App.get("/", (req, res) => {
  res.status(200).json("Home Page");
});

// route
App.use("/v1/api/user", Route);

// connecting to momgodb database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    App.listen(port, () => {
      console.log(`server now running on port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
