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

    this.authPromise = null;

    // Queue nhẹ: chạy đồng thời
    this.normalQueue = new PQueue({
      concurrency: 50,
      interval: 1000,
      intervalCap: 50
    });

    // Queue nặng: chạy tuần tự
    this.heavyQueue = new PQueue({
      concurrency: 1,
      interval: 1000,
      intervalCap: 1
    });
  }

  async getAuthCredentials() {
    const now = Date.now();

    if (
      this.cachedCredentials.csrfToken &&
      this.cachedCredentials.sessionCookie &&
      this.cachedCredentials.expiresAt &&
      now < this.cachedCredentials.expiresAt
    ) {
      console.log('✓ Sử dụng credentials từ cache');
      return {
        csrfToken: this.cachedCredentials.csrfToken,
        sessionCookie: this.cachedCredentials.sessionCookie
      };
    }

    if (this.authPromise) {
      console.log('⏳ Đang đợi credentials được fetch...');
      return this.authPromise;
    }

    this.authPromise = this._fetchCredentials()
      .then(credentials => {
        this.authPromise = null;
        return credentials;
      })
      .catch(error => {
        this.authPromise = null;
        throw error;
      });

    return this.authPromise;
  }

  async _fetchCredentials() {
    console.log('→ Đang lấy credentials mới...');
    const now = Date.now();

    try {
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

      const loginData = new URLSearchParams({
        username: this.username,
        password: this.password,
        csrf_token: csrfToken
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

      const csrfResponse = await fetch(`${this.baseUrl}/api/v1/security/csrf_token/`, {
        method: 'GET',
        headers: {
          'Cookie': sessionCookie
        }
      });

      if (!csrfResponse.ok) {
        const text = await csrfResponse.text();
        throw new Error(`Không lấy được API CSRF token: ${csrfResponse.status} - ${text}`);
      }

      const csrfData = await csrfResponse.json();
      const finalCsrfToken = csrfData.result;

      if (!finalCsrfToken) {
        throw new Error('API không trả về CSRF token hợp lệ');
      }

      this.cachedCredentials = {
        csrfToken: finalCsrfToken,
        sessionCookie,
        expiresAt: now + (6 * 24 * 60 * 60 * 1000)
      };

      console.log('✓ Đã lấy credentials mới thành công');

      return {
        csrfToken: finalCsrfToken,
        sessionCookie
      };
    } catch (error) {
      console.error('Lỗi khi lấy credentials:', error);
      throw error;
    }
  }

  async _doPost(url, payload, retryCount = 0) {
    try {
      const { csrfToken, sessionCookie } = await this.getAuthCredentials();

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-csrftoken': csrfToken,
          cookie: sessionCookie,
          referer: `${this.baseUrl}/superset/dashboard/`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();

        if ((text.includes('CSRF') || text.includes('401') || res.status === 401) && retryCount < 2) {
          console.log('⚠ Token hết hạn, làm mới...');
          this.cachedCredentials = {
            csrfToken: null,
            sessionCookie: null,
            expiresAt: null
          };
          await new Promise(resolve => setTimeout(resolve, 500));
          return this._doPost(url, payload, retryCount + 1);
        }

        if (res.status === 429 && retryCount < 3) {
          console.log('⚠ Rate limit, chờ 2s...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this._doPost(url, payload, retryCount + 1);
        }

        throw new Error(`API Error: ${res.status} - ${text}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Lỗi khi gọi POST API:', error.message);
      throw error;
    }
  }

  async _doGet(url, retryCount = 0) {
    try {
      const { csrfToken, sessionCookie } = await this.getAuthCredentials();

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-csrftoken': csrfToken,
          cookie: sessionCookie
        }
      });

      if (!res.ok) {
        const text = await res.text();

        if ((text.includes('CSRF') || text.includes('401') || res.status === 401) && retryCount < 2) {
          console.log('⚠ Token GET hết hạn, làm mới...');
          this.cachedCredentials = {
            csrfToken: null,
            sessionCookie: null,
            expiresAt: null
          };
          await new Promise(resolve => setTimeout(resolve, 500));
          return this._doGet(url, retryCount + 1);
        }

        if (res.status === 429 && retryCount < 3) {
          console.log('⚠ Rate limit GET, chờ 2s...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this._doGet(url, retryCount + 1);
        }

        throw new Error(`API Error: ${res.status} - ${text}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Lỗi khi gọi GET API:', error.message);
      throw error;
    }
  }

  async post(url, payload = {}) {
    const isHeavy = payload['form_data']?.heavy === true;

    if (isHeavy) {
      return this.heavyQueue.add(async () => {
        console.log(`🐘 Heavy queue: start | waiting=${this.heavyQueue.size} running=${this.heavyQueue.pending}`);
        const result = await this._doPost(url, payload);
        console.log(`🐘 Heavy queue: done  | waiting=${this.heavyQueue.size} running=${this.heavyQueue.pending}`);
        return result;
      });
    }

    return this.normalQueue.add(async () => {
      console.log(`⚡ Normal queue: start | waiting=${this.normalQueue.size} running=${this.normalQueue.pending}`);
      const result = await this._doPost(url, payload);
      console.log(`⚡ Normal queue: done  | waiting=${this.normalQueue.size} running=${this.normalQueue.pending}`);
      return result;
    });
  }

  async get(url, options = {}) {
    const isHeavy = options['form_data']?.heavy === true;

    if (isHeavy) {
      return this.heavyQueue.add(async () => {
        console.log(`🐘 Heavy GET: start | waiting=${this.heavyQueue.size} running=${this.heavyQueue.pending}`);
        const result = await this._doGet(url);
        console.log(`🐘 Heavy GET: done  | waiting=${this.heavyQueue.size} running=${this.heavyQueue.pending}`);
        return result;
      });
    }

    return this.normalQueue.add(async () => {
      console.log(`⚡ Normal GET: start | waiting=${this.normalQueue.size} running=${this.normalQueue.pending}`);
      const result = await this._doGet(url);
      console.log(`⚡ Normal GET: done  | waiting=${this.normalQueue.size} running=${this.normalQueue.pending}`);
      return result;
    });
  }

  getQueueStats() {
    return {
      normal: {
        waiting: this.normalQueue.size,
        running: this.normalQueue.pending
      },
      heavy: {
        waiting: this.heavyQueue.size,
        running: this.heavyQueue.pending
      }
    };
  }

  async waitForAll() {
    await Promise.all([
      this.normalQueue.onIdle(),
      this.heavyQueue.onIdle()
    ]);
  }

  clearCache() {
    this.cachedCredentials = {
      csrfToken: null,
      sessionCookie: null,
      expiresAt: null
    };
    this.authPromise = null;
    console.log('✓ Đã xóa cache credentials');
  }

  async clearQueues() {
    this.normalQueue.clear();
    this.heavyQueue.clear();
    console.log('✓ Đã xóa toàn bộ task đang chờ trong queue');
  }
}

module.exports = SupersetClient;