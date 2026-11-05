function internalAuth(req, res, next) {
  const apiKey = req.headers["x-internal-api-key"];

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized internal request",
    });
  }

  next();
}

module.exports = internalAuth;
