require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const apiRoutes = require("./routes/api.routes");

const { globalRateLimit } = require("./middleware/rate-limit");

const { startHealthCheck } = require("./services/health-check");

const errorHandler = require("./middleware/error-handler");

const services = require("./config/services");

const app = express();

// Nếu chạy sau Nginx đáng tin cậy, cấu hình số hop phù hợp.
// Không đặt trust proxy = true một cách tùy tiện.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);

app.set("trust proxy", trustProxyHops);

// Security Headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
  }),
);

// Logging
app.use(morgan("combined"));

// Rate Limit toàn hệ thống
app.use(globalRateLimit);

// Parse JSON
app.use(
  express.json({
    limit: "2mb",
  }),
);

// Health Check của chính Gateway
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "API Gateway",
  });
});

// Trạng thái các Backend Instance
app.get("/health/services", (req, res) => {
  const result = {};

  for (const [key, service] of Object.entries(services)) {
    result[key] = {
      name: service.name,
      instances: service.instances.map((instance) => ({
        url: instance.url,
        healthy: instance.healthy,
      })),
    };
  }

  res.json(result);
});

// Các API nghiệp vụ
app.use("/api", apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
  });
});

// Error Handler
app.use(errorHandler);

// Khởi động
async function startServer() {
  try {
    console.log("[Gateway] Starting...");

    // Kiểm tra Backend trước khi nhận request
    await startHealthCheck();

    const PORT = process.env.PORT || 8090;

    app.listen(PORT, () => {
      console.log(`[Gateway] Running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[Gateway] Startup failed:", error);

    process.exit(1);
  }
}

startServer();
