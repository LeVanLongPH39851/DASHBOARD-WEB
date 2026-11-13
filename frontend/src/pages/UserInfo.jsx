import React, { useCallback, useEffect, useState } from "react";
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

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // State modal Chỉnh sửa thông tin cá nhân
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // State modal Đổi mật khẩu riêng
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
          "Không thể tải thông tin User Info",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Mở modal Chỉnh sửa thông tin
  const handleOpenEditProfile = () => {
    setProfileForm({
      first_name: userInfo?.first_name || "",
      last_name: userInfo?.last_name || "",
      email: userInfo?.email || "",
    });
    setProfileErrors({});
    setIsEditProfileOpen(true);
  };

  // Submit cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    const errors = {};
    const cleanEmail = (profileForm.email || "").trim();
    if (!cleanEmail) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Định dạng email không hợp lệ (ví dụ: name@example.com)";
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

      showToast(res?.message || "Cập nhật thông tin thành công!", "success");
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

  // Mở modal Đổi mật khẩu
  const handleOpenChangePassword = () => {
    if (userInfo?.can_change_password === false) {
      showToast(
        "Tài khoản của bạn đã bị khóa tính năng đổi mật khẩu. Vui lòng liên hệ quản trị viên.",
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

  // Submit đổi mật khẩu
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
    } else if (passwordForm.new_password !== passwordForm.confirm_new_password) {
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

      showToast(res?.message || "Đổi mật khẩu thành công!", "success");
      setIsChangePasswordOpen(false);
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể đổi mật khẩu";
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

  return (
    <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
      <Header username={userInfo?.username} />

      <main className="flex-1 px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4 w-full max-w-6xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 animate-pop-in duration-300">
            <div
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-semibold ${
                toast.type === "success"
                  ? "bg-gradient-to-r from-[#20A7C9]/95 to-[#2fc4c6]/95 text-white border-white/20 shadow-[0_8px_24px_rgba(32,167,201,0.35)]"
                  : "bg-gradient-to-r from-[#eb5757]/95 to-[#f87171]/95 text-white border-white/20 shadow-[0_8px_24px_rgba(235,87,87,0.35)]"
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

                  {/* Hành động & Status Badge */}
                  <div className="flex flex-wrap items-center gap-2.5">
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

                    {/* Nút Sửa thông tin cá nhân */}
                    <button
                      type="button"
                      onClick={handleOpenEditProfile}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-background-dashboard dark:bg-background-white-8 hover:bg-[#20A7C9]/15 text-[#20A7C9] dark:text-[#5bd6d8] border border-[#20A7C9]/35 hover:border-[#20A7C9] shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
                      title="Chỉnh sửa họ tên, email"
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
                      <span>Sửa thông tin</span>
                    </button>

                    {/* Nút Đổi mật khẩu riêng */}
                    <button
                      type="button"
                      onClick={handleOpenChangePassword}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border shadow-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                        userInfo.can_change_password !== false
                          ? "bg-background-dashboard dark:bg-background-white-8 hover:bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border-[#7367f0]/35 hover:border-[#7367f0] hover:shadow-sm"
                          : "bg-color-error/10 text-color-error border-color-error/30 opacity-70 cursor-not-allowed"
                      }`}
                      title={
                        userInfo.can_change_password !== false
                          ? "Đổi mật khẩu tài khoản"
                          : "Tài khoản hiện bị khóa tính năng đổi mật khẩu"
                      }
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>
                        {userInfo.can_change_password !== false
                          ? "Đổi mật khẩu"
                          : "Đổi MK (Bị khóa)"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Thông tin cơ bản & Quyền bảo mật */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                  {/* Họ và Tên */}
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </span>
                      <p className="text-xs font-medium text-color-black-50 dark:text-color-white-50">
                        Họ và Tên
                      </p>
                    </div>
                    <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90 truncate" title={`${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() || userInfo.full_name}>
                      {(`${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim()) || userInfo.full_name || "-"}
                    </p>
                  </div>

                  {/* Username */}
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
                    <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90 truncate">
                      @{userInfo.username}
                    </p>
                  </div>

                  {/* Email */}
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
                    <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90 break-all truncate" title={userInfo.email || "-"}>
                      {userInfo.email || "-"}
                    </p>
                  </div>

                  {/* Ngày tạo */}
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

                  {/* Vai trò hệ thống */}
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
                    <p className="text-sm font-bold text-color-neotam dark:text-[#5bd6d8] truncate" title={globalRoles.length > 0 ? globalRoles.join(", ") : "-"}>
                      {globalRoles.length > 0 ? globalRoles.join(", ") : "-"}
                    </p>
                  </div>

                  {/* Xác thực OTP khi đăng nhập */}
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </span>
                      <p className="text-xs font-medium text-color-black-50 dark:text-color-white-50">
                        Xác thực OTP
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        userInfo.require_otp !== false
                          ? "bg-[#20A7C9]/15 text-[#20A7C9] dark:text-[#5bd6d8]"
                          : "bg-color-black-10 dark:bg-white/10 text-color-black-60 dark:text-color-white-60"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          userInfo.require_otp !== false
                            ? "bg-[#20A7C9]"
                            : "bg-color-black-40 dark:bg-white/40"
                        }`}
                      />
                      {userInfo.require_otp !== false ? "Bắt buộc" : "Bỏ qua"}
                    </span>
                  </div>

                  {/* Quyền đổi mật khẩu */}
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
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <p className="text-xs font-medium text-color-black-50 dark:text-color-white-50">
                        Đổi mật khẩu
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
                        ? "Được phép"
                        : "Bị khóa"}
                    </span>
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

        {/* Modal Chỉnh sửa thông tin cá nhân */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg rounded-3xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl overflow-hidden animate-pop-in">
              {/* Header Modal */}
              <div className="relative p-6 border-b border-border-black-10 dark:border-background-white-15 bg-gradient-to-r from-[#20A7C9]/10 via-transparent to-[#7367f0]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#20A7C9] to-[#2fc4c6] text-white flex items-center justify-center shadow-md">
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
                          d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                        Chỉnh sửa thông tin cá nhân
                      </h3>
                      <p className="text-xs text-color-black-50 dark:text-color-white-50">
                        Cập nhật họ, tên và địa chỉ email
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!profileSubmitting) setIsEditProfileOpen(false);
                    }}
                    className="p-1.5 rounded-xl text-color-black-50 dark:text-color-white-50 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                {profileErrors.form && (
                  <div className="p-3.5 rounded-xl bg-color-error/10 border border-color-error/25 text-color-error text-xs flex items-center gap-2 animate-fade-in">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{profileErrors.form}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      Họ
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
                      placeholder="Ví dụ: Nguyễn Văn"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 text-sm focus:outline-none focus:border-[#20A7C9] dark:focus:border-[#5bd6d8] transition"
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
                      placeholder="Ví dụ: An"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 text-sm focus:outline-none focus:border-[#20A7C9] dark:focus:border-[#5bd6d8] transition"
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
                    placeholder="name@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 text-sm focus:outline-none transition ${
                      profileErrors.email
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-[#20A7C9] dark:focus:border-[#5bd6d8]"
                    }`}
                  />
                  {profileErrors.email && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {profileErrors.email}
                    </p>
                  )}
                  <p className="text-[11px] text-color-black-50 dark:text-color-white-50 mt-1">
                    Hệ thống sẽ tự động kiểm tra trùng email với các tài khoản khác.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-black-10 dark:border-background-white-15">
                  <button
                    type="button"
                    disabled={profileSubmitting}
                    onClick={() => setIsEditProfileOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-background-dashboard dark:bg-background-white-8 hover:bg-black/5 dark:hover:bg-white/10 text-color-black-70 dark:text-color-white-80 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={profileSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                  >
                    {profileSubmitting ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>Lưu thay đổi</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Đổi mật khẩu riêng */}
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg rounded-3xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl overflow-hidden animate-pop-in">
              {/* Header Modal */}
              <div className="relative p-6 border-b border-border-black-10 dark:border-background-white-15 bg-gradient-to-r from-[#7367f0]/10 via-transparent to-[#9e95f5]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7367f0] to-[#9e95f5] text-white flex items-center justify-center shadow-md">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                        Đổi mật khẩu tài khoản
                      </h3>
                      <p className="text-xs text-color-black-50 dark:text-color-white-50">
                        Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!passwordSubmitting) setIsChangePasswordOpen(false);
                    }}
                    className="p-1.5 rounded-xl text-color-black-50 dark:text-color-white-50 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                {passwordErrors.form && (
                  <div className="p-3.5 rounded-xl bg-color-error/10 border border-color-error/25 text-color-error text-xs flex items-center gap-2 animate-fade-in">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{passwordErrors.form}</span>
                  </div>
                )}

                {/* Mật khẩu cũ */}
                <div>
                  <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                    Mật khẩu hiện tại <span className="text-color-rating">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={passwordForm.old_password}
                      onChange={(e) => {
                        setPasswordForm({
                          ...passwordForm,
                          old_password: e.target.value,
                        });
                        if (passwordErrors.old_password) {
                          setPasswordErrors({
                            ...passwordErrors,
                            old_password: null,
                          });
                        }
                      }}
                      placeholder="Nhập mật khẩu hiện tại..."
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 text-sm focus:outline-none transition ${
                        passwordErrors.old_password
                          ? "border-color-rating"
                          : "border-border-black-10 dark:border-background-white-15 focus:border-[#7367f0] dark:focus:border-[#a59ff8]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-white transition cursor-pointer"
                    >
                      {showOldPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.old_password && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {passwordErrors.old_password}
                    </p>
                  )}
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                    Mật khẩu mới <span className="text-color-rating">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => {
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        });
                        if (passwordErrors.new_password) {
                          setPasswordErrors({
                            ...passwordErrors,
                            new_password: null,
                          });
                        }
                      }}
                      placeholder="Tối thiểu 8 ký tự..."
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 text-sm focus:outline-none transition ${
                        passwordErrors.new_password
                          ? "border-color-rating"
                          : "border-border-black-10 dark:border-background-white-15 focus:border-[#7367f0] dark:focus:border-[#a59ff8]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-white transition cursor-pointer"
                    >
                      {showNewPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.new_password && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {passwordErrors.new_password}
                    </p>
                  )}
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div>
                  <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                    Xác nhận mật khẩu mới <span className="text-color-rating">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirm_new_password}
                      onChange={(e) => {
                        setPasswordForm({
                          ...passwordForm,
                          confirm_new_password: e.target.value,
                        });
                        if (passwordErrors.confirm_new_password) {
                          setPasswordErrors({
                            ...passwordErrors,
                            confirm_new_password: null,
                          });
                        }
                      }}
                      placeholder="Nhập lại mật khẩu mới..."
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 text-sm focus:outline-none transition ${
                        passwordErrors.confirm_new_password
                          ? "border-color-rating"
                          : "border-border-black-10 dark:border-background-white-15 focus:border-[#7367f0] dark:focus:border-[#a59ff8]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-white transition cursor-pointer"
                    >
                      {showConfirmPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirm_new_password && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {passwordErrors.confirm_new_password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-black-10 dark:border-background-white-15">
                  <button
                    type="button"
                    disabled={passwordSubmitting}
                    onClick={() => setIsChangePasswordOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-background-dashboard dark:bg-background-white-8 hover:bg-black/5 dark:hover:bg-white/10 text-color-black-70 dark:text-color-white-80 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                  >
                    {passwordSubmitting ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <span>Cập nhật mật khẩu</span>
                    )}
                  </button>
                </div>
              </form>
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
