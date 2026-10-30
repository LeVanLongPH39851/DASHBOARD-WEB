const axios = require("axios");
const cheerio = require("cheerio");

const SUPERSET_URL = process.env.SUPERSET_URL;

// Chuyển Set-Cookie thành Cookie và lưu theo tên cookie
function updateCookies(cookieMap, cookies = []) {
  cookies.forEach((cookie) => {
    const item = cookie.split(";")[0];
    const index = item.indexOf("=");

    if (index > 0) {
      const name = item.substring(0, index);
      cookieMap.set(name, item);
    }
  });
}

async function login(username, password) {
  try {
    console.log("→ Đang đăng nhập Superset...");

    const cookieMap = new Map();

    // 1. GET trang login để lấy session cookie và CSRF token
    const loginPageResponse = await axios.get(`${SUPERSET_URL}/login/`, {
      maxRedirects: 5,
      timeout: 10000,
    });

    // Lấy cookie ban đầu
    updateCookies(cookieMap, loginPageResponse.headers["set-cookie"]);

    // Lấy CSRF token từ HTML
    const $ = cheerio.load(loginPageResponse.data);

    const csrfToken = $('input[name="csrf_token"]').val();

    if (!csrfToken) {
      throw new Error("Không tìm thấy CSRF token trong trang login");
    }

    console.log("✓ Đã lấy CSRF token");

    // 2. POST username, password và CSRF token
    const loginData = new URLSearchParams({
      username,
      password,
      csrf_token: csrfToken,
    });

    const loginResponse = await axios.post(
      `${SUPERSET_URL}/login/`,
      loginData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: [...cookieMap.values()].join("; "),
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 10000,
      },
    );

    console.log("Login status:", loginResponse.status);
    console.log("Login redirect:", loginResponse.headers.location);

    // 3. Cập nhật cookie sau POST
    updateCookies(cookieMap, loginResponse.headers["set-cookie"]);

    const sessionCookie = [...cookieMap.values()].join("; ");

    // 4. Kiểm tra session thực sự đã đăng nhập chưa
    const user = await getCurrentUser(sessionCookie);

    console.log("✓ Đăng nhập Superset thành công:", user.username);

    return {
      sessionCookie,
      user: user.profile,
    };
  } catch (error) {
    console.error(
      "Lỗi đăng nhập Superset:",
      error.response?.status || error.message,
    );

    throw error;
  }
}

async function getCurrentUser(sessionCookie) {
  const response = await axios.get(`${SUPERSET_URL}/api/v1/me/`, {
    headers: {
      Cookie: sessionCookie,
    },
    timeout: 10000,
  });

  const result = response.data.result;
  const username = result?.username || result?.user?.username;

  if (!username) {
    throw new Error("Không xác định được Superset user");
  }

  return {
    username,
    profile: result,
  };
}

module.exports = {
  login,
  getCurrentUser,
};
