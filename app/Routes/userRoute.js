const express = require("express");
const { createUser, logUserIn, logUserOut, getCurrentUser } = require("../controllers/userController");
const { requireAuth } = require("../middleware/jwt");

const Route = express.Router();

Route.post("/register", createUser);
Route.post("/login", logUserIn);
Route.get("/logout", logUserOut);
Route.post("/logout", logUserOut);
Route.get("/me", requireAuth, getCurrentUser);

module.exports = Route;
