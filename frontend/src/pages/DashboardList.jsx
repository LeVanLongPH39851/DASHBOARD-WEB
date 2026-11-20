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
    return (parts[parts.length - 1] || "REPORT").replace(/-/g, " ").toUpperCase();
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

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Executive Header Banner */}
        <section className="shine-auto animate-gradient-shift animate-fade-up relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-[#0f2a51] via-[#15658a] to-[#20A7C9] dark:from-[#111725] dark:via-[#163853] dark:to-[#1d7a94] text-white shadow-lg border border-white/10">
          <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#5bd6d8]/25 blur-3xl animate-float-slow" />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-[#7367f0]/25 blur-3xl animate-float-slow"
            style={{ animationDelay: "-3s" }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div
                style={{ animationDelay: "80ms" }}
                className="animate-pop-in inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase mb-2.5 border border-white/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd04c] animate-pulse" />
                <span>VTV Ratings Analytics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Xin chào, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                Trung tâm báo cáo và phân tích dữ liệu đo lường khán giả truyền hình
              </p>
            </div>

            <div
              style={{ animationDelay: "140ms" }}
              className="animate-pop-in flex items-center gap-3.5 bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 self-start sm:self-auto shrink-0 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffd04c] to-[#f2994a] flex items-center justify-center text-[#1f2933] shadow-sm">
                <svg
                  className="w-5 h-5"
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
                <p className="text-[11px] text-white/75 font-medium uppercase tracking-wider">
                  Báo cáo khả dụng
                </p>
                <p className="text-2xl font-black leading-none mt-1">
                  {loading ? "—" : displayedDashboards.length}
                  {!loading && searchName && (
                    <span className="text-xs font-normal text-white/70">
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
          className="animate-fade-up p-3.5 sm:p-4 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all duration-300"
        >
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Tìm kiếm báo cáo..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 outline-none bg-background-search dark:bg-background-white-8 text-xs sm:text-sm text-color-black-100 placeholder-color-black-50 dark:text-color-white-90 dark:placeholder-color-white-50 focus:border-color-neotam transition"
            />
            <img
              src={!darkMode ? iconSearch : iconSearchDark}
              alt="Search"
              className="w-4 h-4 opacity-60 absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none"
            />
            {searchName && (
              <button
                type="button"
                onClick={() => setSearchName("")}
                className="absolute top-1/2 -translate-y-1/2 right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-xs text-color-black-50 hover:text-color-error cursor-pointer transition"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort & View Switcher */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
              {[
                { id: "default", label: "Mặc định" },
                { id: "asc", label: "A → Z" },
                { id: "desc", label: "Z → A" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSortOrder(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    sortOrder === item.id
                      ? "bg-background-light dark:bg-background-chart-dark text-color-neotam dark:text-[#5bd6d8] shadow-xs"
                      : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-xl p-1 bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Dạng lưới"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
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
                title="Dạng danh sách"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
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

        {/* Dashboard Grid / List */}
        {loading ? (
          <div className="animate-fade-up p-6 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component">
            <Loading height="380px" />
          </div>
        ) : error ? (
          <div className="animate-fade-up p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center">
            <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-background-error text-color-error flex items-center justify-center text-lg font-bold animate-pop-in">
              !
            </div>
            <p className="text-sm font-semibold text-color-error">{error}</p>
          </div>
        ) : displayedDashboards.length === 0 ? (
          <div className="animate-fade-up p-14 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center animate-float-slow">
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
            <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90">
              {dashboards.length === 0
                ? "Chưa có báo cáo nào được cấp quyền"
                : "Không tìm thấy báo cáo phù hợp"}
            </p>
            {searchName && (
              <button
                type="button"
                onClick={() => setSearchName("")}
                className="mt-3.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white hover:opacity-95 transition cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedDashboards.map((item, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const IconComponent = CHART_ICONS[index % CHART_ICONS.length];
              const categoryLabel = getSlugLabel(item);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  style={{
                    animationDelay: `${Math.min(index * 60, 360)}ms`,
                  }}
                  className={`shine animate-fade-up group relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 flex flex-col justify-between gap-5 shadow-component transition-all duration-300 hover:-translate-y-1.5 ${theme.hoverBorder} ${theme.hoverShadow}`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.bar}`}
                  />
                  <div
                    className={`pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-bl ${theme.glow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="flex items-start gap-4 pt-1">
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${theme.badge}`}
                        >
                          {categoryLabel}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90 group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors line-clamp-2 leading-snug">
                        {item.dashboard_title || `Dashboard #${item.id}`}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-border-black-10 dark:border-background-white-15">
                    <span className="text-xs font-medium text-color-black-50 dark:text-color-white-50">
                      Báo cáo trực tuyến
                    </span>

                    <span
                      title="Mở báo cáo"
                      aria-label="Mở báo cáo"
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 transition-all duration-300 ${theme.btnHover}`}
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5 animate-fade-up">
            {displayedDashboards.map((item, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const IconComponent = CHART_ICONS[index % CHART_ICONS.length];
              const categoryLabel = getSlugLabel(item);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  style={{
                    animationDelay: `${Math.min(index * 45, 300)}ms`,
                  }}
                  className={`shine animate-fade-up group relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-4 flex items-center justify-between gap-4 shadow-component transition-all duration-200 hover:-translate-y-0.5 ${theme.hoverBorder} ${theme.hoverShadow}`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.bar}`}
                  />

                  <div className="flex items-center gap-3.5 pl-2 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-bold text-color-black-100 dark:text-color-white-90 group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors truncate">
                        {item.dashboard_title || `Dashboard #${item.id}`}
                      </h2>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${theme.badge}`}
                      >
                        {categoryLabel}
                      </span>
                    </div>
                  </div>

                  <span
                    title="Mở báo cáo"
                    aria-label="Mở báo cáo"
                    className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 transition-all duration-200 shrink-0 ${theme.btnHover}`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <div className="px-4 sm:px-6 lg:px-8 pb-6 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
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
