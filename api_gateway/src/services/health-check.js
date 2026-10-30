const axios = require("axios");

const services = require("../config/services");

const INTERVAL = Number(process.env.HEALTH_CHECK_INTERVAL || 10000);

const TIMEOUT = Number(process.env.HEALTH_CHECK_TIMEOUT || 3000);

const FAILURE_THRESHOLD = Number(process.env.HEALTH_FAILURE_THRESHOLD || 2);

const SUCCESS_THRESHOLD = Number(process.env.HEALTH_SUCCESS_THRESHOLD || 2);

async function checkInstance(instance) {
  try {
    const response = await axios.get(`${instance.url}/health`, {
      timeout: TIMEOUT,
    });

    if (response.status === 200) {
      instance.successes++;
      instance.failures = 0;

      // Đạt đủ số lần thành công mới Healthy
      if (instance.successes >= SUCCESS_THRESHOLD) {
        if (!instance.healthy) {
          console.log(`[Health Check] ${instance.url} is Healthy`);
        }

        instance.healthy = true;
      }
    }
  } catch (error) {
    instance.failures++;
    instance.successes = 0;

    // Đạt đủ số lần thất bại mới Unhealthy
    if (instance.failures >= FAILURE_THRESHOLD) {
      if (instance.healthy) {
        console.log(`[Health Check] ${instance.url} is Unhealthy`);
      }

      instance.healthy = false;
    }
  }
}

async function checkAllInstances() {
  const tasks = [];

  for (const service of Object.values(services)) {
    for (const instance of service.instances) {
      tasks.push(checkInstance(instance));
    }
  }

  await Promise.all(tasks);
}

async function startHealthCheck() {
  console.log("[Gateway] Starting Health Check");

  // Kiểm tra ngay khi khởi động
  await checkAllInstances();

  // Tiếp tục kiểm tra định kỳ
  setInterval(() => {
    checkAllInstances();
  }, INTERVAL);
}

module.exports = {
  startHealthCheck,
  checkAllInstances,
};
