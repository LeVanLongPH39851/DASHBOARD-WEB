import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "../components/layouts/headers/Header";
import Footer from "../components/layouts/footers/Footer";
import Loading from "../components/commons/Loading";
import iconSearch from "../assets/icon_search.png";
import iconSearchDark from "../assets/icon_search_dark.png";
import {
  DashboardFilterProvider,
  useDarkMode,
} from "../context/DashboardFilterContext";
import { getDashboards, getMe } from "../services/authService";

// Bộ bảng màu đặc trưng theo biến theme của VTV Ratings (index.css)
const CARD_THEMES = [
  {
    name: "cyan",
    bar: "from-[#20A7C9] to-[#2fc4c6]",
    iconBg: "bg-background-ave-reach dark:bg-[#21b8b8]/20",
    iconText: "text-color-ave-reach dark:text-[#5bd6d8]",
    badge:
      "bg-background-ave-reach text-color-ave-reach border-[#21b8b8]/25 dark:bg-[#21b8b8]/15 dark:text-[#5bd6d8]",
    hoverBorder: "hover:border-[#20A7C9] dark:hover:border-[#5bd6d8]",
    hoverShadow: "hover:shadow-[0_8px_28px_-6px_rgba(32,167,201,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#20A7C9] group-hover:to-[#2fc4c6] group-hover:text-white group-hover:border-transparent",
  },
  {
    name: "purple",
    bar: "from-[#7367f0] to-[#9e95f5]",
    iconBg: "bg-background-rating-percent dark:bg-[#7367f0]/20",
    iconText: "text-color-rating-percent dark:text-[#a59ff8]",
    badge:
      "bg-background-rating-percent text-color-rating-percent border-[#7367f0]/25 dark:bg-[#7367f0]/15 dark:text-[#a59ff8]",
    hoverBorder: "hover:border-[#7367f0] dark:hover:border-[#a59ff8]",
    hoverShadow: "hover:shadow-[0_8px_28px_-6px_rgba(115,103,240,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#7367f0] group-hover:to-[#9e95f5] group-hover:text-white group-hover:border-transparent",
  },
  {
    name: "orange",
    bar: "from-[#f2994a] to-[#f7b731]",
    iconBg: "bg-background-ave-reach-percent dark:bg-[#f2994a]/20",
    iconText: "text-color-ave-reach-percent dark:text-[#f6b26b]",
    badge:
      "bg-background-ave-reach-percent text-color-ave-reach-percent border-[#f2994a]/25 dark:bg-[#f2994a]/15 dark:text-[#f6b26b]",
    hoverBorder: "hover:border-[#f2994a] dark:hover:border-[#f6b26b]",
    hoverShadow: "hover:shadow-[0_8px_28px_-6px_rgba(242,153,74,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#f2994a] group-hover:to-[#f7b731] group-hover:text-white group-hover:border-transparent",
  },
  {
    name: "coral",
    bar: "from-[#eb5757] to-[#ff7676]",
    iconBg: "bg-background-rating dark:bg-[#eb5757]/20",
    iconText: "text-color-rating dark:text-[#ff8585]",
    badge:
      "bg-background-rating text-color-rating border-[#eb5757]/25 dark:bg-[#eb5757]/15 dark:text-[#ff8585]",
    hoverBorder: "hover:border-[#eb5757] dark:hover:border-[#ff8585]",
    hoverShadow: "hover:shadow-[0_8px_28px_-6px_rgba(235,87,87,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#eb5757] group-hover:to-[#ff7676] group-hover:text-white group-hover:border-transparent",
  },
  {
    name: "emerald",
    bar: "from-[#0cb7a9] to-[#2ed8b6]",
    iconBg: "bg-background-succes-type-1 dark:bg-[#0cb7a9]/20",
    iconText: "text-color-succes-type-1 dark:text-color-succes-type-1-dark",
    badge:
      "bg-background-succes-type-1 text-color-succes-type-1 border-[#0cb7a9]/25 dark:bg-[#0cb7a9]/15 dark:text-color-succes-type-1-dark",
    hoverBorder: "hover:border-[#0cb7a9] dark:hover:border-[#86e1e3]",
    hoverShadow: "hover:shadow-[0_8px_28px_-6px_rgba(12,183,169,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#0cb7a9] group-hover:to-[#2ed8b6] group-hover:text-white group-hover:border-transparent",
  },
];

const CHART_ICONS = [
  (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 20V10M12 20V4M6 20v-6"
      />
    </svg>
  ),
  (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.21 15.89A10 10 0 1 1 8 2.83"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 12A10 10 0 0 0 12 2v10z"
      />
    </svg>
  ),
  (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <polyline
        strokeLinecap="round"
        strokeLinejoin="round"
        points="23 6 13.5 15.5 8.5 10.5 1 18"
      />
      <polyline
        strokeLinecap="round"
        strokeLinejoin="round"
        points="17 6 23 6 23 12"
      />
    </svg>
  ),
  (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <polyline
        strokeLinecap="round"
        strokeLinejoin="round"
        points="22 12 18 12 15 21 9 3 6 12 2 12"
      />
    </svg>
  ),
  (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
];

const DashboardListContent = () => {
  const { value: darkMode } = useDarkMode();

  const [user, setUser] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chỉ giữ Filter theo Name và Sort theo Name ở Frontend
  const [searchName, setSearchName] = useState("");
  const [sortOrder, setSortOrder] = useState("default"); // "default" | "asc" | "desc"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [meRes, dashRes] = await Promise.all([
          getMe().catch(() => null),
          getDashboards(),
        ]);

        if (!isMounted) return;

        if (meRes?.user) {
          setUser(meRes.user);
        }

        const mappedList = dashRes?.dashboards || [];

        setDashboards(mappedList);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.response?.data?.message ||
            err.message ||
            "Không thể tải danh sách Dashboard",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Lọc và sắp xếp theo tên hoàn toàn trên Frontend
  const displayedDashboards = useMemo(() => {
    const keyword = searchName.trim().toLowerCase();

    const filtered = dashboards.filter((item) => {
      const title = (item.dashboard_title || "").toLowerCase();
      return !keyword || title.includes(keyword);
    });

    if (sortOrder === "default") {
      return filtered;
    }

    const multiplier = sortOrder === "asc" ? 1 : -1;
    return [...filtered].sort(
      (a, b) =>
        (a.dashboard_title || "").localeCompare(b.dashboard_title || "", "vi", {
          sensitivity: "base",
        }) * multiplier,
    );
  }, [dashboards, searchName, sortOrder]);

  // Nếu user chỉ xem được đúng 1 dashboard trong danh sách map -> chuyển thẳng vào dashboard đó luôn
  if (!loading && !error && dashboards.length === 1) {
    return <Navigate to={dashboards[0].path} replace />;
  }

  const displayName =
    user?.profile?.first_name && user?.profile?.last_name
      ? (user?.profile?.first_name || "") +
        " " +
        (user?.profile?.last_name || "")
      : "Bạn";

  return (
    <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
      <Header username={user?.username} />

      <main className="flex-1 px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4 w-full">
        {/* Hero Banner rực rỡ theo tông màu VTV Ratings */}
        <section className="shine-auto relative overflow-hidden rounded-3xl p-7 max-lg:p-6 max-md:p-5 mb-6 bg-gradient-to-r from-[#0f2a51] via-[#15658a] via-60% to-[#20A7C9] dark:from-[#111725] dark:via-[#163853] dark:to-[#1d7a94] text-white shadow-xl border border-white/10 animate-gradient-shift">
          <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#5bd6d8]/25 blur-3xl animate-float-slow" />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-[#7367f0]/25 blur-3xl animate-float-slow"
            style={{ animationDelay: "-3s" }}
          />
          <div className="pointer-events-none absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-[#f2994a]/20 blur-2xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.45) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-3 border border-white/20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#ffd04c] animate-pulse" />
                <span>Hệ thống Phân tích & Đo lường Khán giả VTV Ratings</span>
              </div>
              <h1 className="text-3xl max-lg:text-2xl max-md:text-xl font-extrabold tracking-tight">
                Xin chào, {displayName} 👋
              </h1>
              <p className="text-sm max-md:text-xs text-white/85 mt-1.5 leading-relaxed">
                Chọn một bảng điều khiển (Dashboard) bên dưới để xem báo cáo
                trực quan chi tiết theo các chỉ số Rating & Reach.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffd04c] to-[#f2994a] flex items-center justify-center text-[#1f2933] shadow-md transition-transform duration-300 hover:rotate-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3v18h18M7 16l4-4 4 4 5-6"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/75 font-medium">
                  Biểu đồ khả dụng
                </p>
                <p className="text-2xl font-black leading-tight tracking-tight">
                  {loading ? "..." : displayedDashboards.length}
                  {!loading && searchName && (
                    <span className="text-sm font-normal text-white/70">
                      {" "}
                      / {dashboards.length}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Thanh Filter Name & Sort Name */}
        <section
          style={{ animationDelay: "60ms" }}
          className="animate-fade-up p-4 max-md:p-3.5 mb-6 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component flex flex-wrap items-center justify-between gap-4 transition-all duration-300 hover:shadow-md"
        >
          {/* Ô tìm kiếm theo tên */}
          <div className="relative flex-1 min-w-[260px] max-w-lg">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Tìm kiếm biểu đồ theo tên..."
              className="w-full pl-10 pr-9 py-2.5 border border-border-black-10 dark:border-background-white-15 rounded-xl outline-none bg-background-search dark:bg-background-white-8 transition-all duration-300 text-sm max-lg:text-xs font-normal text-color-black-100 placeholder-color-black-50 dark:text-color-white-90 dark:placeholder-color-white-50 focus:border-color-neotam focus:ring-2 focus:ring-[#20A7C9]/25"
            />
            <figure className="absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none">
              <img
                src={!darkMode ? iconSearch : iconSearchDark}
                alt="Icon Search"
                className="w-4 h-4 opacity-70"
              />
            </figure>
            {searchName && (
              <button
                type="button"
                onClick={() => setSearchName("")}
                className="absolute top-1/2 -translate-y-1/2 right-3 w-5 h-5 flex items-center justify-center rounded-full bg-border-black-10 dark:bg-background-white-15 text-xs text-color-black-70 hover:text-color-error hover:bg-color-error/15 cursor-pointer transition-colors"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Nút sắp xếp theo tên và Chuyển chế độ xem */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-color-black-50 dark:text-color-white-50 mr-1 flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4h18M3 10h12M3 16h6"
                  />
                </svg>
                <span>Sắp xếp:</span>
              </span>

              <button
                type="button"
                onClick={() => setSortOrder("default")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                  sortOrder === "default"
                    ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white border-transparent shadow-sm shadow-[#20A7C9]/30 -translate-y-0.5"
                    : "bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 border-border-black-10 dark:border-background-white-15 hover:border-color-neotam hover:text-color-neotam dark:hover:text-[#5bd6d8]"
                }`}
              >
                Mặc định
              </button>
              <button
                type="button"
                onClick={() => setSortOrder("asc")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border flex items-center gap-1 ${
                  sortOrder === "asc"
                    ? "bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white border-transparent shadow-sm shadow-[#7367f0]/30 -translate-y-0.5"
                    : "bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 border-border-black-10 dark:border-background-white-15 hover:border-[#7367f0] hover:text-[#7367f0] dark:hover:text-[#a59ff8]"
                }`}
              >
                <span>Tên A → Z</span>
                <span className="font-bold">↑</span>
              </button>
              <button
                type="button"
                onClick={() => setSortOrder("desc")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border flex items-center gap-1 ${
                  sortOrder === "desc"
                    ? "bg-gradient-to-r from-[#f2994a] to-[#f7b731] text-white border-transparent shadow-sm shadow-[#f2994a]/30 -translate-y-0.5"
                    : "bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 border-border-black-10 dark:border-background-white-15 hover:border-[#f2994a] hover:text-[#f2994a] dark:hover:text-[#f6b26b]"
                }`}
              >
                <span>Tên Z → A</span>
                <span className="font-bold">↓</span>
              </button>
            </div>

            {/* Bộ chuyển đổi Grid / List View */}
            <div className="flex items-center rounded-xl p-1 bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Chế độ xem lưới (Grid)"
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                    : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1.5" />
                  <rect width="7" height="7" x="14" y="3" rx="1.5" />
                  <rect width="7" height="7" x="14" y="14" rx="1.5" />
                  <rect width="7" height="7" x="3" y="14" rx="1.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="Chế độ xem danh sách (List)"
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                    : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" x2="21" y1="6" y2="6" strokeLinecap="round" />
                  <line x1="3" x2="21" y1="12" y2="12" strokeLinecap="round" />
                  <line x1="3" x2="21" y1="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Nội dung danh sách Dashboard */}
        {loading ? (
          <div className="p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component animate-fade-up">
            <Loading height="400px" />
          </div>
        ) : error ? (
          <div className="p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center animate-fade-up">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-background-error text-color-error flex items-center justify-center text-xl font-bold">
              !
            </div>
            <p className="text-base font-semibold text-color-error mb-1">
              {error}
            </p>
            <p className="text-xs text-color-black-50 dark:text-color-white-50">
              Vui lòng thử tải lại trang hoặc kiểm tra quyền truy cập.
            </p>
          </div>
        ) : displayedDashboards.length === 0 ? (
          <div className="animate-fade-up p-14 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-3xl shadow-component text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center shadow-xs">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <p className="text-base font-bold text-color-black-100 dark:text-color-white-90 mb-1">
              {dashboards.length === 0
                ? "Tài khoản của bạn chưa được cấp quyền xem biểu đồ nào"
                : "Không tìm thấy biểu đồ phù hợp"}
            </p>
            {searchName ? (
              <>
                <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-4">
                  Không có biểu đồ nào khớp với từ khóa "{searchName}"
                </p>
                <button
                  type="button"
                  onClick={() => setSearchName("")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white hover:opacity-95 transition cursor-pointer shadow-sm"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </>
            ) : (
              <p className="text-xs text-color-black-50 dark:text-color-white-50">
                Vui lòng liên hệ Quản trị viên để được cấp phát quyền xem
                Dashboard.
              </p>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedDashboards.map((item, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const IconComponent = CHART_ICONS[index % CHART_ICONS.length];

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  style={{
                    animationDelay: `${Math.min(index * 60, 360)}ms`,
                  }}
                  className={`shine animate-fade-up group relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 flex flex-col justify-between gap-5 shadow-component transition-all duration-300 hover:-translate-y-1.5 ${theme.hoverBorder} ${theme.hoverShadow}`}
                >
                  {/* Thanh màu gradient trên đỉnh card */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.bar}`}
                  />

                  <div className="flex items-start gap-4 pt-1">
                    {/* Icon biểu đồ nhiều màu với squircle container */}
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0 shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${theme.badge}`}
                        >
                          ID #{item.id}
                        </span>
                        <span className="text-[11px] text-color-black-50 dark:text-color-white-50 font-medium">
                          • STT {index + 1}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90 group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors line-clamp-2 leading-snug">
                        {item.dashboard_title || `Dashboard #${item.id}`}
                      </h2>
                    </div>
                  </div>

                  {/* Chân card: đường dẫn & nút mở */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-border-black-10 dark:border-background-white-15">
                    <span className="text-xs text-color-black-50 dark:text-color-white-50 font-mono font-medium truncate max-w-[55%]">
                      {item.path}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 transition-all duration-300 ${theme.btnHover}`}
                    >
                      <span>Mở biểu đồ</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1 font-bold">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Chế độ xem Danh sách (List View) hiện đại */
          <div className="space-y-3 animate-fade-up">
            {displayedDashboards.map((item, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const IconComponent = CHART_ICONS[index % CHART_ICONS.length];

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  style={{
                    animationDelay: `${Math.min(index * 40, 300)}ms`,
                  }}
                  className={`shine animate-fade-up group relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-4 flex items-center justify-between gap-4 shadow-component transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 ${theme.hoverBorder} ${theme.hoverShadow}`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${theme.bar}`}
                  />

                  <div className="flex items-center gap-4 pl-2 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${theme.badge}`}
                        >
                          ID #{item.id}
                        </span>
                        <span className="text-[11px] text-color-black-50 dark:text-color-white-50 font-medium">
                          STT {index + 1}
                        </span>
                      </div>
                      <h2 className="text-sm md:text-base font-bold text-color-black-100 dark:text-color-white-90 group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors truncate">
                        {item.dashboard_title || `Dashboard #${item.id}`}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="hidden sm:inline-block text-xs text-color-black-50 dark:text-color-white-50 font-mono font-medium px-2.5 py-1 rounded-lg bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                      {item.path}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 transition-all duration-300 ${theme.btnHover}`}
                    >
                      <span>Mở</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1 font-bold">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
        <Footer color="text-color-black-100 dark:text-color-white-90" />
      </div>
    </div>
  );
};

const DashboardList = () => {
  return (
    <DashboardFilterProvider>
      <DashboardListContent />
    </DashboardFilterProvider>
  );
};

export default DashboardList;
