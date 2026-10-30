const crypto = require("crypto");
const otpRedis = require("../config/otp.redis");
const emailService = require("./email.service");

const OTP_PREFIX = "auth_otp:";
const OTP_TTL = Number(process.env.OTP_EXPIRES_IN || 300);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

function hashOtp(challengeId, otp) {
  return crypto
    .createHash("sha256")
    .update(`${challengeId}:${otp}`)
    .digest("hex");
}

function maskEmail(email) {
  const [name, domain] = email.split("@");

  if (!domain) return "***";

  return `${name.slice(0, 2)}***@${domain}`;
}

// Tạo OTP và gửi email
async function createOtp({ email, sessionCookie, user }) {
  if (!email || !sessionCookie || !user) {
    throw new Error("Thiếu thông tin tạo OTP");
  }

  const challengeId = crypto.randomUUID();
  const otp = crypto.randomInt(100000, 1000000).toString();

  const redisKey = `${OTP_PREFIX}${challengeId}`;

  const data = {
    otpHash: hashOtp(challengeId, otp),
    sessionCookie,
    user,
    attempts: 0,
  };

  // Lưu dữ liệu vào Redis DB 5, TTL 300 giây
  await otpRedis.set(redisKey, JSON.stringify(data), "EX", OTP_TTL);

  try {
    // Gửi OTP qua Gmail
    await emailService.sendOtpEmail(email, otp);
  } catch (error) {
    // Nếu gửi email thất bại thì xóa challenge
    await otpRedis.del(redisKey);

    console.error("[OTP Email Error]", error.message);

    throw new Error("Không thể gửi email OTP");
  }

  return {
    challengeId,
    email: maskEmail(email),
    expiresIn: OTP_TTL,
  };
}

// Xác minh OTP
async function verifyOtp(challengeId, otp) {
  if (!challengeId || !/^\d{6}$/.test(otp || "")) {
    throw new Error("Challenge ID hoặc OTP không hợp lệ");
  }

  const redisKey = `${OTP_PREFIX}${challengeId}`;
  const inputHash = hashOtp(challengeId, otp);

  // Lua script đảm bảo kiểm tra và tiêu thụ OTP nguyên tử
  const script = `
    local raw = redis.call("GET", KEYS[1])

    if not raw then
      return {"NOT_FOUND"}
    end

    local data = cjson.decode(raw)

    if data.attempts >= tonumber(ARGV[2]) then
      redis.call("DEL", KEYS[1])
      return {"MAX_ATTEMPTS"}
    end

    if data.otpHash ~= ARGV[1] then
      data.attempts = data.attempts + 1

      if data.attempts >= tonumber(ARGV[2]) then
        redis.call("DEL", KEYS[1])
        return {"MAX_ATTEMPTS"}
      end

      redis.call("SET", KEYS[1], cjson.encode(data), "KEEPTTL")
      return {"INVALID"}
    end

    redis.call("DEL", KEYS[1])
    return {"SUCCESS", cjson.encode(data)}
  `;

  const result = await otpRedis.eval(
    script,
    1,
    redisKey,
    inputHash,
    String(MAX_ATTEMPTS),
  );

  const status = result[0];

  if (status === "NOT_FOUND") {
    throw new Error("OTP không tồn tại hoặc đã hết hạn");
  }

  if (status === "MAX_ATTEMPTS") {
    throw new Error("Bạn đã nhập sai OTP quá số lần cho phép");
  }

  if (status === "INVALID") {
    throw new Error("OTP không chính xác");
  }

  const data = JSON.parse(result[1]);

  return {
    sessionCookie: data.sessionCookie,
    user: data.user,
  };
}

module.exports = {
  createOtp,
  verifyOtp,
};
