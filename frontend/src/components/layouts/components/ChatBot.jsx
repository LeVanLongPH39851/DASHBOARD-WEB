import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { sendChatbotQuery } from "../../../api/chatbotApi";

/* ─────────────────────────────────────────
   SVG Icons
───────────────────────────────────────── */
const IconBot = () => (
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
);

const IconSend = ({ color = "white" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    className="w-4 h-4"
  >
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const IconChat = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="white"
    className="w-6 h-6"
  >
    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 20.97v-1.95a48.05 48.05 0 0 1-1.087-.128C2.905 18.636 1.5 17.09 1.5 15.27V5.468c0-1.866 1.369-3.477 3.291-3.727l.122-.083ZM15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
  </svg>
);

const IconRefresh = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-3.5 h-3.5"
  >
    <path
      fillRule="evenodd"
      d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0-.75.75v4.482a.75.75 0 0 0 1.5 0v-2.078l.457.457a7 7 0 0 0 11.89-3.328.75.75 0 0 0-1.535-.456ZM4.688 8.576a5.5 5.5 0 0 1 9.201-2.466l.312.311H11.77a.75.75 0 0 0 0 1.5h4.482a.75.75 0 0 0 .75-.75V2.689a.75.75 0 0 0-1.5 0v2.078l-.457-.457A7 7 0 0 0 3.153 7.638a.75.75 0 0 0 1.535.456Z"
      clipRule="evenodd"
    />
  </svg>
);

/* ─────────────────────────────────────────
   Markdown Text Renderer (Safe, Lightweight)
───────────────────────────────────────── */
const FormattedReply = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");

  const parseLine = (text) => {
    // Parse bold syntax **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={idx}
            className="font-semibold text-color-black-100 dark:text-color-white-100"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-[12px] opacity-60 leading-tight select-none mt-1">
                •
              </span>
              <span className="flex-1">{parseLine(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <p key={idx}>{parseLine(line)}</p>;
      })}
    </div>
  );
};

/* ─────────────────────────────────────────
   Clarification Countdown Component
───────────────────────────────────────── */
const ClarificationCountdown = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;

    const calcTime = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Đã hết hạn");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs < 10 ? "0" : ""}${secs}s`);
    };

    calcTime();
    const timer = setInterval(calcTime, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!timeLeft) return null;

  const isExpired = timeLeft === "Đã hết hạn";

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
        isExpired
          ? "bg-red-500/15 text-red-500 border border-red-500/20"
          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isExpired ? "bg-red-500" : "bg-amber-500 animate-pulse"}`}
      />
      {isExpired ? "Hết hạn phản hồi" : `Còn ${timeLeft}`}
    </span>
  );
};

/* ─────────────────────────────────────────
   Data Table Component
───────────────────────────────────────── */
const DataTable = ({ data, meta }) => {
  if (!data || !data.columns || !data.rows || data.rows.length === 0) {
    return null;
  }

  const { columns, rows, row_count } = data;

  const formatCellValue = (val, type, unit) => {
    if (val === null || val === undefined || val === "") {
      return (
        <span className="opacity-40 italic font-mono">Chưa có dữ liệu</span>
      );
    }
    if (type === "integer" || type === "decimal") {
      let str =
        typeof val === "number" ? val.toLocaleString("vi-VN") : String(val);
      return (
        <span className="font-mono font-medium">
          {str}{" "}
          {unit ? (
            <span className="text-[10px] font-normal opacity-70 ml-0.5">
              {unit}
            </span>
          ) : null}
        </span>
      );
    }
    return String(val);
  };

  return (
    <div className="mt-2.5 rounded-xl border border-border-black-10 dark:border-border-white-20 overflow-hidden bg-background-light dark:bg-background-dark shadow-sm">
      <div className="overflow-x-auto max-h-56 scrollbar-thin">
        <table className="w-full text-[12px] border-collapse text-left">
          <thead>
            <tr className="bg-background-black-4 dark:bg-background-white-8 text-color-black-100 dark:text-color-white-90 border-b border-border-black-10 dark:border-border-white-20">
              {columns.map((col, idx) => (
                <th
                  key={col.name || idx}
                  className="px-3 py-2 font-semibold text-[11px] whitespace-nowrap"
                >
                  <span>{col.name}</span>
                  {col.unit && (
                    <span className="text-[10px] opacity-60 ml-1 font-normal">
                      ({col.unit})
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-black-10 dark:divide-border-white-10">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-background-black-4 dark:hover:bg-background-white-4 transition-colors"
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={col.name || cIdx}
                    className="px-3 py-1.5 whitespace-nowrap text-color-black-90 dark:text-color-white-80"
                  >
                    {formatCellValue(row[col.name], col.type, col.unit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-1.5 text-[10px] flex items-center justify-between text-color-black-50 dark:text-color-white-50 bg-background-black-4/50 dark:bg-background-white-4/50 border-t border-border-black-10 dark:border-border-white-10">
        <span>Tổng {row_count || rows.length} dòng</span>
        {meta?.display_truncated && (
          <span className="text-amber-500 font-medium">
            Giới hạn hiển thị {meta.display_limit || 100} kết quả
          </span>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Clarification Form Component
───────────────────────────────────────── */
const ClarificationForm = ({
  clarification,
  error,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [textInputs, setTextInputs] = useState({});
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    // Reset inputs when clarification ID or revision changes
    setSelectedOptions({});
    setTextInputs({});
    setLocalErrors({});
  }, [clarification?.id, clarification?.revision]);

  const fieldErrorsMap = useMemo(() => {
    const map = {};
    if (error?.field_errors && Array.isArray(error.field_errors)) {
      error.field_errors.forEach((fe) => {
        if (fe.field) map[fe.field] = fe.message;
      });
    }
    return map;
  }, [error]);

  if (
    !clarification ||
    !clarification.fields ||
    clarification.fields.length === 0
  ) {
    return null;
  }

  const handleSelectOption = (fieldId, optId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId] === optId ? null : optId,
    }));
    if (localErrors[fieldId]) {
      setLocalErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleTextChange = (fieldId, val) => {
    setTextInputs((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
    if (localErrors[fieldId]) {
      setLocalErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = {};
    const finalAnswers = {};
    const displayLabels = {};

    clarification.fields.forEach((field) => {
      const hasOptions = field.options && field.options.length > 0;
      const selectedOptId = selectedOptions[field.id];
      const customText = textInputs[field.id]?.trim();

      if (hasOptions) {
        if (selectedOptId) {
          finalAnswers[field.id] = selectedOptId;
          const matchingOpt = field.options?.find(
            (o) => o.id === selectedOptId,
          );
          displayLabels[field.id] = matchingOpt
            ? matchingOpt.label
            : selectedOptId;
        } else {
          errors[field.id] = `Vui lòng chọn ${field.label.toLowerCase()}`;
        }
      } else {
        if (customText) {
          finalAnswers[field.id] = customText;
          displayLabels[field.id] = customText;
        } else {
          errors[field.id] = `Vui lòng nhập ${field.label.toLowerCase()}`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    // In ra các option người dùng chọn / đã nhập
    const displayText = Object.values(displayLabels).join(" · ");

    onSubmit(
      {
        type: "clarification",
        clarification_id: clarification.id,
        revision: clarification.revision,
        answers: finalAnswers,
      },
      displayText,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-900/10 transition-all text-left space-y-3"
    >
      <div className="flex items-center justify-between pb-2 border-b border-teal-500/20">
        <span className="text-[12px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          Bổ sung thông tin
        </span>
        <ClarificationCountdown expiresAt={clarification.expires_at} />
      </div>

      <div className="space-y-3.5">
        {clarification.fields.map((field) => {
          const err = localErrors[field.id] || fieldErrorsMap[field.id];
          const hasOptions = field.options && field.options.length > 0;
          const selectedOptId = selectedOptions[field.id];
          const customText = textInputs[field.id] || "";
          const selectedOpt = hasOptions
            ? field.options.find((o) => o.id === selectedOptId)
            : null;

          return (
            <div key={field.id} className="space-y-1.5">
              <label className="text-[11px] font-medium text-color-black-90 dark:text-color-white-90 block">
                {field.label} <span className="text-red-500">*</span>
              </label>

              {/* Nếu có option thì chỉ hiển thị chọn option, không có ô nhập text */}
              {hasOptions ? (
                <div className="flex flex-wrap gap-1.5">
                  {field.options.map((opt) => {
                    const isSelected = selectedOptId === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => handleSelectOption(field.id, opt.id)}
                        className={`text-[12px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-500 text-white border-teal-500 shadow-sm font-medium scale-[1.02]"
                            : "bg-background-light dark:bg-background-dark border-border-black-10 dark:border-border-white-20 text-color-black-100 dark:text-color-white-90 hover:border-teal-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Trường không có option (như time_range) thì hiển thị ô nhập text */
                <div className="relative">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => handleTextChange(field.id, e.target.value)}
                    placeholder={`Nhập ${field.label.toLowerCase()}...`}
                    className={`w-full text-[12px] px-3 py-1.5 rounded-lg border bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90 outline-none transition-all ${
                      err
                        ? "border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-border-black-10 dark:border-border-white-20 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    }`}
                  />
                </div>
              )}

              {err && (
                <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1 mt-0.5">
                  <span>⚠</span> {err}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-[11px] px-3 py-1.5 rounded-lg text-color-black-50 dark:text-color-white-50 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            Bỏ qua
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-[11px] font-medium px-4 py-1.5 rounded-lg text-white transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98 disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(47,196,198,1), rgba(91,214,216,1))",
          }}
        >
          {isSubmitting ? "Đang gửi..." : "Gửi xác nhận"}
        </button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────
   Message Bubble Component
───────────────────────────────────────── */
const MessageBubble = ({
  msg,
  isLatestPendingClarification,
  onClarifySubmit,
  onClarifyCancel,
  onRetry,
  isSubmittingClarification,
}) => {
  const isUser = msg.sender === "user";

  const isPartial = msg.meta?.data_status === "partial";
  const isNoData = msg.status === "no_data";
  const isUnsupported = msg.status === "unsupported";
  const hasError = msg.error && msg.status === "failed";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {/* Bot avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 self-end mb-1"
          style={{
            background:
              "linear-gradient(135deg, rgba(47,196,198,1), rgba(91,214,216,1))",
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
            <path d="M16.5 7.5h-9v9h9v-9Z" />
            <path
              fillRule="evenodd"
              d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed transition-colors duration-300 ${
          isUser
            ? "rounded-2xl rounded-br-[4px] text-white"
            : "rounded-2xl rounded-bl-[4px] bg-background-black-4 dark:bg-background-white-8 text-color-black-100 dark:text-color-white-90 border border-border-black-10 dark:border-border-white-10"
        }`}
        style={
          isUser
            ? {
                background:
                  "linear-gradient(135deg, rgba(47,196,198,1), rgba(91,214,216,1))",
              }
            : undefined
        }
      >
        {/* Status Badges */}
        {!isUser && (isPartial || isNoData || isUnsupported) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {isPartial && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                <span>⚠️</span> Dữ liệu chưa đầy đủ
              </span>
            )}
            {isNoData && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 inline-flex items-center gap-1">
                <span>ℹ️</span> Chưa có dữ liệu
              </span>
            )}
            {isUnsupported && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-flex items-center gap-1">
                <span>💡</span> Ngoài phạm vi / chưa hỗ trợ
              </span>
            )}
          </div>
        )}

        {msg.contextQuestion && (
          <div
            className={`mb-2.5 rounded-lg border-l-2 px-2.5 py-2 text-[11px] ${
              isUser
                ? "border-white/70 bg-white/10"
                : "border-teal-500/80 bg-black/5 dark:bg-white/5"
            }`}
          >
            <div
              className={`font-medium text-[10px] uppercase tracking-wide ${
                isUser
                  ? "text-white/75"
                  : "text-teal-600 dark:text-teal-400"
              }`}
            >
              Câu hỏi của bạn
            </div>
            <p
              className={`mt-1 whitespace-pre-wrap ${
                isUser
                  ? "text-white"
                  : "text-color-black-100 dark:text-color-white-90"
              }`}
            >
              “{msg.contextQuestion}”
            </p>
          </div>
        )}

        {/* Message Content */}
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.text}</p>
        ) : (
          <FormattedReply content={msg.text} />
        )}

        {/* Data Table */}
        {!isUser && msg.data && <DataTable data={msg.data} meta={msg.meta} />}

        {/* Clarification Form (Interactive if latest pending, or read-only summary) */}
        {!isUser && msg.clarification && isLatestPendingClarification && (
          <ClarificationForm
            clarification={msg.clarification}
            error={msg.error}
            onSubmit={onClarifySubmit}
            onCancel={onClarifyCancel}
            isSubmitting={isSubmittingClarification}
          />
        )}

        {/* Error Details & Retry */}
        {!isUser && hasError && (
          <div className="mt-2.5 p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider">
                Mã lỗi: {msg.error.code}
              </span>
              {msg.error.retryable && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(msg.submittedPayload)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500 text-white font-medium hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <IconRefresh />
                  Thử lại
                </button>
              )}
            </div>
            {msg.request_id && (
              <p className="opacity-75 font-mono text-[10px]">
                Request ID: {msg.request_id}
              </p>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center justify-between mt-1.5 text-[10px] select-none">
          <span
            className={
              isUser
                ? "text-white/60 ml-auto"
                : "text-color-black-50 dark:text-color-white-50"
            }
          >
            {msg.time}
          </span>
          {!isUser && msg.meta?.replayed && (
            <span className="text-teal-500 text-[9px] font-medium ml-2">
              (Từ kết quả đã lưu)
            </span>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-2 self-end mb-1 bg-background-black-4 dark:bg-background-white-8 border border-border-black-10 dark:border-border-white-10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="w-3.5 h-3.5 text-color-black-50 dark:text-color-white-50"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main ChatBot Component
───────────────────────────────────────── */
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "initial",
      text: 'Xin chào! Tôi là trợ lý AI phân tích số liệu Dashboard Rating. Bạn có thể hỏi: "Lượt xem VTV1 ngày hôm qua", "Rating% là gì?", hoặc tra cứu chỉ số kênh.',
      sender: "bot",
      status: "answered",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeClarificationId, setActiveClarificationId] = useState(null);
  const [activeClarificationQuestion, setActiveClarificationQuestion] =
    useState(null);

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

  // Execute request against Chatboy Accuracy v2.2
  const executeQuery = async (payload, isClarification = false) => {
    setIsLoading(true);
    const contextQuestion =
      payload.type === "question"
        ? payload.question
        : activeClarificationQuestion;

    try {
      const response = await sendChatbotQuery(payload);

      const botMsg = {
        id: response.request_id || `bot-${Date.now()}`,
        request_id: response.request_id,
        text:
          response.reply ||
          (response.status === "answered"
            ? "Đã tìm thấy kết quả."
            : "Không có phản hồi."),
        sender: "bot",
        status: response.status,
        intent: response.intent,
        data: response.data,
        evidence: response.evidence,
        clarification: response.clarification,
        error: response.error,
        meta: response.meta,
        contextQuestion,
        submittedPayload: payload,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Contract: if needs_clarification or (failed + invalid_input with clarification)
      if (
        (response.status === "needs_clarification" ||
          (response.status === "failed" &&
            response.error?.code === "invalid_input")) &&
        response.clarification
      ) {
        setActiveClarificationId(response.clarification.id);
        setActiveClarificationQuestion(contextQuestion);
      } else {
        // Closed / completed
        setActiveClarificationId(null);
        setActiveClarificationQuestion(null);
      }

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          text: "Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại dịch vụ backend.",
          sender: "bot",
          status: "failed",
          error: { code: "network_error", retryable: true },
          contextQuestion,
          submittedPayload: payload,
          time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle send new question
  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    // Reset active clarification if user starts a new question
    setActiveClarificationId(null);
    setActiveClarificationQuestion(null);

    const userMsg = {
      id: `user-${Date.now()}`,
      text: trimmed,
      sender: "user",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Contract: type="question", question <= 4000 chars, no extra fields
    const payload = {
      type: "question",
      question: trimmed.slice(0, 4000),
    };

    await executeQuery(payload);
  };

  // Handle clarification response submission
  const handleClarifySubmit = async (clarificationPayload, displayText) => {
    // In ra tin nhắn của người dùng là cái option người ta chọn
    const userMsg = {
      id: `user-clarify-${Date.now()}`,
      text:
        displayText ||
        `Bổ sung: ${Object.values(clarificationPayload.answers).join(", ")}`,
      sender: "user",
      contextQuestion: activeClarificationQuestion,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);

    await executeQuery(clarificationPayload, true);
  };

  const handleClarifyCancel = () => {
    setActiveClarificationId(null);
    setActiveClarificationQuestion(null);
  };

  const handleRetry = (payloadToRetry) => {
    if (!payloadToRetry) return;
    executeQuery(payloadToRetry);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Toggle Button ── */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background:
            "linear-gradient(135deg, rgba(47,196,198,1) 0%, rgba(91,214,216,1) 100%)",
          boxShadow:
            "0 8px 32px rgba(47,196,198,0.45), 0 2px 8px rgba(0,0,0,0.15)",
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? "scale(0.7)" : "scale(1)",
          pointerEvents: isOpen ? "none" : "auto",
          transition:
            "opacity 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1)",
        }}
        title="Mở Trợ lý AI"
      >
        <span className="flex items-center justify-center">
          <IconChat />
        </span>
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white animate-pulse" />
      </button>

      {/* ── Chat Panel ── */}
      <div
        id="chatbot-panel"
        className="fixed right-6 z-[9998] flex flex-col rounded-2xl overflow-hidden origin-bottom-right"
        style={{
          bottom: "24px",
          width: "440px",
          maxWidth: "calc(100vw - 32px)",
          height: "620px",
          maxHeight: "calc(100vh - 48px)",
          boxShadow:
            "0 16px 64px rgba(0,0,0,0.22), 0 4px 24px rgba(47,196,198,0.18)",
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "scale(1) translateY(0)"
            : "scale(0.92) translateY(16px)",
          pointerEvents: isOpen ? "auto" : "none",
          transition:
            "opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-4 py-3 text-white shrink-0 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, rgba(33,150,150,1) 0%, rgba(47,196,198,1) 50%, rgba(91,214,216,1) 100%)",
          }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
            <IconBot />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[14px] leading-tight truncate">
                Trợ lý AI Accuracy v2.2
              </p>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 font-mono">
                API v2
              </span>
            </div>
            <p className="text-[11px] text-white/80 flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              Sẵn sàng phân tích số liệu
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors duration-200 cursor-pointer"
            title="Thu nhỏ"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2.5}
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>
          </button>
        </div>

        {/* ── Messages List ── */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 bg-background-light dark:bg-background-dark transition-colors duration-300">
          {/* Date separator */}
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="flex-1 h-px bg-border-black-10 dark:bg-border-white-20" />
            <span className="text-[10px] text-color-black-50 dark:text-color-white-50 font-medium whitespace-nowrap">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
            <div className="flex-1 h-px bg-border-black-10 dark:bg-border-white-20" />
          </div>

          {messages.map((msg, index) => {
            const isLatestPending =
              msg.clarification &&
              msg.clarification.id === activeClarificationId &&
              index === messages.length - 1;

            return (
              <MessageBubble
                key={msg.id || index}
                msg={msg}
                isLatestPendingClarification={isLatestPending}
                onClarifySubmit={handleClarifySubmit}
                onClarifyCancel={handleClarifyCancel}
                onRetry={handleRetry}
                isSubmittingClarification={isLoading}
              />
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start items-end gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(47,196,198,1), rgba(91,214,216,1))",
                }}
              >
                <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                  <path d="M16.5 7.5h-9v9h9v-9Z" />
                  <path
                    fillRule="evenodd"
                    d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-[4px] bg-background-black-4 dark:bg-background-white-8 border border-border-black-10 dark:border-border-white-10 flex items-center gap-1.5">
                <span
                  className="chatbot-dot"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="chatbot-dot"
                  style={{ animationDelay: "160ms" }}
                />
                <span
                  className="chatbot-dot"
                  style={{ animationDelay: "320ms" }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Box ── */}
        <div className="px-3 pb-3 pt-2 bg-background-light dark:bg-background-dark border-t border-border-black-10 dark:border-border-white-20 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 chatbot-input-wrap transition-all duration-200">
            <textarea
              id="chatbot-input"
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 96) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                activeClarificationId
                  ? "Nhập câu hỏi mới để bắt đầu lượt khác..."
                  : "Hỏi về số liệu (VD: Lượt xem VTV1 ngày hôm qua)..."
              }
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none text-[13px] text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 disabled:opacity-50 transition-colors duration-300 resize-none overflow-hidden leading-relaxed"
              style={{ minHeight: "22px", maxHeight: "96px" }}
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
                    : "rgba(0,0,0,0.07)",
              }}
            >
              <IconSend
                color={
                  inputValue.trim() && !isLoading ? "white" : "rgba(0,0,0,0.3)"
                }
              />
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-color-black-50 dark:text-color-white-50 mt-1.5 px-1">
            <span>Enter để gửi · Shift+Enter xuống dòng</span>
            <span className="font-mono">{inputValue.length}/4000</span>
          </div>
        </div>
      </div>

      {/* ── Inline styles ── */}
      <style>{`
        @keyframes chatbotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .chatbot-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(47,196,198,1);
          animation: chatbotBounce 1.3s ease-in-out infinite;
        }
        .chatbot-input-wrap {
          background: rgba(0,0,0,0.04);
        }
        .chatbot-input-wrap:focus-within {
          box-shadow: 0 0 0 2px rgba(47,196,198,0.35);
        }
        html.dark .chatbot-input-wrap {
          background: rgba(255,255,255,0.07);
        }
        #chatbot-input::-webkit-scrollbar { width: 3px; }
        #chatbot-input::-webkit-scrollbar-thumb {
          background: rgba(47,196,198,0.3);
          border-radius: 50px;
        }
      `}</style>
    </>
  );
};

export default ChatBot;
