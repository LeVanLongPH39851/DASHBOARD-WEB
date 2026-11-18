const backendUrls = (process.env.BACKEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const services = {
  backend: {
    name: "backend",

    instances: backendUrls.map((url) => ({
      url,
      healthy: false,
      failures: 0,
      successes: 0,
    })),

    current: 0,
  },
};

module.exports = services;
