const axios = require("axios");

const getNextInstance = require("./load-balancer");

const RETRY_ATTEMPTS = Number(process.env.RETRY_ATTEMPTS || 2);

const PROXY_TIMEOUT = Number(process.env.PROXY_TIMEOUT || 10000);

const RETRYABLE_STATUS = [502, 503, 504];

const RETRYABLE_ERRORS = [
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "EPIPE",
];

async function forwardRequest(req, res, service) {
  const excludedInstances = [];

  const method = req.method.toUpperCase();

  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  // Chỉ Retry các request đọc dữ liệu mặc định.
  // Request ghi dữ liệu cần Idempotency Key.
  const canRetry =
    safeMethods.includes(method) || Boolean(req.headers["idempotency-key"]);

  const maxAttempts = canRetry ? RETRY_ATTEMPTS + 1 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const instance = getNextInstance(service, excludedInstances);

    if (!instance) {
      return res.status(503).json({
        message: `${service.name} service unavailable`,
      });
    }

    excludedInstances.push(instance.url);

    try {
      console.log(
        `[Proxy] ${method} ${service.name} - Attempt ${attempt} - ${instance.url}`,
      );

      // req.url là đường dẫn còn lại sau khi Express
      // loại bỏ prefix /api/rating, /api/spot...
      const targetUrl = new URL(req.url, instance.url).toString();

      const headers = { ...req.headers };

      // Xóa các header hop-by-hop
      ["host", "connection", "content-length", "transfer-encoding"].forEach(
        (header) => {
          delete headers[header];
        },
      );

      const response = await axios({
        method,

        url: targetUrl,

        headers,

        // Body đã được express.json() đọc
        data: req.body,

        timeout: PROXY_TIMEOUT,

        maxRedirects: 0,

        responseType: "arraybuffer",

        validateStatus: () => true,
      });

      // Backend lỗi tạm thời
      if (RETRYABLE_STATUS.includes(response.status) && attempt < maxAttempts) {
        console.warn(`[Retry] ${service.name} returned ${response.status}`);

        continue;
      }

      // Trả kết quả về Frontend
      res.status(response.status);

      const excludedHeaders = [
        "connection",
        "transfer-encoding",
        "content-length",
        "keep-alive",
        "upgrade",
      ];

      for (const [key, value] of Object.entries(response.headers)) {
        if (!excludedHeaders.includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }

      return res.send(Buffer.from(response.data || []));
    } catch (error) {
      console.error(
        `[Proxy Error] ${instance.url}:`,
        error.code || error.message,
      );

      if (RETRYABLE_ERRORS.includes(error.code)) {
        // Đánh dấu lỗi kết nối để không tiếp tục chọn
        // instance này trong những request tiếp theo.
        instance.healthy = false;
        instance.failures = Math.max(
          instance.failures,
          Number(process.env.HEALTH_FAILURE_THRESHOLD || 2),
        );
      }

      if (attempt === maxAttempts) {
        return res.status(502).json({
          message: `${service.name} backend connection failed`,
        });
      }
    }
  }

  return res.status(503).json({
    message: "No backend instance available",
  });
}

module.exports = forwardRequest;
