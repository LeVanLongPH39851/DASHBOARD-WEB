import React, { useState, useRef, useEffect, useCallback } from "react";
import axiosClient from "../../../api/axiosClient";

// ── Clarification form (inline sub-component) ──────────────
const ClarificationForm = ({ clarification, fieldErrors, onSubmit, disabled }) => {
  const [answers, setAnswers] = useState({});
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    setAnswers({});
    setLocalErrors({});
  }, [clarification?.id, clarification?.revision]);

  const handleSubmit = () => {
    // Validate required fields
    const errors = {};
    for (const field of clarification.fields) {
      if (!answers[field.id] || !answers[field.id].trim()) {
        errors[field.id] = "Vui lòng nhập thông tin";
      }
    }
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }
    onSubmit(answers);
  };

  if (!clarification) return null;

  return (
    <div className="mt-2 space-y-2">
      {clarification.fields.map((field) => {
        const error = localErrors[field.id] || fieldErrors?.[field.id];
        return (
          <div key={field.id}>
            <label className="block text-[12px] font-medium text-color-black-80 dark:text-color-white-70 mb-1">
              {field.label}
            </label>
            {field.input === "choice" ? (
              <select
                value={answers[field.id] || ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [field.id]: e.target.value }))}
                disabled={disabled}
                className="w-full px-3 py-2 text-[12px] rounded-lg border bg-background-light dark:bg-background-dark transition-colors duration-300 outline-none focus:border-teal-400"
                style={{
                  borderColor: error ? "#ef4444" : "rgba(0,0,0,0.1)",
                }}
              >
                <option value="">— Chọn —</option>
                {field.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={answers[field.id] || ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [field.id]: e.target.value }))}
                disabled={disabled}
                placeholder={field.label}
                className="w-full px-3 py-2 text-[12px] rounded-lg border bg-background-light dark:bg-background-dark transition-colors duration-300 outline-none focus:border-teal-400"
                style={{
                  borderColor: error ? "#ef4444" : "rgba(0,0,0,0.1)",
                }}
              />
            )}
            {error && (
              <p className="text-[11px] text-red-500 mt-0.5">{error}</p>
            )}
          </div>
        );
      })}
      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full py-2 text-[12px] font-medium text-white rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, rgba(47,196,198,1), rgba(91,214,216,1))",
        }}
      >
        Gửi
      </button>
    </div>
  );
};

// ── Data table (inline sub-component) ───────────────────────
const DataTable = ({ data }) => {
  if (!data || !data.columns || !data.rows || data.rows.length === 0) return null;

  // Truncate display if needed
  const maxRows = 50;
  const truncated = data.rows.length > maxRows;
  const displayRows = truncated ? data.rows.slice(0, maxRows) : data.rows;

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="bg-background-black-4 dark:bg-background-white-8">
            {data.columns.map((col) => (
              <th
                key={col.name}
                className="px-2 py-1.5 text-left font-medium text-color-black-80 dark:text-color-white-70 border-b border-border-black-10 dark:border-border-white-10 whitespace-nowrap"
              >
                {col.name}
                {col.unit ? ` (${col.unit})` : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, idx) => (
            <tr key={idx} className="hover:bg-background-black-2 dark:hover:bg-background-white-4 transition-colors">
              {data.columns.map((col) => {
                const val = row[col.name];
                const display = val === null || val === undefined ? "—" : String(val);
                return (
                  <td
                    key={col.name}
                    className="px-2 py-1.5 text-color-black-90 dark:text-color-white-80 border-b border-border-black-5 dark:border-border-white-5 whitespace-nowrap"
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {truncated && (
        <p className="text-[10px] text-color-black-50 dark:text-color-white-50 mt-1">
          Hiển thị {maxRows}/{data.rows.length} dòng
        </p>
      )}
    </div>
  );
};

// ── Main ChatBot component ───────────────────────────────────
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý AI Dashboard Rating. Bạn có thể hỏi về Rating, Lượt xem, Reach, Thời lượng của các kênh truyền hình.",
      sender: "bot",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const formatTime = () =>
    new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Process V2 response ──────────────────────────────────
  const processResponse = (data) => {
    const { status, reply, data: tableData, clarification, error, meta } = data;
    let botText = reply || "";

    // Add status-specific prefix
    if (status === "no_data") {
      botText = "📊 " + botText;
    } else if (status === "unsupported") {
      botText = "⚠️ " + botText;
    } else if (status === "answered" && meta?.data_status === "partial") {
      botText = "⚠️ Dữ liệu chưa đầy đủ\n\n" + botText;
    } else if (status === "answered" && meta?.data_status === "available") {
      botText = "✅ " + botText;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
        time: formatTime(),
        clarification: status === "needs_clarification" ? clarification : null,
        tableData: status === "answered" && tableData?.rows?.length > 0 ? tableData : null,
        status,
      },
    ]);
  };

  // ── Process error response ──────────────────────────────
  const processError = (err) => {
    let errorText = "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.";

    if (err.response?.data) {
      const { reply, error, clarification } = err.response.data;

      if (error?.code === "dependency_unavailable") {
        errorText = "Dịch vụ mô hình đang không khả dụng. Vui lòng thử lại sau.";
      } else if (error?.code === "deadline_exceeded") {
        errorText = "Hết thời gian xử lý. Vui lòng rút gọn câu hỏi và thử lại.";
      } else if (error?.code === "busy") {
        errorText = "Hệ thống đang bận. Vui lòng thử lại sau.";
      } else if (error?.code === "clarification_expired") {
        errorText = "Phiên bổ sung đã hết hạn. Vui lòng gửi lại câu hỏi mới.";
      } else if (error?.code === "clarification_limit") {
        errorText = "Đã hết lượt bổ sung. Vui lòng gửi lại câu hỏi đầy đủ hơn.";
      } else if (error?.code === "budget_exceeded") {
        errorText = "Đã hết giới hạn xử lý. Vui lòng diễn đạt lại câu hỏi ngắn gọn hơn.";
      } else if (error?.code === "resource_exceeded") {
        errorText = "Kết quả quá lớn. Vui lòng thu hẹp khoảng thời gian hoặc đối tượng.";
      } else if (reply) {
        errorText = reply;
      }

      // 422 with clarification = keep form for fixing
      if (clarification && err.response.status === 422) {
        return { keepForm: true, clarification, error, reply };
      }
    } else if (err.code === "ECONNABORTED") {
      errorText = "Hết thời gian kết nối. Vui lòng thử lại.";
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        text: errorText,
        sender: "bot",
        time: formatTime(),
        isError: true,
      },
    ]);
    return null;
  };

  // ── Send new question ────────────────────────────────────
  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        sender: "user",
        time: formatTime(),
      },
    ]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data } = await axiosClient.post("/api/v2/query", {
        type: "question",
        question: trimmed,
      });
      processResponse(data);
    } catch (err) {
      processError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Submit clarification form ─────────────────────────────
  const handleClarificationSubmit = async (messageId, clarification, answers) => {
    if (!clarification || isLoading) return;

    // Display user's answers
    const answerText = Object.entries(answers)
      .map(([fieldId, value]) => {
        const field = clarification.fields.find((f) => f.id === fieldId);
        return field ? `${field.label}: ${value}` : value;
      })
      .join("\n");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: answerText,
        sender: "user",
        time: formatTime(),
      },
    ]);

    // Remove form from previous bot message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, clarification: null } : msg
      )
    );

    setIsLoading(true);

    try {
      const { data } = await axiosClient.post("/api/v2/query", {
        type: "clarification",
        clarification_id: clarification.id,
        revision: clarification.revision,
        answers,
      });
      processResponse(data);
    } catch (err) {
      const result = processError(err);
      if (result?.keepForm) {
        // Restore form with field errors
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  clarification: result.clarification,
                  fieldErrors: (result.error?.field_errors || []).reduce((acc, fe) => {
                    acc[fe.field] = fe.message;
                    return acc;
                  }, {}),
                  text: result.reply || msg.text,
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ===== Floating Button ===== */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background:
            "linear-gradient(135deg, rgba(47,196,198,1) 0%, rgba(91,214,216,1) 100%)",
        }}
        title="Mở ChatBot"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          className="w-6 h-6 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          {isOpen ? (
            <path d="M6.225 4.811a1 1 0 0 0-1.414 1.414L10.586 12 4.81 17.775a1 1 0 1 0 1.414 1.414L12 13.414l5.775 5.775a1 1 0 0 0 1.414-1.414L13.414 12l5.775-5.775a1 1 0 0 0-1.414-1.414L12 10.586 6.225 4.81Z" />
          ) : (
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 20.97v-1.95a48.05 48.05 0 0 1-1.087-.128C2.905 18.636 1.5 17.09 1.5 15.27V5.468c0-1.866 1.369-3.477 3.291-3.727l.122-.083ZM15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
          )}
        </svg>
      </button>

      {/* ===== Chat Panel ===== */}
      <div
        className={`fixed bottom-24 right-6 z-[9998] w-[380px] max-md:w-[calc(100vw-48px)] max-md:right-6 flex flex-col rounded-2xl overflow-hidden transition-all duration-400 ease-out origin-bottom-right
          ${isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 translate-y-4 pointer-events-none"}`}
        style={{
          height: "520px",
          boxShadow:
            "0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(47,196,198,0.12)",
        }}
      >
        {/* ---- Header ---- */}
        <div
          className="flex items-center gap-3 px-5 py-4 text-white shrink-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(47,196,198,1) 0%, rgba(33,184,184,1) 50%, rgba(91,214,216,1) 100%)",
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-5 h-5"
            >
              <path d="M16.5 7.5h-9v9h9v-9Z" />
              <path
                fillRule="evenodd"
                d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px] leading-tight">Trợ lý AI</p>
            <p className="text-[12px] text-white/70 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              Đang hoạt động
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="white"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>
          </button>
        </div>

        {/* ---- Messages ---- */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background-light dark:bg-background-dark transition-colors duration-300">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed transition-colors duration-300 ${
                  msg.sender === "user"
                    ? "rounded-2xl rounded-br-md text-white"
                    : msg.isError
                    ? "rounded-2xl rounded-bl-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                    : "rounded-2xl rounded-bl-md bg-background-black-4 dark:bg-background-white-8 text-color-black-100 dark:text-color-white-90"
                }`}
                style={
                  msg.sender === "user"
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(47,196,198,1), rgba(91,214,216,1))",
                      }
                    : undefined
                }
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Data table */}
                {msg.tableData && <DataTable data={msg.tableData} />}

                {/* Clarification form */}
                {msg.clarification && (
                  <ClarificationForm
                    clarification={msg.clarification}
                    fieldErrors={msg.fieldErrors}
                    onSubmit={(answers) =>
                      handleClarificationSubmit(msg.id, msg.clarification, answers)
                    }
                    disabled={isLoading}
                  />
                )}

                <p
                  className={`text-[10px] mt-1 ${
                    msg.sender === "user"
                      ? "text-white/60 text-right"
                      : "text-color-black-50 dark:text-color-white-50"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-background-black-4 dark:bg-background-white-8 flex items-center gap-1.5">
                <span className="chatbot-dot" style={{ animationDelay: "0ms" }} />
                <span className="chatbot-dot" style={{ animationDelay: "150ms" }} />
                <span className="chatbot-dot" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ---- Input ---- */}
        <div className="px-4 py-3 bg-background-light dark:bg-background-dark border-t border-border-black-10 dark:border-border-white-20 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-2 bg-background-black-4 dark:bg-background-white-8 rounded-xl px-4 py-2 transition-colors duration-300">
            <input
              id="chatbot-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none text-[13px] text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 disabled:opacity-50 transition-colors duration-300"
            />
            <button
              id="chatbot-send"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shrink-0"
              style={{
                background:
                  inputValue.trim() && !isLoading
                    ? "linear-gradient(135deg, rgba(47,196,198,1), rgba(91,214,216,1))"
                    : "rgba(0,0,0,0.08)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={
                  inputValue.trim() && !isLoading ? "white" : "rgba(0,0,0,0.3)"
                }
                className="w-4 h-4"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Inline CSS for loading dots ===== */}
      <style>{`
        @keyframes chatbotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .chatbot-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(47,196,198,1);
          animation: chatbotBounce 1.2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default React.memo(ChatBot);
