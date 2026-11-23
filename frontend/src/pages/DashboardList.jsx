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

const CARD_THEMES = [
  {
    name: "cyan",
    bar: "from-[#20A7C9] to-[#2fc4c6]",
    glow: "from-[#20A7C9]/15 to-transparent",
    iconBg: "bg-background-ave-reach dark:bg-[#21b8b8]/20",
    iconText: "text-color-ave-reach dark:text-[#5bd6d8]",
    badge:
      "bg-background-ave-reach text-color-ave-reach border-[#21b8b8]/25 dark:bg-[#21b8b8]/15 dark:text-[#5bd6d8]",
    hoverBorder: "hover:border-[#20A7C9]/70 dark:hover:border-[#5bd6d8]/60",
    hoverShadow: "hover:shadow-[0_14px_34px_-10px_rgba(32,167,201,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#20A7C9] group-hover:to-[#2fc4c6] group-hover:text-white group-hover:border-transparent",
  },
  {
    name: "purple",
    bar: "from-[#7367f0] to-[#9e95f5]",
    glow: "from-[#7367f0]/15 to-transparent",
    iconBg: "bg-background-rating-percent dark:bg-[#7367f0]/20",
    iconText: "text-color-rating-percent dark:text-[#a59ff8]",
    badge:
      "bg-background-rating-percent text-color-rating-percent border-[#7367f0]/25 dark:bg-[#7367f0]/15 dark:text-[#a59ff8]",
    hoverBorder: "hover:border-[#7367f0]/70 dark:hover:border-[#a59ff8]/60",
    hoverShadow: "hover:shadow-[0_14px_34px_-10px_rgba(115,103,240,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#7367f0] group-hover:to-[#9e95f5] group-hover:text-white group-hover:border-transparent",
  },
  {
    name: "orange",
    bar: "from-[#f2994a] to-[#f7b731]",
    glow: "from-[#f2994a]/15 to-transparent",
    iconBg: "bg-background-ave-reach-percent dark:bg-[#f2994a]/20",
    iconText: "text-color-ave-reach-percent dark:text-[#f6b26b]",
    badge:
      "bg-background-ave-reach-percent text-color-ave-reach-percent border-[#f2994a]/25 dark:bg-[#f2994a]/15 dark:text-[#f6b26b]",
    hoverBorder: "hover:border-[#f2994a]/70 dark:hover:border-[#f6b26b]/60",
    hoverShadow: "hover:shadow-[0_14px_34px_-10px_rgba(242,153,74,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#f2994a] group-hover:to-[#f7b731] group-hover:text-white group-hover:border-transparent",
  },
  {
    name: "coral",
    bar: "from-[#eb5757] to-[#ff7676]",
    glow: "from-[#eb5757]/15 to-transparent",
    iconBg: "bg-background-rating dark:bg-[#eb5757]/20",
    iconText: "text-color-rating dark:text-[#ff8585]",
    badge:
      "bg-background-rating text-color-rating border-[#eb5757]/25 dark:bg-[#eb5757]/15 dark:text-[#ff8585]",
    hoverBorder: "hover:border-[#eb5757]/70 dark:hover:border-[#ff8585]/60",
    hoverShadow: "hover:shadow-[0_14px_34px_-10px_rgba(235,87,87,0.28)]",
    btnHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#eb5757] group-hover:to-[#ff7676] group-hover:text-white group-hover:border-transparent",
  },
  {
    name: "emerald",
    bar: "from-[#0cb7a9] to-[#2ed8b6]",
    glow: "from-[#0cb7a9]/15 to-transparent",
    iconBg: "bg-background-succes-type-1 dark:bg-[#0cb7a9]/20",
    iconText: "text-color-succes-type-1 dark:text-color-succes-type-1-dark",
    badge:
      "bg-background-succes-type-1 text-color-succes-type-1 border-[#0cb7a9]/25 dark:bg-[#0cb7a9]/15 dark:text-color-succes-type-1-dark",
    hoverBorder: "hover:border-[#0cb7a9]/70 dark:hover:border-[#86e1e3]/60",
    hoverShadow: "hover:shadow-[0_14px_34px_-10px_rgba(12,183,169,0.28)]",
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

function getSlugLabel(item) {
  if (item.slug) return String(item.slug).replace(/-/g, " ").toUpperCase();
  if (item.path) {
    const parts = String(item.path).split("/").filter(Boolean);
    return (parts[parts.length - 1] || "REPORT")
      .replace(/-/g, " ")
      .toUpperCase();
  }
  return "ANALYTICS";
}

const DashboardListContent = () => {
  const { value: darkMode } = useDarkMode();

  const [user, setUser] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [sortOrder, setSortOrder] = useState("default"); // "default" | "asc" | "desc"
  const [viewMode, setViewModeState] = useState(() => {
    try {
      const saved =
        localStorage.getItem("dashboards_view_mode") ||
        localStorage.getItem("dashboard_list_view_mode");
      return saved === "list" || saved === "grid" ? saved : "grid";
    } catch {
      return "grid";
    }
  });

  const setViewMode = (mode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem("dashboards_view_mode", mode);
    } catch {
      // ignore
    }
  };

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

        setDashboards(dashRes?.dashboards || []);
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

  if (!loading && !error && dashboards.length === 1) {
    return <Navigate to={dashboards[0].path} replace />;
  }

  const displayName =
    user?.profile?.first_name || user?.profile?.last_name
      ? `${user?.profile?.first_name || ""} ${user?.profile?.last_name || ""}`.trim()
      : user?.username || "Bạn";

  return (
    <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
      <Header username={user?.username} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-8 max-lg:px-6 max-md:px-4 py-6 max-lg:py-4.5 max-md:py-3 space-y-5 max-lg:space-y-4 max-md:space-y-3">
        {/* Executive Header Banner */}
        <section className="shine-auto animate-gradient-shift animate-fade-up relative overflow-hidden rounded-2xl p-7 max-lg:p-5 max-md:p-4 bg-gradient-to-r from-[#0f2a51] via-[#15658a] to-[#20A7C9] dark:from-[#111725] dark:via-[#163853] dark:to-[#1d7a94] text-white shadow-lg border border-white/10">
          <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#5bd6d8]/25 blur-3xl animate-float-slow" />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-[#7367f0]/25 blur-3xl animate-float-slow"
            style={{ animationDelay: "-3s" }}
          />

          <div className="relative z-10 flex flex-row max-md:flex-col items-center max-md:items-start justify-between gap-4 max-lg:gap-3 max-md:gap-2.5">
            <div>
              <div
                style={{ animationDelay: "80ms" }}
                className="animate-pop-in inline-flex items-center gap-2 px-3 max-lg:px-2.5 py-1 max-lg:py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] max-lg:text-[10px] font-semibold tracking-wide uppercase mb-2.5 max-lg:mb-2 border border-white/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd04c] animate-pulse" />
                <span>VTV Ratings Analytics</span>
              </div>
              <h1 className="text-3xl max-lg:text-2xl max-md:text-xl font-extrabold tracking-tight">
                Xin chào, {displayName}
              </h1>
              <p className="text-sm max-lg:text-xs max-md:text-[11px] text-white/80 mt-1">
                Trung tâm báo cáo và phân tích dữ liệu đo lường khán giả truyền
                hình
              </p>
            </div>

            <div
              style={{ animationDelay: "140ms" }}
              className="animate-pop-in flex items-center gap-3.5 max-lg:gap-2.5 max-md:gap-2 bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-4 max-lg:px-3 max-md:px-2.5 py-3 max-lg:py-2.5 max-md:py-2 self-auto max-md:self-start shrink-0 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="w-11 h-11 max-lg:w-9.5 max-lg:h-9.5 max-md:w-8.5 max-md:h-8.5 rounded-xl bg-gradient-to-br from-[#ffd04c] to-[#f2994a] flex items-center justify-center text-[#1f2933] shadow-sm">
                <svg
                  className="w-5 h-5 max-lg:w-4 max-lg:h-4"
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
              <div className="pr-1">
                <p className="text-[11px] max-lg:text-[10px] text-white/75 font-medium uppercase tracking-wider">
                  Dashboard khả dụng
                </p>
                <p className="text-2xl max-lg:text-xl max-md:text-lg font-black leading-none mt-1">
                  {loading ? "—" : displayedDashboards.length}
                  {!loading && searchName && (
                    <span className="text-xs max-lg:text-[11px] font-normal text-white/70">
                      {" "}
                      / {dashboards.length}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Command Bar: Search, Sort, View Mode */}
        <section
          style={{ animationDelay: "70ms" }}
          className="animate-fade-up p-4 max-lg:p-3 max-md:p-2.5 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component flex flex-row max-md:flex-col items-center max-md:items-stretch justify-between gap-3 max-lg:gap-2.5 max-md:gap-2 transition-all duration-300"
        >
          {/* Search Input */}
          <div className="relative flex-1 max-w-md max-md:max-w-none">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Tìm kiếm Dashboard..."
              className="w-full pl-9 max-lg:pl-8 max-md:pl-7 pr-8 max-lg:pr-7 max-md:pr-6 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl border border-border-black-10 dark:border-background-white-15 outline-none bg-background-search dark:bg-background-white-8 text-sm max-lg:text-xs max-md:text-[11px] text-color-black-100 placeholder-color-black-50 dark:text-color-white-90 dark:placeholder-color-white-50 focus:border-color-neotam transition"
            />
            <img
              src={!darkMode ? iconSearch : iconSearchDark}
              alt="Search"
              className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3 opacity-60 absolute top-1/2 -translate-y-1/2 left-3 max-lg:left-2.5 max-md:left-2 pointer-events-none"
            />
            {searchName && (
              <button
                type="button"
                onClick={() => setSearchName("")}
                className="absolute top-1/2 -translate-y-1/2 right-2.5 max-lg:right-2 w-5 h-5 max-lg:w-4 max-lg:h-4 flex items-center justify-center rounded-full text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 hover:text-color-error cursor-pointer transition"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort & View Switcher */}
          <div className="flex flex-wrap items-center justify-end max-md:justify-between gap-2.5 max-lg:gap-2 max-md:gap-1.5">
            <div className="flex items-center p-1 max-lg:p-0.5 rounded-xl bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
              {[
                { id: "default", label: "Mặc định" },
                { id: "asc", label: "A → Z" },
                { id: "desc", label: "Z → A" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSortOrder(item.id)}
                  className={`px-3 max-lg:px-2.5 max-md:px-2 py-1.5 max-lg:py-1 max-md:py-0.5 rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold transition cursor-pointer ${
                    sortOrder === item.id
                      ? "bg-background-light dark:bg-background-chart-dark text-color-neotam dark:text-[#5bd6d8] shadow-xs"
                      : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-xl p-1 max-lg:p-0.5 bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Dạng lưới"
                className={`p-1.5 max-lg:p-1 max-md:p-0.5 rounded-lg transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                    : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                }`}
              >
                <svg
                  className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
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
                title="Dạng danh sách"
                className={`p-1.5 max-lg:p-1 max-md:p-0.5 rounded-lg transition cursor-pointer ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                    : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                }`}
              >
                <svg
                  className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
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

        {/* Dashboard Grid / List */}
        {loading ? (
          <div className="animate-fade-up p-6 max-lg:p-4 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component">
            <Loading height="380px" />
          </div>
        ) : error ? (
          <div className="animate-fade-up p-12 max-lg:p-8 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center">
            <div className="w-11 h-11 max-lg:w-9.5 max-lg:h-9.5 mx-auto mb-3 rounded-xl bg-background-error text-color-error flex items-center justify-center text-lg font-bold animate-pop-in">
              !
            </div>
            <p className="text-sm max-lg:text-xs font-semibold text-color-error">
              {error}
            </p>
          </div>
        ) : displayedDashboards.length === 0 ? (
          <div className="animate-fade-up p-14 max-lg:p-10 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
            <div className="w-14 h-14 max-lg:w-11 max-lg:h-11 mx-auto mb-3 rounded-2xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center animate-float-slow">
              <svg
                className="w-7 h-7 max-lg:w-5.5 max-lg:h-5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <p className="text-sm max-lg:text-xs font-bold text-color-black-100 dark:text-color-white-90">
              {dashboards.length === 0
                ? "Chưa có Dashboard nào được cấp quyền"
                : "Không tìm thấy Dashboard phù hợp"}
            </p>
            {searchName && (
              <button
                type="button"
                onClick={() => setSearchName("")}
                className="mt-3.5 px-4 max-lg:px-3 py-2 max-lg:py-1.5 rounded-xl text-xs max-lg:text-[11px] font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white hover:opacity-95 transition cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-5 max-lg:gap-3.5 max-md:gap-2.5">
            {displayedDashboards.map((item, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const IconComponent = CHART_ICONS[index % CHART_ICONS.length];
              const categoryLabel = getSlugLabel(item);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  title={item.dashboard_title || `Dashboard #${item.id}`}
                  style={{
                    animationDelay: `${Math.min(index * 60, 360)}ms`,
                  }}
                  className={`shine animate-fade-up group relative overflow-hidden rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 max-lg:p-3.5 max-md:p-3 flex flex-col justify-between gap-5 max-lg:gap-3.5 max-md:gap-2.5 shadow-component transition-all duration-300 hover:-translate-y-1.5 ${theme.hoverBorder} ${theme.hoverShadow}`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.bar}`}
                  />
                  <div
                    className={`pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-bl ${theme.glow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="flex items-start gap-4 max-lg:gap-3 max-md:gap-2.5 pt-1">
                    <div
                      className={`w-12 h-12 max-lg:w-10 max-lg:h-10 max-md:w-8.5 max-md:h-8.5 rounded-2xl max-lg:rounded-xl max-md:rounded-lg ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
                    >
                      <IconComponent className="w-6 h-6 max-lg:w-5 max-lg:h-5 max-md:w-4 max-md:h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 max-lg:mb-1">
                        <span
                          className={`inline-flex items-center px-2.5 max-lg:px-2 max-md:px-1.5 py-0.5 rounded-full text-[10px] max-lg:text-[9px] max-md:text-[8px] font-bold tracking-wider uppercase border ${theme.badge}`}
                        >
                          {categoryLabel}
                        </span>
                      </div>

                      <h2
                        title={item.dashboard_title || `Dashboard #${item.id}`}
                        className="text-base max-lg:text-sm max-md:text-xs font-bold text-color-black-100 dark:text-color-white-90 group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors truncate"
                      >
                        {item.dashboard_title || `Dashboard #${item.id}`}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 max-lg:pt-2.5 max-md:pt-2 border-t border-border-black-10 dark:border-background-white-15">
                    <span className="text-xs max-lg:text-[11px] max-md:text-[10px] font-medium text-color-black-50 dark:text-color-white-50">
                      Dashboard trực tuyến
                    </span>

                    <span
                      title="Mở Dashboard"
                      aria-label="Mở Dashboard"
                      className={`w-7 h-7 max-lg:w-6 max-lg:h-6 max-md:w-5.5 max-md:h-5.5 rounded-lg max-lg:rounded-md max-md:rounded inline-flex items-center justify-center border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 transition-all duration-300 ${theme.btnHover}`}
                    >
                      <svg
                        className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5 max-lg:space-y-2 animate-fade-up">
            {displayedDashboards.map((item, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const IconComponent = CHART_ICONS[index % CHART_ICONS.length];
              const categoryLabel = getSlugLabel(item);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  title={item.dashboard_title || `Dashboard #${item.id}`}
                  style={{
                    animationDelay: `${Math.min(index * 45, 300)}ms`,
                  }}
                  className={`shine animate-fade-up group relative overflow-hidden rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-4 max-lg:p-3 max-md:p-2.5 flex items-center justify-between gap-4 max-lg:gap-3 max-md:gap-2 shadow-component transition-all duration-200 hover:-translate-y-0.5 ${theme.hoverBorder} ${theme.hoverShadow}`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.bar}`}
                  />

                  <div className="flex items-center gap-3.5 max-lg:gap-2.5 max-md:gap-2 pl-2 min-w-0">
                    <div
                      className={`w-10 h-10 max-lg:w-8.5 max-lg:h-8.5 max-md:w-7.5 max-md:h-7.5 rounded-xl max-lg:rounded-lg max-md:rounded-md ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
                    >
                      <IconComponent className="w-5 h-5 max-lg:w-4.5 max-lg:h-4 max-md:w-3.5 max-md:h-3.5" />
                    </div>

                    <div className="min-w-0">
                      <h2
                        title={item.dashboard_title || `Dashboard #${item.id}`}
                        className="text-base max-lg:text-sm max-md:text-xs font-bold text-color-black-100 dark:text-color-white-90 group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors truncate"
                      >
                        {item.dashboard_title || `Dashboard #${item.id}`}
                      </h2>
                      <span
                        className={`inline-flex items-center px-2 max-lg:px-1.5 max-md:px-1 py-0.5 mt-1 rounded-full text-[10px] max-lg:text-[9px] max-md:text-[8px] font-bold tracking-wider uppercase border ${theme.badge}`}
                      >
                        {categoryLabel}
                      </span>
                    </div>
                  </div>

                  <span
                    title="Mở Dashboard"
                    aria-label="Mở Dashboard"
                    className={`w-7 h-7 max-lg:w-6 max-lg:h-6 max-md:w-5.5 max-md:h-5.5 rounded-lg max-lg:rounded-md max-md:rounded inline-flex items-center justify-center border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 transition-all duration-200 shrink-0 ${theme.btnHover}`}
                  >
                    <svg
                      className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <div className="mt-auto w-full max-w-[1600px] mx-auto px-8 max-lg:px-6 max-md:px-4 pb-6 max-lg:pb-4.5 max-md:pb-3 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
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
