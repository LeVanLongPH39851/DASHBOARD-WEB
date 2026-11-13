function errorHandler(err, req, res, next) {
  console.error("[Gateway Error]", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      status: 403,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: 500,
    message: "Internal Gateway Error",
  });
}

module.exports = errorHandler;
