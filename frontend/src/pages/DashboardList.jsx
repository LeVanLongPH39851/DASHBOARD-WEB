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
        <section className="relative overflow-hidden rounded-2xl p-7 max-lg:p-6 max-md:p-5 mb-6 bg-gradient-to-r from-[#0f2a51] via-[#15658a] to-[#20A7C9] dark:from-[#111725] dark:via-[#163853] dark:to-[#1d7a94] text-white shadow-lg border border-white/10">
          <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#5bd6d8]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-[#7367f0]/25 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-[#f2994a]/20 blur-2xl" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-3 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-[#ffd04c] animate-pulse" />
                <span>Hệ thống Phân tích & Đo lường Khán giả VTV Ratings</span>
              </div>
              <h1 className="text-3xl max-lg:text-2xl max-md:text-xl font-bold tracking-tight">
                Xin chào, {displayName} 👋
              </h1>
              <p className="text-sm max-md:text-xs text-white/80 mt-1.5">
                Chọn một bảng điều khiển (Dashboard) bên dưới để xem báo cáo
                trực quan chi tiết.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffd04c] to-[#f2994a] flex items-center justify-center text-[#1f2933] shadow-md">
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
                <p className="text-xs text-white/75 font-normal">
                  Biểu đồ khả dụng
                </p>
                <p className="text-2xl font-bold leading-tight">
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
        <section className="p-4 max-md:p-3.5 mb-6 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component flex flex-wrap items-center justify-between gap-4">
          {/* Ô tìm kiếm theo tên */}
          <div className="relative flex-1 min-w-[240px] max-w-lg">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Nhập tên biểu đồ cần tìm..."
              className="w-full pl-10 pr-9 py-2.5 border border-border-black-10 dark:border-background-white-15 rounded-xl outline-none bg-background-search dark:bg-background-white-8 transition-all duration-300 text-sm max-lg:text-xs font-normal text-color-black-100 placeholder-color-black-50 dark:text-color-white-90 dark:placeholder-color-white-50 focus:border-color-neotam focus:ring-2 focus:ring-[#20A7C9]/20"
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
                className="absolute top-1/2 -translate-y-1/2 right-3 text-xs text-color-black-50 hover:text-color-error cursor-pointer"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Nút sắp xếp theo tên nhiều màu sắc */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-color-black-50 dark:text-color-white-50 mr-1">
              Sắp xếp theo tên:
            </span>
            <button
              type="button"
              onClick={() => setSortOrder("default")}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border ${
                sortOrder === "default"
                  ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white border-transparent shadow-sm"
                  : "bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 border-border-black-10 dark:border-background-white-15 hover:border-color-neotam"
              }`}
            >
              Mặc định
            </button>
            <button
              type="button"
              onClick={() => setSortOrder("asc")}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border flex items-center gap-1 ${
                sortOrder === "asc"
                  ? "bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white border-transparent shadow-sm"
                  : "bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 border-border-black-10 dark:border-background-white-15 hover:border-[#7367f0]"
              }`}
            >
              <span>Tên A → Z</span>
              <span>↑</span>
            </button>
            <button
              type="button"
              onClick={() => setSortOrder("desc")}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border flex items-center gap-1 ${
                sortOrder === "desc"
                  ? "bg-gradient-to-r from-[#f2994a] to-[#f7b731] text-white border-transparent shadow-sm"
                  : "bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 border-border-black-10 dark:border-background-white-15 hover:border-[#f2994a]"
              }`}
            >
              <span>Tên Z → A</span>
              <span>↓</span>
            </button>
          </div>
        </section>

        {/* Nội dung danh sách Dashboard */}
        {loading ? (
          <div className="p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component">
            <Loading height="400px" />
          </div>
        ) : error ? (
          <div className="p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center">
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
          <div className="p-14 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-background-ave-reach text-color-ave-reach flex items-center justify-center">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <p className="text-base font-semibold text-color-black-100 dark:text-color-white-90 mb-1">
              {dashboards.length === 0
                ? "Tài khoản của bạn chưa được cấp quyền xem biểu đồ nào"
                : "Không tìm thấy biểu đồ phù hợp"}
            </p>
            {searchName && (
              <p className="text-xs text-color-black-50 dark:text-color-white-50">
                Không có biểu đồ nào khớp với từ khóa "{searchName}"
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedDashboards.map((item, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const IconComponent = CHART_ICONS[index % CHART_ICONS.length];

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 flex flex-col justify-between gap-5 shadow-component transition-all duration-300 hover:-translate-y-1 ${theme.hoverBorder} ${theme.hoverShadow}`}
                >
                  {/* Thanh màu gradient trên đỉnh card */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.bar}`}
                  />

                  <div className="flex items-start gap-4 pt-1">
                    {/* Icon biểu đồ nhiều màu */}
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}
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
                        <span className="text-[11px] text-color-black-50 dark:text-color-white-50">
                          • STT {index + 1}
                        </span>
                      </div>

                      <h2 className="text-base font-semibold text-color-black-100 dark:text-color-white-90 group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors line-clamp-2 leading-snug">
                        {item.dashboard_title || `Dashboard #${item.id}`}
                      </h2>
                    </div>
                  </div>

                  {/* Chân card: đường dẫn & nút mở */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-border-black-10 dark:border-background-white-15">
                    <span className="text-xs text-color-black-50 dark:text-color-white-50 font-normal">
                      {item.path}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 transition-all duration-300 ${theme.btnHover}`}
                    >
                      <span>Mở biểu đồ</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
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
