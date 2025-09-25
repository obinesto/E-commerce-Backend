const {
  createUser,
  logUserIn,
  logUserOut,
} = require("../controllers/userController");
const express = require("express");

const Route = express.Router();

Route.post("/register", createUser);
Route.post("/login", logUserIn);
Route.get("/logout", logUserOut);

module.exports = Route;
