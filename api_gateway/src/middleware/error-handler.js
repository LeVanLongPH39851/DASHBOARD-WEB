function errorHandler(err, req, res, next) {
  console.error("[Gateway Error]", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    status: 500,
    message: "Internal Gateway Error",
  });
}

module.exports = errorHandler;
