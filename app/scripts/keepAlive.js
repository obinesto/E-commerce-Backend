const http = require("http");
const https = require("https");

const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 mins

const startKeepAliveJob = () => {
  const deployedUrl = process.env.DEPLOYED_URL;
  if (!deployedUrl) {
    console.warn("DEPLOYED_URL is not set. Keep-alive job was skipped.");
    return;
  }

  let healthUrl;
  try {
    healthUrl = new URL("/health", deployedUrl);
    if (!["http:", "https:"].includes(healthUrl.protocol)) throw new Error("Unsupported protocol.");
  } catch {
    console.error("DEPLOYED_URL must be a valid HTTP or HTTPS URL. Keep-alive job was skipped.");
    return;
  }

  const pingServer = () => {
    const client = healthUrl.protocol === "https:" ? https : http;
    const request = client.get(healthUrl, (response) => {
      response.resume();
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log("Server and database health check succeeded.");
      } else {
        console.error("Server and database health check failed with status", response.statusCode);
      }
    });
    request.setTimeout(30000, () => request.destroy(new Error("Health request timed out.")));
    request.on("error", (error) => console.error("Health request failed:", error.message));
  };

  pingServer();
  const timer = setInterval(pingServer, KEEP_ALIVE_INTERVAL_MS);
  timer.unref();
  console.log("Keep-alive job started. Checking server and database every 10 minutes.");
  return () => clearInterval(timer);
};

module.exports = startKeepAliveJob;
