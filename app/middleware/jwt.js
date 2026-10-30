const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const getSigningKey = () => {
  if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be configured.");
  return process.env.JWT_KEY;
};

const generateToken = (id) => jwt.sign({}, getSigningKey(), {
  algorithm: "HS256",
  subject: String(id),
  expiresIn: "7d",
});

const requireAuth = async (req, res, next) => {
  const authorization = req.get("authorization");
  const token = authorization?.match(/^Bearer (.+)$/i)?.[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ msg: "Please sign in to continue." });

  let key;
  try {
    key = getSigningKey();
  } catch {
    return res.status(503).json({ msg: "Sign-in is temporarily unavailable. Please try again." });
  }

  let payload;
  try {
    payload = jwt.verify(token, key, { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || !/^[a-f0-9]{24}$/i.test(payload.sub)) {
      throw new Error("Invalid token subject.");
    }
  } catch {
    return res.status(401).json({ msg: "Your session is invalid or expired. Please sign in again." });
  }

  try {
    const user = await User.findById(payload.sub).select("-password");
    if (!user) return res.status(401).json({ msg: "Please sign in again." });
    req.user = user;
    return next();
  } catch (error) {
    console.error("Session lookup failed:", error.name);
    return res.status(503).json({ msg: "We could not verify your session. Please try again." });
  }
};

module.exports = generateToken;
module.exports.requireAuth = requireAuth;
