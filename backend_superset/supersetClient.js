const cheerio = require('cheerio');
const PQueue = require('p-queue').default;

class SupersetClient {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
    this.cachedCredentials = {
      csrfToken: null,
      sessionCookie: null,
      expiresAt: null
    };
    
    // Promise lock để tránh race condition
    this.authPromise = null;
    
    // Rate limiter: max 40 requests/giây
    this.requestQueue = new PQueue({
      concurrency: 50,        // Max 50 requests đồng thời
      interval: 1000,        // 1 giây
      intervalCap: 50        // Max 50 requests/giây
    });
  }

  // Lấy credentials với Promise lock
  async getAuthCredentials() {
    const now = Date.now();
    
    // Kiểm tra cache còn hạn
    if (this.cachedCredentials.csrfToken &&
        this.cachedCredentials.sessionCookie &&
        this.cachedCredentials.expiresAt &&
        now < this.cachedCredentials.expiresAt) {
      console.log('✓ Sử dụng credentials từ cache');
      return {
        csrfToken: this.cachedCredentials.csrfToken,
        sessionCookie: this.cachedCredentials.sessionCookie
      };
    }

    // Nếu đang fetch credentials, đợi promise cũ
    if (this.authPromise) {
      console.log('⏳ Đang đợi credentials được fetch...');
      return this.authPromise;
    }

    // Tạo promise mới và lưu lại
    this.authPromise = this._fetchCredentials()
      .then(credentials => {
        this.authPromise = null; // Clear promise sau khi xong
        return credentials;
      })
      .catch(error => {
        this.authPromise = null; // Clear promise khi lỗi
        throw error;
      });

    return this.authPromise;
  }

  // Fetch credentials thực tế (private method)
  async _fetchCredentials() {
    console.log('→ Đang lấy credentials mới...');
    const now = Date.now();
    
    try {
      // Bước 1: GET trang login
      const loginPageResponse = await fetch(`${this.baseUrl}/login/`, {
        method: 'GET',
        redirect: 'follow'
      });
      const loginPageHtml = await loginPageResponse.text();
      const cookiesFromGet = loginPageResponse.headers.getSetCookie();
      const $ = cheerio.load(loginPageHtml);
      const csrfToken = $('input#csrf_token').val();

      if (!csrfToken) {
        throw new Error('Không tìm thấy CSRF token');
      }

      let sessionCookie = '';
      if (cookiesFromGet && cookiesFromGet.length > 0) {
        sessionCookie = cookiesFromGet.map(c => c.split(';')[0]).join('; ');
      }

      // Bước 2: POST login
      const loginData = new URLSearchParams({
        'username': this.username,
        'password': this.password,
        'csrf_token': csrfToken
      });

      const loginResponse = await fetch(`${this.baseUrl}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': sessionCookie
        },
        body: loginData.toString(),
        redirect: 'manual'
      });

      const cookiesFromPost = loginResponse.headers.getSetCookie();
      if (cookiesFromPost && cookiesFromPost.length > 0) {
        sessionCookie = cookiesFromPost.map(c => c.split(';')[0]).join('; ');
      }

      // Bước 3: Lấy CSRF token API
      const csrfResponse = await fetch(`${this.baseUrl}/api/v1/security/csrf_token/`, {
        method: 'GET',
        headers: {
          'Cookie': sessionCookie
        }
      });
      const csrfData = await csrfResponse.json();
      const finalCsrfToken = csrfData.result;

      // Cache credentials (6 ngày)
      this.cachedCredentials = {
        csrfToken: finalCsrfToken,
        sessionCookie: sessionCookie,
        expiresAt: now + (6 * 24 * 60 * 60 * 1000)
      };

      console.log('✓ Đã lấy credentials mới thành công');
      return {
        csrfToken: finalCsrfToken,
        sessionCookie: sessionCookie
      };
    } catch (error) {
      console.error('Lỗi khi lấy credentials:', error);
      throw error;
    }
  }

  // POST với rate limiting
  async post(url, payload) {
    return this.requestQueue.add(async () => {
      try {
        const { csrfToken, sessionCookie } = await this.getAuthCredentials();

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-csrftoken': csrfToken,
            'cookie': sessionCookie,
            'referer': `${this.baseUrl}/superset/dashboard/`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const text = await res.text();
          
          // Nếu lỗi 401/CSRF, xóa cache và retry SAU 1 DELAY
          if (text.includes('CSRF') || text.includes('401') || res.status === 401) {
            console.log('⚠ Token hết hạn, làm mới...');
            this.cachedCredentials = { csrfToken: null, sessionCookie: null, expiresAt: null };
            
            // Delay 500ms trước khi retry để tránh spam
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.post(url, payload);
          }
          
          // Nếu lỗi 429, delay lâu hơn
          if (res.status === 429) {
            console.log('⚠ Rate limit, chờ 2s...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.post(url, payload);
          }

          throw new Error(`API Error: ${res.status} - ${text}`);
        }

        return await res.json();
      } catch (error) {
        console.error('Lỗi khi gọi API:', error.message);
        throw error;
      }
    });
  }

  // GET với rate limiting
  async get(url) {
    return this.requestQueue.add(async () => {
      try {
        const { csrfToken, sessionCookie } = await this.getAuthCredentials();

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-csrftoken': csrfToken,
            'cookie': sessionCookie
          }
        });

        if (!res.ok) {
          const text = await res.text();
          
          if (res.status === 429) {
            console.log('⚠ Rate limit, chờ 2s...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.get(url);
          }
          
          throw new Error(`API Error: ${res.status} - ${text}`);
        }

        return await res.json();
      } catch (error) {
        console.error('Lỗi khi gọi API:', error.message);
        throw error;
      }
    });
  }

  // Xóa cache
  clearCache() {
    this.cachedCredentials = {
      csrfToken: null,
      sessionCookie: null,
      expiresAt: null
    };
    this.authPromise = null;
    console.log('✓ Đã xóa cache credentials');
  }
}

module.exports = SupersetClient;
