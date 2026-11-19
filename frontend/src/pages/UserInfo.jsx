import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layouts/headers/Header";
import Footer from "../components/layouts/footers/Footer";
import Loading from "../components/commons/Loading";
import { DashboardFilterProvider } from "../context/DashboardFilterContext";
import {
  getUsersInfo,
  updateUserProfile,
  changeUserPassword,
} from "../services/authService";

function formatDateDMY(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
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

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Modal Chỉnh sửa thông tin cá nhân
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Modal Đổi mật khẩu
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          "Không thể tải thông tin tài khoản",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleOpenEditProfile = () => {
    setProfileForm({
      first_name: userInfo?.first_name || "",
      last_name: userInfo?.last_name || "",
      email: userInfo?.email || "",
    });
    setProfileErrors({});
    setIsEditProfileOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    const errors = {};
    const cleanEmail = (profileForm.email || "").trim();
    if (!cleanEmail) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Định dạng email không hợp lệ";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    try {
      setProfileSubmitting(true);
      setProfileErrors({});
      const res = await updateUserProfile({
        first_name: (profileForm.first_name || "").trim(),
        last_name: (profileForm.last_name || "").trim(),
        email: cleanEmail,
      });

      showToast(res?.message || "Cập nhật thông tin thành công", "success");
      setIsEditProfileOpen(false);
      await fetchUserData();
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật thông tin";
      setProfileErrors({ form: errMsg });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleOpenChangePassword = () => {
    if (userInfo?.can_change_password === false) {
      showToast(
        "Tài khoản đang bị khóa tính năng đổi mật khẩu. Vui lòng liên hệ quản trị viên.",
        "error",
      );
      return;
    }
    setPasswordForm({
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    });
    setPasswordErrors({});
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsChangePasswordOpen(true);
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    const errors = {};
    if (!passwordForm.old_password) {
      errors.old_password = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!passwordForm.new_password) {
      errors.new_password = "Vui lòng nhập mật khẩu mới";
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = "Mật khẩu mới phải có tối thiểu 8 ký tự";
    }
    if (!passwordForm.confirm_new_password) {
      errors.confirm_new_password = "Vui lòng xác nhận mật khẩu mới";
    } else if (
      passwordForm.new_password !== passwordForm.confirm_new_password
    ) {
      errors.confirm_new_password = "Xác nhận mật khẩu không khớp";
    }
    if (
      passwordForm.old_password &&
      passwordForm.new_password &&
      passwordForm.old_password === passwordForm.new_password
    ) {
      errors.new_password =
        "Mật khẩu mới không được trùng với mật khẩu hiện tại";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordSubmitting(true);
      setPasswordErrors({});
      const res = await changeUserPassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
        confirm_new_password: passwordForm.confirm_new_password,
      });

      showToast(res?.message || "Đổi mật khẩu thành công", "success");
      setIsChangePasswordOpen(false);
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Không thể đổi mật khẩu";
      setPasswordErrors({ form: errMsg });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const groups = userInfo?.groups || [];
  const dashboards = userInfo?.dashboards || [];
  const globalRoles = (userInfo?.global_roles || [])
    .map((r) => getRoleDisplayText(r))
    .filter(Boolean);

  const displayName =
    `${userInfo?.first_name || ""} ${userInfo?.last_name || ""}`.trim() ||
    userInfo?.full_name ||
    userInfo?.username ||
    "—";

  return (
    <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
      <Header username={userInfo?.username} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 animate-pop-in duration-300">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border text-xs font-semibold ${
                toast.type === "success"
                  ? "bg-gradient-to-r from-[#20A7C9]/95 to-[#2fc4c6]/95 text-white border-white/20"
                  : "bg-gradient-to-r from-[#eb5757]/95 to-[#f87171]/95 text-white border-white/20"
              }`}
            >
              {toast.type === "success" ? (
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="animate-fade-up p-6 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component">
            <Loading height="360px" />
          </div>
        ) : error ? (
          <div className="animate-fade-up p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center">
            <p className="text-sm font-semibold text-color-error">{error}</p>
          </div>
        ) : !userInfo ? (
          <div className="animate-fade-up p-12 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
            <p className="text-sm text-color-black-50 dark:text-color-white-50">
              Không tìm thấy thông tin tài khoản.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Identity & Security Profile Card */}
            <section className="animate-fade-up lg:col-span-4 rounded-2xl overflow-hidden bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component">
              {/* Cover Header */}
              <div className="shine-auto animate-gradient-shift relative h-28 bg-gradient-to-r from-[#0f2a51] via-[#15658a] to-[#20A7C9] dark:from-[#111725] dark:via-[#163853] dark:to-[#1d7a94] overflow-hidden">
                <div className="pointer-events-none absolute -top-12 right-6 w-36 h-36 rounded-full bg-[#5bd6d8]/25 blur-2xl animate-float-slow" />
                <div
                  className="pointer-events-none absolute -bottom-14 left-6 w-40 h-40 rounded-full bg-[#7367f0]/25 blur-3xl animate-float-slow"
                  style={{ animationDelay: "-3s" }}
                />
                <div className="absolute top-3.5 right-4">
                  <span
                    style={{ animationDelay: "100ms" }}
                    className={`animate-pop-in inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                      userInfo.active
                        ? "bg-white/15 text-white border-white/25"
                        : "bg-color-error/25 text-white border-color-error/40"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        userInfo.active
                          ? "bg-[#0cb7a9] animate-pulse"
                          : "bg-color-error"
                      }`}
                    />
                    {userInfo.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
              </div>

              <div className="px-6 pb-6">
                {/* Avatar & Identity */}
                <div className="flex items-end justify-between gap-3 -mt-10 mb-5">
                  <div className="relative w-20 h-20 rounded-2xl p-[3px] shadow-lg overflow-hidden bg-background-light dark:bg-background-chart-dark group">
                    <div className="pointer-events-none absolute -inset-1/2 bg-[conic-gradient(from_0deg,#20A7C9,#7367f0,#f2994a,#2fc4c6,#20A7C9)] animate-spin-slow opacity-90" />
                    <div className="relative w-full h-full rounded-[13px] bg-gradient-to-br from-[#20A7C9] to-[#7367f0] flex items-center justify-center text-white text-xl font-extrabold transition-transform duration-300 group-hover:scale-105">
                      {(userInfo.username || "U").slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {globalRoles.length > 0 && (
                    <span
                      style={{ animationDelay: "140ms" }}
                      className="animate-pop-in px-3 py-1 rounded-full text-xs font-bold bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] border border-[#21b8b8]/30"
                    >
                      {globalRoles.join(", ")}
                    </span>
                  )}
                </div>

                <div className="mb-5 pb-5 border-b border-border-black-10 dark:border-background-white-15">
                  <h1 className="text-xl font-bold text-color-black-100 dark:text-color-white-90 leading-snug">
                    {displayName}
                  </h1>
                  <p className="text-xs font-mono text-color-black-50 dark:text-color-white-50 mt-0.5">
                    @{userInfo.username}
                  </p>
                </div>

                {/* Details List */}
                <div className="space-y-3.5 text-xs mb-6">
                  <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-background-dashboard dark:bg-background-white-8">
                    <span className="text-color-black-50 dark:text-color-white-50 font-medium">
                      Họ và tên
                    </span>
                    <span className="font-semibold text-color-black-100 dark:text-color-white-90 text-right">
                      {displayName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-background-dashboard dark:bg-background-white-8">
                    <span className="text-color-black-50 dark:text-color-white-50 font-medium shrink-0">
                      Email
                    </span>
                    <span className="font-mono font-semibold text-color-black-100 dark:text-color-white-90 break-all text-right">
                      {userInfo.email || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-background-dashboard dark:bg-background-white-8">
                    <span className="text-color-black-50 dark:text-color-white-50 font-medium">
                      Ngày tham gia
                    </span>
                    <span className="font-mono font-semibold text-color-black-100 dark:text-color-white-90">
                      {formatDateDMY(
                        userInfo.created_at || userInfo.created_on,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-background-dashboard dark:bg-background-white-8">
                    <span className="text-color-black-50 dark:text-color-white-50 font-medium">
                      Xác thực OTP
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        userInfo.require_otp !== false
                          ? "bg-[#20A7C9]/15 text-[#20A7C9] dark:text-[#5bd6d8]"
                          : "bg-background-black-4 dark:bg-white/10 text-color-black-50 dark:text-color-white-50"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          userInfo.require_otp !== false
                            ? "bg-[#20A7C9]"
                            : "bg-gray-400"
                        }`}
                      />
                      {userInfo.require_otp !== false ? "Bắt buộc" : "Tắt"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-background-dashboard dark:bg-background-white-8">
                    <span className="text-color-black-50 dark:text-color-white-50 font-medium">
                      Đổi mật khẩu
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        userInfo.can_change_password !== false
                          ? "bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8]"
                          : "bg-color-error/15 text-color-error"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          userInfo.can_change_password !== false
                            ? "bg-[#7367f0]"
                            : "bg-color-error"
                        }`}
                      />
                      {userInfo.can_change_password !== false
                        ? "Cho phép"
                        : "Đã khóa"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="shine relative overflow-hidden inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
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
                        d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Sửa hồ sơ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenChangePassword}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                      userInfo.can_change_password !== false
                        ? "bg-background-dashboard dark:bg-background-white-8 hover:bg-[#7367f0]/15 hover:-translate-y-0.5 text-[#7367f0] dark:text-[#a59ff8] border-[#7367f0]/35"
                        : "bg-color-error/10 text-color-error border-color-error/30 opacity-65 cursor-not-allowed"
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Đổi mật khẩu</span>
                  </button>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: Groups & Accessible Dashboards */}
            <div className="lg:col-span-8 space-y-6">
              {/* Accessible Dashboards Section */}
              <section
                style={{ animationDelay: "90ms" }}
                className="animate-fade-up relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 sm:p-6 shadow-component"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] animate-gradient-shift" />

                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center">
                      <svg
                        className="w-4.5 h-4.5"
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
                    <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                      Báo cáo được cấp quyền
                    </h2>
                  </div>

                  <span className="animate-pop-in px-2.5 py-1 rounded-full text-xs font-bold bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8]">
                    {dashboards.length}
                  </span>
                </div>

                {dashboards.length === 0 ? (
                  <div className="p-8 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                    Chưa có báo cáo nào được cấp quyền.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dashboards.map((d, idx) => (
                      <Link
                        key={d.id}
                        to={d.path}
                        style={{
                          animationDelay: `${Math.min(idx * 50 + 120, 420)}ms`,
                        }}
                        className="shine animate-fade-up group relative overflow-hidden flex items-center justify-between gap-3 p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-color-neotam transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
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
                                d="M18 20V10M12 20V4M6 20v-6"
                              />
                            </svg>
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-color-black-100 dark:text-color-white-90 truncate group-hover:text-color-neotam dark:group-hover:text-[#5bd6d8] transition-colors">
                            {d.dashboard_title}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-color-neotam dark:text-[#5bd6d8] shrink-0 group-hover:translate-x-0.5 transition-transform">
                          Mở →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Groups Section */}
              <section
                style={{ animationDelay: "160ms" }}
                className="animate-fade-up relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 sm:p-6 shadow-component"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7367f0] to-[#9e95f5] animate-gradient-shift" />

                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-background-rating-percent dark:bg-[#7367f0]/20 text-color-rating-percent dark:text-[#a59ff8] flex items-center justify-center">
                      <svg
                        className="w-4.5 h-4.5"
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
                    <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                      Nhóm trực thuộc
                    </h2>
                  </div>

                  <span className="animate-pop-in px-2.5 py-1 rounded-full text-xs font-bold bg-background-rating-percent dark:bg-[#7367f0]/20 text-color-rating-percent dark:text-[#a59ff8]">
                    {groups.length}
                  </span>
                </div>

                {groups.length === 0 ? (
                  <div className="p-8 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                    Chưa tham gia nhóm nào.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groups.map((g, idx) => {
                      const roleCode = g.role_code || g.role_in_group || "";
                      const roleName = g.role_name || g.role_label || roleCode;
                      return (
                        <div
                          key={`${g.group_id}-${roleCode}-${idx}`}
                          style={{
                            animationDelay: `${Math.min(idx * 50 + 180, 480)}ms`,
                          }}
                          className="animate-fade-up flex items-center justify-between gap-3 p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#7367f0]/50 hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-color-black-100 dark:text-color-white-90 truncate">
                              {g.group_name}
                            </p>
                            {g.joined_at && (
                              <p className="text-[11px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                                {formatDateDMY(g.joined_at)}
                              </p>
                            )}
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border border-[#7367f0]/25 shrink-0">
                            {roleName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Modal Chỉnh sửa thông tin cá nhân */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl overflow-hidden animate-pop-in">
              <div className="h-1 bg-gradient-to-r from-[#20A7C9] via-[#2fc4c6] to-[#5bd6d8] animate-gradient-shift" />

              <div className="flex items-center justify-between px-6 py-4 border-b border-border-black-10 dark:border-background-white-15">
                <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                  Cập nhật hồ sơ
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (!profileSubmitting) setIsEditProfileOpen(false);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 dark:text-color-white-50 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                {profileErrors.form && (
                  <div className="p-3 rounded-xl bg-color-error/10 border border-color-error/25 text-color-error text-xs">
                    {profileErrors.form}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      Họ và tên đệm
                    </label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          first_name: e.target.value,
                        })
                      }
                      placeholder="Nguyễn Văn"
                      className="w-full px-3.5 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 text-xs sm:text-sm focus:outline-none focus:border-[#20A7C9] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      Tên
                    </label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          last_name: e.target.value,
                        })
                      }
                      placeholder="An"
                      className="w-full px-3.5 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 text-xs sm:text-sm focus:outline-none focus:border-[#20A7C9] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                    Email <span className="text-color-rating">*</span>
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm({
                        ...profileForm,
                        email: e.target.value,
                      });
                      if (profileErrors.email) {
                        setProfileErrors({ ...profileErrors, email: null });
                      }
                    }}
                    placeholder="name@vtv.vn"
                    className={`w-full px-3.5 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 text-xs sm:text-sm focus:outline-none transition ${
                      profileErrors.email
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-[#20A7C9]"
                    }`}
                  />
                  {profileErrors.email && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {profileErrors.email}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-black-10 dark:border-background-white-15">
                  <button
                    type="button"
                    disabled={profileSubmitting}
                    onClick={() => setIsEditProfileOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={profileSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {profileSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Đổi mật khẩu */}
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl overflow-hidden animate-pop-in">
              <div className="h-1 bg-gradient-to-r from-[#7367f0] via-[#887ef2] to-[#9e95f5] animate-gradient-shift" />

              <div className="flex items-center justify-between px-6 py-4 border-b border-border-black-10 dark:border-background-white-15">
                <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                  Đổi mật khẩu
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (!passwordSubmitting) setIsChangePasswordOpen(false);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 dark:text-color-white-50 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                {passwordErrors.form && (
                  <div className="p-3 rounded-xl bg-color-error/10 border border-color-error/25 text-color-error text-xs">
                    {passwordErrors.form}
                  </div>
                )}

                {[
                  {
                    key: "old_password",
                    label: "Mật khẩu hiện tại",
                    placeholder: "Nhập mật khẩu hiện tại",
                    show: showOldPassword,
                    toggle: () => setShowOldPassword(!showOldPassword),
                  },
                  {
                    key: "new_password",
                    label: "Mật khẩu mới",
                    placeholder: "Tối thiểu 8 ký tự",
                    show: showNewPassword,
                    toggle: () => setShowNewPassword(!showNewPassword),
                  },
                  {
                    key: "confirm_new_password",
                    label: "Xác nhận mật khẩu mới",
                    placeholder: "Nhập lại mật khẩu mới",
                    show: showConfirmPassword,
                    toggle: () => setShowConfirmPassword(!showConfirmPassword),
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      {field.label} <span className="text-color-rating">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={field.show ? "text" : "password"}
                        value={passwordForm[field.key]}
                        onChange={(e) => {
                          setPasswordForm({
                            ...passwordForm,
                            [field.key]: e.target.value,
                          });
                          if (passwordErrors[field.key]) {
                            setPasswordErrors({
                              ...passwordErrors,
                              [field.key]: null,
                            });
                          }
                        }}
                        placeholder={field.placeholder}
                        className={`w-full pl-3.5 pr-10 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 text-xs sm:text-sm focus:outline-none transition ${
                          passwordErrors[field.key]
                            ? "border-color-rating"
                            : "border-border-black-10 dark:border-background-white-15 focus:border-[#7367f0]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={field.toggle}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-white cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          {field.show ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                            />
                          ) : (
                            <>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                    {passwordErrors[field.key] && (
                      <p className="text-[11px] text-color-rating mt-1">
                        {passwordErrors[field.key]}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-black-10 dark:border-background-white-15">
                  <button
                    type="button"
                    disabled={passwordSubmitting}
                    onClick={() => setIsChangePasswordOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white shadow-xs hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {passwordSubmitting ? "Đang lưu..." : "Cập nhật"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <div className="px-4 sm:px-6 lg:px-8 pb-6 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
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
