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

    // Map<user_id, Set<AbortController>> để track và kill request theo user
    this.userControllers = new Map();

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

  // Tạo AbortController và đăng ký theo user_id
  _createController(user_id) {
    const controller = new AbortController();
    if (user_id) {
      if (!this.userControllers.has(user_id)) {
        this.userControllers.set(user_id, new Set());
      }
      this.userControllers.get(user_id).add(controller);
    }
    return controller;
  }

  // Xóa controller khỏi map sau khi request xong
  _removeController(user_id, controller) {
    if (user_id && this.userControllers.has(user_id)) {
      this.userControllers.get(user_id).delete(controller);
      if (this.userControllers.get(user_id).size === 0) {
        this.userControllers.delete(user_id);
      }
    }
  }

  // Kill tất cả request đang chạy của user_id
  killUser(user_id) {
    if (!user_id) return 0;
    const controllers = this.userControllers.get(user_id);
    if (!controllers || controllers.size === 0) {
      console.log(`ℹ️  Không có request nào đang chạy cho user_id: ${user_id}`);
      return 0;
    }
    const count = controllers.size;
    for (const ctrl of controllers) {
      ctrl.abort();
    }
    this.userControllers.delete(user_id);
    console.log(`🔪 Đã abort ${count} request của user_id: ${user_id}`);
    return count;
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

  async _doPost(url, payload, retryCount = 0, signal = null) {
    try {
      const { csrfToken, sessionCookie } = await this.getAuthCredentials();

      const fetchOptions = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-csrftoken': csrfToken,
          cookie: sessionCookie,
          referer: `${this.baseUrl}/superset/dashboard/`
        },
        body: JSON.stringify(payload)
      };
      if (signal) fetchOptions.signal = signal;

      const res = await fetch(url, fetchOptions);

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
          return this._doPost(url, payload, retryCount + 1, signal);
        }

        if (res.status === 429 && retryCount < 3) {
          console.log('⚠ Rate limit, chờ 2s...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this._doPost(url, payload, retryCount + 1, signal);
        }

        throw new Error(`API Error: ${res.status} - ${text}`);
      }

      return await res.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`🛑 POST request bị abort: ${url}`);
        throw error;
      }
      console.error('Lỗi khi gọi POST API:', error.message);
      throw error;
    }
  }

  async _doGet(url, retryCount = 0, signal = null) {
    try {
      const { csrfToken, sessionCookie } = await this.getAuthCredentials();

      const fetchOptions = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-csrftoken': csrfToken,
          cookie: sessionCookie
        }
      };
      if (signal) fetchOptions.signal = signal;

      const res = await fetch(url, fetchOptions);

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
          return this._doGet(url, retryCount + 1, signal);
        }

        if (res.status === 429 && retryCount < 3) {
          console.log('⚠ Rate limit GET, chờ 2s...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this._doGet(url, retryCount + 1, signal);
        }

        throw new Error(`API Error: ${res.status} - ${text}`);
      }

      return await res.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`🛑 GET request bị abort: ${url}`);
        throw error;
      }
      console.error('Lỗi khi gọi GET API:', error.message);
      throw error;
    }
  }

  async post(url, payload = {}, user_id = null) {
    const isHeavy = payload['form_data']?.heavy === true;
    const controller = this._createController(user_id);
    const { signal } = controller;

    const cleanup = () => this._removeController(user_id, controller);

    if (isHeavy) {
      return this.heavyQueue.add(async () => {
        console.log(`🐘 Heavy queue: start | waiting=${this.heavyQueue.size} running=${this.heavyQueue.pending}`);
        try {
          const result = await this._doPost(url, payload, 0, signal);
          console.log(`🐘 Heavy queue: done  | waiting=${this.heavyQueue.size} running=${this.heavyQueue.pending}`);
          return result;
        } finally {
          cleanup();
        }
      }, { signal });
    }

    return this.normalQueue.add(async () => {
      console.log(`⚡ Normal queue: start | waiting=${this.normalQueue.size} running=${this.normalQueue.pending}`);
      try {
        const result = await this._doPost(url, payload, 0, signal);
        console.log(`⚡ Normal queue: done  | waiting=${this.normalQueue.size} running=${this.normalQueue.pending}`);
        return result;
      } finally {
        cleanup();
      }
    }, { signal });
  }

  async get(url, options = {}, user_id = null) {
    const isHeavy = options['form_data']?.heavy === true;
    const controller = this._createController(user_id);
    const { signal } = controller;

    const cleanup = () => this._removeController(user_id, controller);

    if (isHeavy) {
      return this.heavyQueue.add(async () => {
        console.log(`🐘 Heavy GET: start | waiting=${this.heavyQueue.size} running=${this.heavyQueue.pending}`);
        try {
          const result = await this._doGet(url, 0, signal);
          console.log(`🐘 Heavy GET: done  | waiting=${this.heavyQueue.size} running=${this.heavyQueue.pending}`);
          return result;
        } finally {
          cleanup();
        }
      }, { signal });
    }

    return this.normalQueue.add(async () => {
      console.log(`⚡ Normal GET: start | waiting=${this.normalQueue.size} running=${this.normalQueue.pending}`);
      try {
        const result = await this._doGet(url, 0, signal);
        console.log(`⚡ Normal GET: done  | waiting=${this.normalQueue.size} running=${this.normalQueue.pending}`);
        return result;
      } finally {
        cleanup();
      }
    }, { signal });
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