import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layouts/headers/Header";
import Footer from "../components/layouts/footers/Footer";
import Loading from "../components/commons/Loading";
import { DashboardFilterProvider } from "../context/DashboardFilterContext";
import { getUsersInfo } from "../services/authService";

function formatDateDMY(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getRoleDisplayText(roleItem) {
  if (!roleItem) return "";
  if (typeof roleItem === "string") return roleItem;
  return roleItem.role_name || roleItem.role_code || "";
}

const UserInfoContent = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getUsersInfo();
      const singleUser =
        res?.user || (Array.isArray(res?.users) ? res.users[0] : null);
      setUserInfo(singleUser);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải thông tin User Info",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const groups = userInfo?.groups || [];
  const dashboards = userInfo?.dashboards || [];
  const globalRoles = (userInfo?.global_roles || [])
    .map((r) => getRoleDisplayText(r))
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
      <Header username={userInfo?.username} />

      <main className="flex-1 px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4 w-full max-w-6xl mx-auto">
        {loading ? (
          <div className="p-6 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component animate-fade-up">
            <Loading height="360px" />
          </div>
        ) : error ? (
          <div className="p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center animate-fade-up">
            <p className="text-base font-semibold text-color-error">{error}</p>
          </div>
        ) : !userInfo ? (
          <div className="p-12 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center animate-fade-up">
            <p className="text-sm text-color-black-50 dark:text-color-white-50">
              Không tìm thấy thông tin tài khoản.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Thẻ thông tin cá nhân của User */}
            <section className="relative overflow-hidden rounded-3xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component animate-fade-up">
              {/* Dải cover chuyển sắc sống động */}
              <div className="shine-auto relative h-32 max-md:h-24 bg-gradient-to-r from-[#0f2a51] via-[#1b5a7a] via-60% to-[#20A7C9] dark:from-[#111725] dark:via-[#1e3358] dark:to-[#1d7a94] animate-gradient-shift overflow-hidden">
                <div className="pointer-events-none absolute -top-12 right-12 w-48 h-48 rounded-full bg-[#5bd6d8]/25 blur-2xl animate-float-slow" />
                <div
                  className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-[#7367f0]/25 blur-3xl animate-float-slow"
                  style={{ animationDelay: "-3s" }}
                />
                <div className="pointer-events-none absolute top-4 right-1/3 w-28 h-28 rounded-full bg-[#f2994a]/20 blur-xl" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.45) 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                  }}
                />

                {/* Chip thống kê nhanh trên cover */}
                <div className="absolute top-4 right-5 max-md:top-3 max-md:right-3 flex items-center gap-2">
                  {[
                    { label: "Group", value: groups.length, delay: "120ms" },
                    {
                      label: "Dashboard",
                      value: dashboards.length,
                      delay: "200ms",
                    },
                    {
                      label: "Vai trò",
                      value: globalRoles.length,
                      delay: "280ms",
                    },
                  ].map((chip) => (
                    <span
                      key={chip.label}
                      style={{ animationDelay: chip.delay }}
                      className="animate-pop-in inline-flex items-center gap-1.5 px-3 max-md:px-2 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium"
                    >
                      <span className="text-sm max-md:text-xs font-bold">
                        {chip.value}
                      </span>
                      <span className="text-white/80 max-md:hidden">
                        {chip.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 px-6 max-md:px-4 pb-6 max-md:pb-4">
                <div className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-6 border-b border-border-black-10 dark:border-background-white-15">
                  <div className="flex items-end gap-4.5">
                    {/* Avatar nổi lên dải cover với vòng viền gradient xoay */}
                    <div className="relative -mt-10 max-md:-mt-8 shrink-0">
                      <div className="group/avatar relative w-20 h-20 max-md:w-16 max-md:h-16 rounded-2xl p-[3px] shadow-xl overflow-hidden bg-background-light dark:bg-background-chart-dark">
                        {/* Vòng viền gradient xoay chậm quanh avatar */}
                        <div className="pointer-events-none absolute -inset-1/2 bg-[conic-gradient(from_0deg,#20A7C9,#7367f0,#f2994a,#2fc4c6,#20A7C9)] animate-spin-slow" />
                        <div className="relative w-full h-full rounded-[13px] bg-background-light dark:bg-background-dark flex items-center justify-center transition-transform duration-300 group-hover/avatar:scale-95">
                          <span className="text-2xl max-md:text-xl font-extrabold bg-gradient-to-br from-[#20A7C9] to-[#7367f0] bg-clip-text text-transparent">
                            {(userInfo.username || "U").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {/* Chấm tròn trạng thái hoạt động gắn cố định góc avatar */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background-light dark:border-background-chart-dark shadow-xs ${
                          userInfo.active ? "bg-[#0cb7a9]" : "bg-color-error"
                        }`}
                        title={userInfo.active ? "Đang hoạt động" : "Không hoạt động"}
                      />
                    </div>

                    {/* Tên và thông tin định danh của User - nằm hoàn toàn dưới cover */}
                    <div className="pt-2 pb-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl max-md:text-lg font-bold text-color-black-100 dark:text-color-white-90 leading-tight">
                          {userInfo.full_name || userInfo.username}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] border border-[#21b8b8]/30">
                          ID #{userInfo.id}
                        </span>
                      </div>
                      <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-1 font-medium">
                        @{userInfo.username}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-transform duration-300 hover:scale-105 ${
                      userInfo.active
                        ? "bg-background-succes-type-1 text-color-succes-type-1 border border-[#0cb7a9]/25 dark:bg-[#0cb7a9]/20 dark:text-color-succes-type-1-dark"
                        : "bg-color-error/15 text-color-error border border-color-error/30"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        userInfo.active
                          ? "bg-[#0cb7a9] animate-pulse"
                          : "bg-color-error"
                      }`}
                    />
                    {userInfo.status ||
                      (userInfo.active ? "Active" : "Inactive")}
                  </span>
                </div>

                {/* Thông tin cơ bản: User Name, Email, Ngày tạo, Vai trò hệ thống */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="group p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#20A7C9]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                          />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <p className="text-xs font-medium text-color-black-50 dark:text-color-white-50">
                        User Name
                      </p>
                    </div>
                    <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90">
                      {userInfo.username}
                    </p>
                  </div>

                  <div className="group p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#7367f0]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-background-rating-percent dark:bg-[#7367f0]/20 text-color-rating-percent dark:text-[#a59ff8] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </span>
                      <p className="text-xs font-medium text-color-black-50 dark:text-color-white-50">
                        Email
                      </p>
                    </div>
                    <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90 break-all">
                      {userInfo.email || "-"}
                    </p>
                  </div>

                  <div className="group p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#f2994a]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-background-ave-reach-percent dark:bg-[#f2994a]/20 text-color-ave-reach-percent dark:text-[#f6b26b] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect width="18" height="18" x="3" y="4" rx="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                      </span>
                      <p className="text-xs font-medium text-color-black-50 dark:text-color-white-50">
                        Ngày tạo
                      </p>
                    </div>
                    <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90">
                      {formatDateDMY(
                        userInfo.created_at || userInfo.created_on,
                      )}
                    </p>
                  </div>

                  <div className="group p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#0cb7a9]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-background-succes-type-1 dark:bg-[#0cb7a9]/20 text-color-succes-type-1 dark:text-color-succes-type-1-dark flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                          />
                        </svg>
                      </span>
                      <p className="text-xs font-medium text-color-black-50 dark:text-color-white-50">
                        Vai trò hệ thống
                      </p>
                    </div>
                    <p className="text-sm font-bold text-color-neotam dark:text-[#5bd6d8]">
                      {globalRoles.length > 0 ? globalRoles.join(", ") : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Group Name & Vai trò trong Group + Các Dashboard được xem */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Danh sách Group & Vai trò trong Group */}
              <section
                className="relative overflow-hidden rounded-3xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component animate-fade-up"
                style={{ animationDelay: "80ms" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7367f0] to-[#9e95f5]" />

                <div className="flex items-center justify-between gap-3 mb-4 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background-rating-percent dark:bg-[#7367f0]/20 text-color-rating-percent dark:text-[#a59ff8] flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                        Group Name & Vai trò trong Group
                      </h2>
                      <p className="text-xs text-color-black-50 dark:text-color-white-50">
                        Các nhánh Group đang tham gia hoặc quản lý
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-background-rating-percent dark:bg-[#7367f0]/20 text-color-rating-percent dark:text-[#a59ff8]">
                    {groups.length} Group
                  </span>
                </div>

                {groups.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                    Tài khoản hiện chưa tham gia Group nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.map((g, idx) => {
                      const roleCode = g.role_code || g.role_in_group || "";
                      const roleName = g.role_name || g.role_label || roleCode;
                      return (
                        <div
                          key={`${g.group_id}-${roleCode}-${idx}`}
                          className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#7367f0]/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-9 h-9 rounded-xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 text-[#7367f0] dark:text-[#a59ff8] font-bold text-xs flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                              #{g.group_id}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90 truncate group-hover:text-[#7367f0] dark:group-hover:text-[#a59ff8] transition-colors">
                                {g.group_name}
                              </p>
                              {g.joined_at && (
                                <p className="text-[11px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                                  Ngày tham gia: {formatDateDMY(g.joined_at)}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border border-[#7367f0]/25 shrink-0">
                            {roleName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Danh sách các Dashboard được xem */}
              <section
                className="relative overflow-hidden rounded-3xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component animate-fade-up"
                style={{ animationDelay: "150ms" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6]" />

                <div className="flex items-center justify-between gap-3 mb-4 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                        Các Dashboard được xem
                      </h2>
                      <p className="text-xs text-color-black-50 dark:text-color-white-50">
                        Nhấn vào từng Dashboard để truy cập báo cáo
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8]">
                    {dashboards.length} Dashboard
                  </span>
                </div>

                {dashboards.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                    Tài khoản hiện chưa được cấp quyền xem Dashboard nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboards.map((d) => (
                      <Link
                        key={d.id}
                        to={d.path}
                        className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-color-neotam transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] font-bold text-xs flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                            #{d.id}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90 truncate group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors">
                              {d.dashboard_title}
                            </p>
                            <p className="text-[11px] text-color-black-50 dark:text-color-white-50">
                              {d.path}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 text-color-neotam dark:text-[#5bd6d8] group-hover:bg-gradient-to-r group-hover:from-[#20A7C9] group-hover:to-[#2fc4c6] group-hover:text-white group-hover:border-transparent transition-all duration-300 shrink-0">
                          <span>Mở</span>
                          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                            →
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
        <Footer color="text-color-black-100 dark:text-color-white-90" />
      </div>
    </div>
  );
};

const UserInfo = () => {
  return (
    <DashboardFilterProvider>
      <UserInfoContent />
    </DashboardFilterProvider>
  );
};

export default UserInfo;
