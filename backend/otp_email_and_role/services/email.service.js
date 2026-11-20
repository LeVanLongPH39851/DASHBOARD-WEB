const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const LOGO_PATH = fs.existsSync(
  path.join(__dirname, "../assets/logo_VTVRating_white.png"),
)
  ? path.join(__dirname, "../assets/logo_VTVRating_white.png")
  : path.join(__dirname, "../assets/logo_VTVRating_dark.png");

async function sendOtpEmail(email, otp) {
  const attachments = [];
  const hasLogo = fs.existsSync(LOGO_PATH);
  if (hasLogo) {
    attachments.push({
      filename: "logo_VTVRating_white.png",
      path: LOGO_PATH,
      cid: "vtvratings_logo",
    });
  }

  const senderName = process.env.SMTP_FROM_NAME || "VTVRatings";
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const from = senderEmail?.includes("<")
    ? senderEmail
    : `"${senderName}" <${senderEmail}>`;

  const subject = "Mã OTP xác thực đăng nhập hệ thống VTVRatings";

  const text = [
    "Xin chào,",
    "",
    `Mã OTP xác thực đăng nhập hệ thống VTVRatings của bạn là: ${otp}`,
    "",
    "Mã có hiệu lực trong vòng 5 phút (kể từ khi yêu cầu).",
    "",
    "LƯU Ý BẢO MẬT:",
    "- Tuyệt đối KHÔNG chia sẻ mã OTP này cho bất kỳ ai, kể cả nhân viên quản trị hệ thống.",
    "- Nếu bạn KHÔNG gửi yêu cầu đăng nhập này, vui lòng bỏ qua email và đổi mật khẩu ngay lập tức.",
    "",
    "Trân trọng,",
    "Hệ thống VTVRatings — Powered by NEO-TAM",
    "(Đây là email tự động, vui lòng không phản hồi lại email này)",
  ].join("\n");

  const logoHtml = hasLogo
    ? `<img src="cid:vtvratings_logo" alt="VTVRatings" width="180" style="display: block; width: 180px; max-width: 100%; height: auto; border: 0;" />`
    : `<h2 style="margin: 0; color: #0284c7; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VTV<span style="color: #0f172a;">ratings</span></h2>`;

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          
          <!-- Gradient Top Bar -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #20A7C9 0%, #7367f0 50%, #20A7C9 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 36px 30px 16px 30px;">
              ${logoHtml}
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding: 8px 30px 6px 30px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">Xác thực đăng nhập</h1>
            </td>
          </tr>

          <!-- Intro Description -->
          <tr>
            <td align="center" style="padding: 0 35px 22px 35px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Bạn hoặc ai đó vừa gửi yêu cầu đăng nhập vào hệ thống <strong>VTVRatings</strong>. Vui lòng sử dụng mã OTP bên dưới để hoàn tất xác thực:
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding: 0 30px 24px 30px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 22px 16px;">
                <tr>
                  <td align="center">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Mã xác thực OTP</span>
                    <span style="display: inline-block; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; color: #0284c7; letter-spacing: 10px; padding-left: 10px; line-height: 1.2;">${otp}</span>
                    <div style="margin-top: 14px;">
                      <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px;">
                        ⏱️ Có hiệu lực trong vòng 5 phút
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding: 0 30px 26px 30px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px 16px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 12.5px; font-weight: 700; color: #b45309;">
                      ⚠️ Lưu ý bảo mật:
                    </p>
                    <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #92400e;">
                      <li>Tuyệt đối <strong>không chia sẻ</strong> mã OTP này cho bất kỳ ai, kể cả nhân viên quản trị.</li>
                      <li>Nếu bạn <strong>không yêu cầu</strong> mã này, vui lòng bỏ qua email và đổi mật khẩu tài khoản ngay lập tức.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 30px;">
              <div style="height: 1px; background-color: #f1f5f9;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 30px 30px 30px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Hệ thống Đo lường &amp; Báo cáo Khán giả Truyền hình — VTVRatings
              </p>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #94a3b8; font-weight: 500;">
                POWERED BY NEO-TAM
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #94a3b8;">
                Đây là email tự động từ hệ thống, vui lòng không phản hồi thư này.<br>
                &copy; 2026 VTVRatings. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
    attachments,
  });
}

module.exports = { sendOtpEmail };
