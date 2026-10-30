const Model = require("../models/userModel");

const checkHealth = async (_req, res) => {
  res.set("Cache-Control", "no-store");
  if (Model.db.readyState !== 1) {
    return res.status(503).json({ status: "unavailable" });
  }
  try {
    await Model.findOne({}, { _id: 1 }).maxTimeMS(5000).lean();
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed:", error.name);
    return res.status(503).json({ status: "unavailable" });
  }
};

module.exports = checkHealth;
