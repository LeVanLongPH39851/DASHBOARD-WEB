const cheerio = require('cheerio');

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
  }

  // Lấy credentials (tự động cache)
  async getAuthCredentials() {
    const now = Date.now();
    
    // Kiểm tra cache
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

    console.log('→ Đang lấy credentials mới...');
    
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

  // Hàm gọi API chính - chỉ cần truyền url và payload
  async post(url, payload) {
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
        
        // Nếu lỗi CSRF/401, xóa cache và thử lại 1 lần
        if (text.includes('CSRF') || text.includes('401') || res.status === 401) {
          console.log('⚠ Token hết hạn, làm mới và thử lại...');
          this.cachedCredentials = { csrfToken: null, sessionCookie: null, expiresAt: null };
          return this.post(url, payload); // Retry
        }
        
        throw new Error(`API Error: ${res.status} - ${text}`);
      }

      return await res.json();

    } catch (error) {
      console.error('Lỗi khi gọi API:', error.message);
      throw error;
    }
  }

  // Hàm GET nếu cần
  async get(url) {
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
        throw new Error(`API Error: ${res.status} - ${text}`);
      }

      return await res.json();

    } catch (error) {
      console.error('Lỗi khi gọi API:', error.message);
      throw error;
    }
  }

  // Xóa cache (logout)
  clearCache() {
    this.cachedCredentials = {
      csrfToken: null,
      sessionCookie: null,
      expiresAt: null
    };
    console.log('✓ Đã xóa cache credentials');
  }
}

module.exports = SupersetClient;