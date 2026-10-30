const User = require("../models/userModel.js");
const { hashPassword, comparePassword } = require("../middleware/auth.js");
const generateToken = require("../middleware/jwt.js");

const cookieOptions = () => ({
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email });

const createUser = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ msg: "Enter a name, a valid email, and a password of at least 8 characters and at most 72 bytes." });
  }
  const userEmail = email.trim().toLowerCase();
  try {
    if (await User.findOne({ email: userEmail })) {
      return res.status(409).json({ msg: "An account with this email already exists." });
    }
    await User.create({
      name: name.trim(),
      email: userEmail,
      password: await hashPassword(password),
    });
    return res.status(201).json({ msg: "account creation successful" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ msg: "An account with this email already exists." });
    }
    console.error("Account creation failed:", error.name);
    return res.status(500).json({ msg: "We could not create your account. Please try again." });
  }
};

const logUserIn = async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || !password || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ msg: "Enter your email and password." });
  }
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ msg: "Email or password is incorrect." });
    }
    const token = generateToken(user._id);
    res.cookie("token", token, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ msg: publicUser(user), token });
  } catch (error) {
    console.error("Login failed:", error.name);
    return res.status(500).json({ msg: "We could not sign you in. Please try again." });
  }
};

const logUserOut = (_req, res) => {
  res.clearCookie("token", cookieOptions());
  return res.status(200).json({ msg: "logout successful" });
};

const getCurrentUser = (req, res) => res.status(200).json({ user: publicUser(req.user) });

module.exports = { createUser, logUserIn, logUserOut, getCurrentUser };
