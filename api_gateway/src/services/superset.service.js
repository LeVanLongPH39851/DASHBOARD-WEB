const axios = require("axios");
const cheerio = require("cheerio");

const SUPERSET_URL = process.env.SUPERSET_URL;
const RETRY_ATTEMPTS = Number(process.env.RETRY_ATTEMPTS ?? 2);
const REQUEST_TIMEOUT = Number(process.env.REQUEST_TIMEOUT || 15000);

const RETRYABLE_STATUS = [502, 503, 504];
const RETRYABLE_ERRORS = [
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNABORTED",
  "EHOSTUNREACH",
  "EPIPE",
];

// Hàm gọi axios tới Superset có hỗ trợ Retry & Request Timeout
async function requestSuperset(config, allowRetry = true) {
  const maxAttempts = allowRetry ? Math.max(1, RETRY_ATTEMPTS + 1) : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await axios({
        timeout: REQUEST_TIMEOUT,
        ...config,
      });
    } catch (error) {
      const status = error.response?.status;
      const isTimeoutError =
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        error.message?.toLowerCase().includes("timeout");
      const isRetryableError =
        isTimeoutError || RETRYABLE_ERRORS.includes(error.code);
      const isRetryableStatus = RETRYABLE_STATUS.includes(status);

      if ((isRetryableError || isRetryableStatus) && attempt < maxAttempts) {
        console.warn(
          `[Superset Retry ${attempt}/${RETRY_ATTEMPTS}] ${config.method || "GET"} ${config.url} failed (${error.code || status}), retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
        continue;
      }

      throw error;
    }
  }
}

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
    const loginPageResponse = await requestSuperset({
      method: "GET",
      url: `${SUPERSET_URL}/login/`,
      maxRedirects: 5,
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

    const loginResponse = await requestSuperset({
      method: "POST",
      url: `${SUPERSET_URL}/login/`,
      data: loginData.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: [...cookieMap.values()].join("; "),
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    });

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
  const response = await requestSuperset({
    method: "GET",
    url: `${SUPERSET_URL}/api/v1/me/`,
    headers: {
      Cookie: sessionCookie,
    },
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

async function logout(sessionCookie) {
  return requestSuperset({
    method: "GET",
    url: `${SUPERSET_URL}/logout/`,
    headers: {
      Cookie: sessionCookie,
      Accept: "text/html,application/xhtml+xml",
    },
  });
}

async function getDashboards(sessionCookie) {
  const query =
    "(order_column:changed_on_delta_humanized,order_direction:desc,page:0,page_size:1000,select_columns:!(id,dashboard_title))";

  const response = await requestSuperset({
    method: "GET",
    url: `${SUPERSET_URL}/api/v1/dashboard/?q=${encodeURIComponent(query)}`,
    headers: {
      Cookie: sessionCookie,
      Accept: "application/json",
    },
  });

  return (response.data?.result || []).map((item) => ({
    id: item.id,
    dashboard_title: item.dashboard_title,
  }));
}

module.exports = {
  login,
  getCurrentUser,
  logout,
  getDashboards,
};
