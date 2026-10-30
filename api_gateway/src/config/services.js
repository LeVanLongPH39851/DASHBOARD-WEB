const services = {
  backend: {
    name: "backend",

    permission: "backend:read",

    instances: [
      {
        url: "http://localhost:5000",
        healthy: false,
        failures: 0,
        successes: 0,
      },
      //   {
      //     url: "http://localhost:5001",
      //     healthy: false,
      //     failures: 0,
      //     successes: 0,
      //   },
      //   {
      //     url: "http://localhost:5002",
      //     healthy: false,
      //     failures: 0,
      //     successes: 0,
      //   },
    ],

    current: 0,
  },
};

module.exports = services;
