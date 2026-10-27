import axios from "axios";

/**
 * Chatboy Accuracy v2.2 Client API
 * Endpoint: POST /api/v2/query
 * Base URL: Configurable via VITE_CHATBOT_API_URL or defaults to http://localhost:8010
 */

const CHATBOT_BASE_URL = import.meta.env.VITE_CHATBOT_API_URL || "";

export const chatbotClient = axios.create({
  baseURL: CHATBOT_BASE_URL,
  timeout: 60000, // 60s timeout as recommended by contract
  headers: {
    "Content-Type": "application/json",
  },
  // Ensure we receive envelope body even for HTTP 4xx / 5xx error responses
  validateStatus: () => true,
});

/**
 * Send a query or clarification to Chatboy v2.2
 * @param {object} payload - Either { type: "question", question: string }
 *                          or { type: "clarification", clarification_id: string, revision: 1|2, answers: Record<string, string> }
 * @returns {Promise<object>} ChatResponse envelope
 */
export async function sendChatbotQuery(payload) {
  try {
    const res = await chatbotClient.post("/api/v2/query", payload);

    if (res.data && typeof res.data === "object" && res.data.status) {
      return {
        ...res.data,
        http_status: res.status,
      };
    }

    // Response is not standard envelope (e.g. gateway error or raw HTML)
    return {
      request_id: "",
      status: "failed",
      intent: null,
      reply:
        res.data?.detail ||
        res.data?.message ||
        `Lỗi máy chủ (${res.status}): Không nhận được phản hồi hợp lệ.`,
      data: null,
      evidence: {},
      clarification: null,
      error: {
        code: "invalid_response",
        retryable: res.status >= 500,
      },
      meta: {},
      http_status: res.status,
    };
  } catch (err) {
    const isTimeout =
      err.code === "ECONNABORTED" || err.message?.includes("timeout");
    return {
      request_id: "",
      status: "failed",
      intent: null,
      reply: isTimeout
        ? "Quá thời gian xử lý yêu cầu (timeout 60s). Vui lòng thử lại."
        : "Không thể kết nối đến máy chủ Chatbot. Vui lòng kiểm tra lại dịch vụ backend.",
      data: null,
      evidence: {},
      clarification: null,
      error: {
        code: isTimeout ? "deadline_exceeded" : "network_error",
        retryable: true,
      },
      meta: {},
      http_status: 0,
    };
  }
}
