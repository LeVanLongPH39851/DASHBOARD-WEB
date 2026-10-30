const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Mã OTP xác thực đăng nhập",
    text: `Mã OTP đăng nhập của bạn là ${otp}. Mã có hiệu lực trong 5 phút.`,
    html: `
      <div style="font-family: Arial, sans-serif">
        <h2>Xác thực đăng nhập</h2>
        <p>Mã OTP của bạn:</p>
        <h1 style="letter-spacing: 8px">${otp}</h1>
        <p>Mã có hiệu lực trong 5 phút.</p>
        <p>Không chia sẻ mã này với bất kỳ ai.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
