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

      <main className="flex-1 px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4 w-full max-w-5xl mx-auto">
        {loading ? (
          <div className="p-6 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component">
            <Loading height="360px" />
          </div>
        ) : error ? (
          <div className="p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center">
            <p className="text-base font-semibold text-color-error">{error}</p>
          </div>
        ) : !userInfo ? (
          <div className="p-12 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
            <p className="text-sm text-color-black-50 dark:text-color-white-50">
              Không tìm thấy thông tin tài khoản.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Thẻ thông tin cá nhân của User */}
            <section className="relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#f2994a]" />

              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-border-black-10 dark:border-background-white-15 pt-1">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#20A7C9] to-[#7367f0] text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                    {(userInfo.username || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl max-md:text-lg font-bold text-color-black-100 dark:text-color-white-90">
                      {userInfo.full_name || userInfo.username}
                    </h1>
                    <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-0.5">
                      @{userInfo.username}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    userInfo.active
                      ? "bg-background-succes-type-1 text-color-succes-type-1 dark:bg-[#0cb7a9]/20 dark:text-color-succes-type-1-dark"
                      : "bg-color-error/15 text-color-error"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      userInfo.active ? "bg-[#0cb7a9]" : "bg-color-error"
                    }`}
                  />
                  {userInfo.status || (userInfo.active ? "Active" : "Inactive")}
                </span>
              </div>

              {/* Thông tin cơ bản: User Name, Email, Ngày tạo, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                  <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-1">
                    User Name
                  </p>
                  <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90">
                    {userInfo.username}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                  <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-1">
                    Email
                  </p>
                  <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90 break-all">
                    {userInfo.email || "-"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                  <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-1">
                    Ngày tạo
                  </p>
                  <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90">
                    {formatDateDMY(userInfo.created_at || userInfo.created_on)}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                  <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-1">
                    Vai trò hệ thống
                  </p>
                  <p className="text-sm font-bold text-color-neotam dark:text-[#5bd6d8]">
                    {globalRoles.length > 0 ? globalRoles.join(", ") : "-"}
                  </p>
                </div>
              </div>
            </section>

            {/* Group Name & Vai trò trong Group + Các Dashboard được xem */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Danh sách Group & Vai trò trong Group */}
              <section className="rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component">
                <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90 mb-4">
                  Group Name & Vai trò trong Group ({groups.length})
                </h2>

                {groups.length === 0 ? (
                  <div className="p-6 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                    Tài khoản hiện chưa tham gia Group nào.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {groups.map((g) => {
                      const roleCode = g.role_code || g.role_in_group || "";
                      const roleName = g.role_name || g.role_label || roleCode;
                      return (
                        <div
                          key={`${g.group_id}-${roleCode}`}
                          className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15"
                        >
                          <div>
                            <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90">
                              {g.group_name}
                            </p>
                            {g.joined_at && (
                              <p className="text-[11px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                                Ngày tham gia: {formatDateDMY(g.joined_at)}
                              </p>
                            )}
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] shrink-0">
                            {roleName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Danh sách các Dashboard được xem */}
              <section className="rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component">
                <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90 mb-4">
                  Các Dashboard được xem ({dashboards.length})
                </h2>

                {dashboards.length === 0 ? (
                  <div className="p-6 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                    Tài khoản hiện chưa được cấp quyền xem Dashboard nào.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {dashboards.map((d) => (
                      <Link
                        key={d.id}
                        to={d.path}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-color-neotam transition group"
                      >
                        <span className="text-sm font-semibold text-color-black-100 dark:text-color-white-90 group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors">
                          {d.dashboard_title}
                        </span>
                        <span className="text-xs font-medium text-color-neotam dark:text-[#5bd6d8]">
                          Mở →
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
