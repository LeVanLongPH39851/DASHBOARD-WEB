import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layouts/headers/Header";
import Footer from "../components/layouts/footers/Footer";
import Loading from "../components/commons/Loading";
import { DashboardFilterProvider } from "../context/DashboardFilterContext";
import {
  createManagedUser,
  deleteManagedUser,
  getManageableRoles,
  getManagedUserDetail,
  getManagedUsers,
  updateManagedUser,
} from "../services/authService";

function formatDateDMY(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getInitials(firstName, lastName, username) {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  if (f && l) {
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
  }
  const name = (l || f || username || "U").trim();
  return name.slice(0, 2).toUpperCase();
}

function getRoleBadge(roleCode, roleName) {
  const code = String(roleCode || "").toLowerCase();
  const label = roleName || roleCode || "Thành viên";

  if (code === "admin_ami") {
    return {
      label,
      classes:
        "bg-background-rating dark:bg-[#eb5757]/15 text-color-rating dark:text-[#f87171] border-[#eb5757]/30",
      dot: "bg-color-rating dark:bg-[#f87171]",
    };
  }
  if (code === "super_admin") {
    return {
      label,
      classes:
        "bg-background-rating-percent dark:bg-[#7367f0]/15 text-color-rating-percent dark:text-[#a59ff8] border-[#7367f0]/30",
      dot: "bg-color-rating-percent dark:bg-[#a59ff8]",
    };
  }
  if (code === "group_admin") {
    return {
      label,
      classes:
        "bg-background-ave-reach dark:bg-[#21b8b8]/15 text-color-ave-reach dark:text-[#5bd6d8] border-[#21b8b8]/30",
      dot: "bg-color-ave-reach dark:bg-[#5bd6d8]",
    };
  }
  return {
    label,
    classes:
      "bg-background-ave-reach-percent dark:bg-[#f2994a]/15 text-color-ave-reach-percent dark:text-[#f6b26b] border-[#f2994a]/30",
    dot: "bg-color-ave-reach-percent dark:bg-[#f6b26b]",
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_REGEX = /^[A-Za-z0-9._@-]{3,64}$/;

const UsersManagementContent = () => {
  // Data states
  const [users, setUsers] = useState([]);
  const [actorRole, setActorRole] = useState(null);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals state
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [targetUser, setTargetUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    role_id: "",
    active: true,
    password: "",
    confirm_password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch dữ liệu người dùng trong bảng user_global_roles
  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError("");

      const [usersRes, rolesRes] = await Promise.all([
        getManagedUsers(),
        getManageableRoles(),
      ]);

      if (usersRes?.status === "success") {
        setUsers(usersRes.users || []);
        setActorRole(usersRes.actorRole || null);
        setIsSystemAdmin(Boolean(usersRes.isSystemAdmin));
      }

      if (rolesRes?.status === "success") {
        setRoleOptions(rolesRes.roles || []);
      }
    } catch (err) {
      console.error("[Users Fetch Error]", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách người dùng",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lọc danh sách users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (statusFilter === "active") {
      result = result.filter((u) => u.active === true);
    } else if (statusFilter === "inactive") {
      result = result.filter((u) => u.active === false);
    }

    if (roleFilter !== "all") {
      result = result.filter(
        (u) =>
          String(u.role_code || "").toLowerCase() === roleFilter.toLowerCase(),
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((u) => {
        const fullName =
          `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        const username = String(u.username || "").toLowerCase();
        const email = String(u.email || "").toLowerCase();
        return (
          fullName.includes(q) ||
          username.includes(q) ||
          email.includes(q) ||
          String(u.id).includes(q)
        );
      });
    }

    return result;
  }, [users, statusFilter, roleFilter, searchTerm]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.active === true).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  // Xem chi tiết user
  const handleOpenDetail = async (user) => {
    setDetailUser(user);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await getManagedUserDetail(user.id);
      const fullUser = res?.user?.user || res?.user || res?.data?.user;
      if (fullUser) {
        setDetailUser((prev) => ({
          ...prev,
          ...fullUser,
        }));
      }
    } catch (err) {
      console.warn("Could not load full user detail", err);
      showToast(
        err.response?.data?.message ||
          "Không thể tải đầy đủ chi tiết metadata người dùng",
        "error",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Mở modal Thêm user
  const handleOpenAdd = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      role_id: roleOptions[0]?.id ? String(roleOptions[0].id) : "",
      active: true,
      password: "",
      confirm_password: "",
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAddModal(true);
  };

  // Mở modal Sửa user
  const handleOpenEdit = (user) => {
    if (!user.can_manage) {
      showToast(
        user.cannot_manage_reason === "admin_ami_peer" || user.is_admin_ami
          ? "Các Admin AMI không thể quản trị lẫn nhau"
          : "Bạn không có quyền quản lý người dùng này",
        "error",
      );
      return;
    }
    setTargetUser(user);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      role_id: user.role_id ? String(user.role_id) : "",
      active: Boolean(user.active),
      password: "",
      confirm_password: "",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Mở modal Xóa user
  const handleOpenDelete = (user) => {
    if (!user.can_manage) {
      showToast(
        user.cannot_manage_reason === "admin_ami_peer" || user.is_admin_ami
          ? "Các Admin AMI không thể quản trị lẫn nhau"
          : "Bạn không có quyền quản lý người dùng này",
        "error",
      );
      return;
    }
    setTargetUser(user);
    setShowDeleteModal(true);
  };

  // Validate form
  const validateForm = (isEdit = false) => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "Vui lòng nhập họ và tên đệm";
    } else if (formData.first_name.length > 64) {
      errors.first_name = "Họ không được vượt quá 64 ký tự";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Vui lòng nhập tên";
    } else if (formData.last_name.length > 64) {
      errors.last_name = "Tên không được vượt quá 64 ký tự";
    }

    if (!formData.username.trim()) {
      errors.username = "Vui lòng nhập username";
    } else if (!USERNAME_REGEX.test(formData.username.trim())) {
      errors.username = "Username phải từ 3-64 ký tự (chữ, số, ., _, @, -)";
    }

    if (!formData.email.trim()) {
      errors.email = "Vui lòng nhập địa chỉ email";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = "Định dạng email không hợp lệ";
    }

    if (!formData.role_id) {
      errors.role_id = "Vui lòng chọn vai trò (Role)";
    }

    if (!isEdit) {
      if (!formData.password) {
        errors.password = "Vui lòng nhập mật khẩu";
      } else if (formData.password.length < 6) {
        errors.password = "Mật khẩu phải có tối thiểu 6 ký tự";
      }

      if (!formData.confirm_password) {
        errors.confirm_password = "Vui lòng xác nhận mật khẩu";
      } else if (formData.password !== formData.confirm_password) {
        errors.confirm_password = "Mật khẩu xác nhận không khớp";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Tạo User
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    try {
      setFormSubmitting(true);
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        role_id: Number(formData.role_id),
        active: Boolean(formData.active),
        password: formData.password,
        confirm_password: formData.confirm_password,
      };

      const res = await createManagedUser(payload);
      if (res?.status === "success") {
        showToast(`Tạo tài khoản "${payload.username}" thành công!`, "success");
        setShowAddModal(false);
        fetchData(true);
      }
    } catch (err) {
      console.error("[Create User Error]", err);
      const serverFieldErrors = err.response?.data?.fieldErrors;
      if (serverFieldErrors) {
        setFormErrors((prev) => ({ ...prev, ...serverFieldErrors }));
      }
      showToast(
        err.response?.data?.message || "Không thể tạo người dùng mới",
        "error",
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Cập nhật User
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!targetUser) return;
    if (!targetUser.can_manage) {
      showToast(
        targetUser.cannot_manage_reason === "admin_ami_peer" || targetUser.is_admin_ami
          ? "Các Admin AMI không thể quản trị lẫn nhau"
          : "Bạn không có quyền quản lý người dùng này",
        "error",
      );
      return;
    }
    if (!validateForm(true)) return;

    try {
      setFormSubmitting(true);
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        role_id: Number(formData.role_id),
        active: Boolean(formData.active),
      };

      const res = await updateManagedUser(targetUser.id, payload);
      if (res?.status === "success") {
        showToast(
          `Cập nhật tài khoản "${payload.username}" thành công!`,
          "success",
        );
        setShowEditModal(false);
        fetchData(true);
      }
    } catch (err) {
      console.error("[Update User Error]", err);
      const serverFieldErrors = err.response?.data?.fieldErrors;
      if (serverFieldErrors) {
        setFormErrors((prev) => ({ ...prev, ...serverFieldErrors }));
      }
      showToast(
        err.response?.data?.message || "Không thể cập nhật người dùng",
        "error",
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Xóa User
  const handleConfirmDelete = async () => {
    if (!targetUser) return;
    if (!targetUser.can_manage) {
      showToast(
        targetUser.cannot_manage_reason === "admin_ami_peer" || targetUser.is_admin_ami
          ? "Các Admin AMI không thể quản trị lẫn nhau"
          : "Bạn không có quyền quản lý người dùng này",
        "error",
      );
      return;
    }
    try {
      setFormSubmitting(true);
      const res = await deleteManagedUser(targetUser.id);
      if (res?.status === "success") {
        showToast(`Đã xóa tài khoản "${targetUser.username}"!`, "success");
        setShowDeleteModal(false);
        setTargetUser(null);
        fetchData(true);
      }
    } catch (err) {
      console.error("[Delete User Error]", err);
      showToast(
        err.response?.data?.message || "Không thể xóa người dùng này",
        "error",
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-family-be-vietnam-pro">
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

      {/* Breadcrumb đồng bộ với theme */}
      <div
        style={{ animationDelay: "60ms" }}
        className="animate-fade-up flex items-center gap-2 text-xs text-color-black-50 dark:text-color-white-50"
      >
        <Link
          to="/dashboard"
          className="hover:text-color-neotam dark:hover:text-[#5bd6d8] transition cursor-pointer"
        >
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          to="/role-permission"
          className="hover:text-color-neotam dark:hover:text-[#5bd6d8] transition cursor-pointer"
        >
          Role and Permission
        </Link>
        <span>/</span>
        <span className="font-bold text-color-black-100 dark:text-color-white-90">
          Quản lý Users
        </span>
      </div>

      {/* Hero Header Banner phong cách đồng bộ UserInfo & RolePermission */}
      <div
        style={{ animationDelay: "120ms" }}
        className="animate-fade-up shine-auto relative overflow-hidden rounded-3xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-md"
      >
        {/* Cover gradient & texture */}
        <div className="relative h-32 max-md:h-28 w-full overflow-hidden bg-gradient-to-r from-[#20A7C9]/25 via-[#7367f0]/20 to-[#f2994a]/25 animate-gradient-shift">
          <div className="absolute inset-0 bg-[radial-gradient(#20A7C9_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full bg-[#20A7C9]/30 blur-3xl pointer-events-none animate-float-slow" />
          <div className="absolute -bottom-12 -right-12 w-52 h-52 rounded-full bg-[#7367f0]/30 blur-3xl pointer-events-none animate-float-slow [animation-delay:3s]" />

          {/* Badge pills góc trên bên phải cover */}
          <div className="relative z-10 p-4 max-md:p-3 flex items-center justify-end gap-2">
            <span
              style={{ animationDelay: "180ms" }}
              className="animate-pop-in inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/25 dark:border-white/10 text-color-black-100 dark:text-white text-[11px] font-semibold hover:scale-105 transition-transform"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0cb7a9] animate-pulse" />
              User Global Roles
            </span>
            <span
              style={{ animationDelay: "260ms" }}
              className="animate-pop-in inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/25 dark:border-white/10 text-color-black-100 dark:text-white text-[11px] font-bold hover:scale-105 transition-transform"
            >
              {isSystemAdmin ? "System Admin" : actorRole?.role_name || "Admin"}
            </span>
          </div>
        </div>

        {/* Nội dung Banner: Title, mô tả, nút action và các thẻ thống kê */}
        <div className="relative z-10 px-6 max-md:px-4 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-6 border-b border-border-black-10 dark:border-background-white-15">
            <div className="flex items-end gap-4.5">
              {/* Avatar nổi lên dải cover với viền gradient xoay nhẹ */}
              <div className="group/avatar relative -mt-10 max-md:-mt-8 shrink-0">
                <div className="relative w-20 h-20 max-md:w-16 max-md:h-16 rounded-2xl p-[3px] shadow-xl overflow-hidden bg-background-light dark:bg-background-chart-dark transition-transform duration-300 group-hover/avatar:scale-105">
                  <div className="pointer-events-none absolute -inset-1/2 bg-[conic-gradient(from_0deg,#20A7C9,#7367f0,#f2994a,#2fc4c6,#20A7C9)] animate-spin-slow opacity-90" />
                  <div className="relative w-full h-full rounded-[13px] bg-background-light dark:bg-background-dark flex items-center justify-center transition-transform duration-300 group-hover/avatar:scale-95">
                    <svg
                      className="w-9 h-9 text-[#20A7C9] dark:text-[#5bd6d8] transition-transform duration-300 group-hover/avatar:rotate-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 3-3.87m0 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm8-4a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tên tiêu đề và mô tả */}
              <div className="pt-2 pb-0.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl max-md:text-xl font-bold text-color-black-100 dark:text-color-white-90 tracking-tight">
                    Quản lý Người dùng
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] border border-[#21b8b8]/30">
                    user_global_roles only
                  </span>
                </div>
                <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-1 max-w-xl">
                  {isSystemAdmin
                    ? "Hiển thị và quản lý tất cả các tài khoản người dùng có trong bảng phân quyền hệ thống (user_global_roles)."
                    : "Chỉ hiển thị và quản lý các tài khoản người dùng trong user_global_roles do chính bạn tạo."}
                </p>
              </div>
            </div>

            {/* Các nút hành động chính */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                title="Làm mới danh sách"
                className="group/refresh inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-dark hover:bg-background-dashboard dark:hover:bg-background-white-8 text-color-black-70 dark:text-color-white-80 text-xs font-semibold shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-500 group-hover/refresh:rotate-180 ${refreshing ? "animate-spin text-[#20A7C9]" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Làm mới</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="shine inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#20A7C9] via-[#2fc4c6] to-[#5bd6d8] hover:from-[#1b8da9] hover:to-[#20A7C9] text-white text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span>Thêm User Mới</span>
              </button>
            </div>
          </div>

          {/* 3 Thẻ thống kê số lượng với staggered animation và hover lift */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              style={{ animationDelay: "180ms" }}
              className="animate-fade-up group/stat flex items-center gap-3.5 p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-8 hover:border-[#20A7C9]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center shrink-0 shadow-2xs group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-transform duration-300">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                  Tổng Users Quản Lý
                </p>
                <p className="text-xl font-extrabold text-color-black-100 dark:text-color-white-90 mt-0.5">
                  {stats.total}
                </p>
              </div>
            </div>

            <div
              style={{ animationDelay: "240ms" }}
              className="animate-fade-up group/stat flex items-center gap-3.5 p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-8 hover:border-[#0cb7a9]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-background-succes-type-1 dark:bg-background-succes-type-1-dark text-color-neotam dark:text-[#5bd6d8] flex items-center justify-center shrink-0 shadow-2xs group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-transform duration-300">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                  Đang Hoạt Động (Active)
                </p>
                <p className="text-xl font-extrabold text-color-neotam dark:text-[#5bd6d8] mt-0.5">
                  {stats.active}
                </p>
              </div>
            </div>

            <div
              style={{ animationDelay: "300ms" }}
              className="animate-fade-up group/stat flex items-center gap-3.5 p-4 rounded-2xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-8 hover:border-[#eb5757]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-background-rating dark:bg-[#eb5757]/20 text-color-rating dark:text-[#f87171] flex items-center justify-center shrink-0 shadow-2xs group-hover/stat:scale-110 group-hover/stat:-rotate-3 transition-transform duration-300">
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                  Tạm Khóa (Inactive)
                </p>
                <p className="text-xl font-extrabold text-color-rating dark:text-[#f87171] mt-0.5">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Tìm kiếm & Lọc theo phong cách theme */}
      <div
        style={{ animationDelay: "240ms" }}
        className="animate-fade-up flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-sm"
      >
        {/* Thanh tìm kiếm */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-color-black-50 dark:text-color-white-50">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo username, họ tên, email hoặc ID..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-background-dashboard dark:bg-background-dashboard-dark border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 focus:outline-none focus:border-color-neotam dark:focus:border-[#5bd6d8] transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Lọc trạng thái & Role */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick pills trạng thái */}
          <div className="flex items-center p-1 rounded-xl bg-background-dashboard dark:bg-background-dashboard-dark border border-border-black-10 dark:border-background-white-15">
            {[
              { id: "all", label: "Tất cả" },
              { id: "active", label: "Hoạt động" },
              { id: "inactive", label: "Đã khóa" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  statusFilter === st.id
                    ? "bg-background-light dark:bg-background-chart-dark text-color-neotam dark:text-[#5bd6d8] shadow-xs"
                    : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Lọc Role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 focus:outline-none focus:border-color-neotam dark:focus:border-[#5bd6d8] cursor-pointer"
          >
            <option value="all" className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
              Tất cả vai trò
            </option>
            <option value="admin_ami" className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
              Admin AMI
            </option>
            <option value="super_admin" className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
              Super Admin
            </option>
            <option value="group_admin" className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
              Group Admin
            </option>
            <option value="group_member" className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
              Thành viên
            </option>
          </select>

          {(searchTerm || statusFilter !== "all" || roleFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRoleFilter("all");
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Lỗi cảnh báo nếu có */}
      {error && (
        <div className="p-4 rounded-2xl bg-background-rating dark:bg-[#eb5757]/15 border border-[#eb5757]/30 text-color-rating dark:text-[#f87171] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => fetchData()}
            className="text-xs font-bold underline hover:no-underline cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Bảng danh sách Users */}
      <div
        style={{ animationDelay: "320ms" }}
        className="animate-fade-up rounded-3xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-md overflow-hidden"
      >
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loading />
            <p className="mt-3 text-xs text-color-black-50 dark:text-color-white-50 font-medium animate-pulse">
              Đang tải danh sách người dùng trong bảng user_global_roles...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4 animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center mb-4 animate-float-slow">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
              Không tìm thấy người dùng phù hợp
            </h3>
            <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-1 max-w-sm">
              {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                ? "Thử thay đổi từ khóa hoặc điều kiện lọc để hiển thị kết quả."
                : "Chưa có người dùng nào được cấp quyền trong bảng user_global_roles."}
            </p>
            {searchTerm || statusFilter !== "all" || roleFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setRoleFilter("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-color-neotam dark:text-[#5bd6d8] bg-background-ave-reach dark:bg-[#21b8b8]/15 hover:bg-[#21b8b8]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="shine mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] hover:from-[#1b8da9] hover:to-[#20A7C9] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                + Thêm User Mới
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background-dashboard/90 dark:bg-background-chart-dark/90 text-color-black-50 dark:text-color-white-50 uppercase tracking-wider border-b border-border-black-10 dark:border-background-white-15">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Người Dùng
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Vai Trò (Role)
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Trạng Thái
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Người Tạo
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Ngày Tạo
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold text-right">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-black-10/70 dark:divide-background-white-8">
                {filteredUsers.map((user, idx) => {
                  const initials = getInitials(
                    user.first_name,
                    user.last_name,
                    user.username,
                  );
                  const fullName =
                    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    user.username;
                  const roleBadge = getRoleBadge(
                    user.role_code,
                    user.role_name,
                  );

                  return (
                    <tr
                      key={user.id}
                      style={{
                        animationDelay: `${Math.min(idx * 30 + 360, 950)}ms`,
                      }}
                      className="animate-fade-up group/row hover:bg-background-dashboard/90 dark:hover:bg-background-white-8/60 transition-all duration-200"
                    >
                      {/* Cột 1: Người dùng & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br from-[#20A7C9] to-[#7367f0] text-white shadow-xs group-hover/row:scale-110 group-hover/row:shadow-md transition-all duration-300">
                              {initials}
                            </div>
                            <span
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background-light dark:border-background-chart-dark ${
                                user.active ? "bg-[#0cb7a9]" : "bg-color-error"
                              }`}
                              title={
                                user.active ? "Đang hoạt động" : "Tạm khóa"
                              }
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-color-black-100 dark:text-color-white-90 text-sm group-hover/row:text-color-neotam dark:group-hover/row:text-[#5bd6d8] transition-colors">
                                {fullName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-background-dashboard dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50 border border-border-black-10 dark:border-background-white-15">
                                #{user.id}
                              </span>
                            </div>
                            <p className="text-[11px] text-color-black-50 dark:text-color-white-50 font-mono">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-color-black-70 dark:text-color-white-80">
                          <svg
                            className="w-3.5 h-3.5 text-color-black-50 dark:text-color-white-50 shrink-0 group-hover/row:text-[#20A7C9] dark:group-hover/row:text-[#5bd6d8] transition-colors"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-mono text-xs">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* Cột 3: Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadge.classes} group-hover/row:scale-105 transition-transform duration-200`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${roleBadge.dot}`}
                          />
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Cột 4: Trạng thái */}
                      <td className="px-6 py-4">
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-succes-type-1 dark:bg-background-succes-type-1-dark text-color-neotam dark:text-[#5bd6d8] border border-[#21b8b8]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0cb7a9] animate-pulse" />
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-rating dark:bg-[#eb5757]/15 text-color-rating dark:text-[#f87171] border border-[#eb5757]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-color-rating" />
                            Đã khóa
                          </span>
                        )}
                      </td>

                      {/* Cột 5: Người tạo */}
                      <td className="px-6 py-4 text-xs text-color-black-70 dark:text-color-white-80">
                        {user.assigned_by_username || user.created_by_name ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-color-black-100 dark:text-color-white-90">
                              {user.created_by_name ||
                                user.assigned_by_username}
                            </span>
                            {user.created_by_username && (
                              <span className="text-[11px] text-color-black-50 dark:text-color-white-50 font-mono">
                                @{user.created_by_username}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-color-black-50 dark:text-color-white-50 italic">
                            Hệ thống
                          </span>
                        )}
                      </td>

                      {/* Cột 6: Ngày tạo */}
                      <td className="px-6 py-4 text-xs text-color-black-50 dark:text-color-white-50 font-mono whitespace-nowrap">
                        {formatDateDMY(user.created_on)}
                      </td>

                      {/* Cột 7: Hành động */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Nút Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(user)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-color-ave-reach dark:text-[#5bd6d8] hover:bg-background-ave-reach dark:hover:bg-[#21b8b8]/20 hover:scale-120 active:scale-90 transition-all duration-200 cursor-pointer shadow-2xs"
                            title="Xem chi tiết metadata"
                          >
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
                          </button>

                          {/* Nút Sửa & Xóa: chỉ hiển thị khi can_manage === true */}
                          {user.can_manage ? (
                            <>
                              {/* Nút Sửa */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(user)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-rating-percent dark:text-[#a59ff8] hover:bg-background-rating-percent dark:hover:bg-[#7367f0]/20 hover:scale-120 active:scale-90 transition-all duration-200 cursor-pointer shadow-2xs"
                                title="Chỉnh sửa thông tin"
                              >
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>

                              {/* Nút Xóa */}
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(user)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-rating dark:text-[#f87171] hover:bg-background-rating dark:hover:bg-[#eb5757]/20 hover:scale-120 active:scale-90 transition-all duration-200 cursor-pointer shadow-2xs"
                                title="Xóa người dùng"
                              >
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-background-black-4 dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50 border border-border-black-10 dark:border-background-white-15 select-none"
                              title={
                                user.cannot_manage_reason === "self"
                                  ? "Tài khoản của bạn (không thể tự sửa/xóa)"
                                  : user.cannot_manage_reason === "admin_ami_peer" || user.is_admin_ami
                                    ? "Các Admin AMI không thể quản trị lẫn nhau"
                                    : "Chỉ xem"
                              }
                            >
                              {user.cannot_manage_reason === "self"
                                ? "Bạn"
                                : user.cannot_manage_reason === "admin_ami_peer" || user.is_admin_ami
                                  ? "Admin AMI"
                                  : "Chỉ xem"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer bảng */}
        <div className="px-6 py-3.5 bg-background-dashboard/80 dark:bg-background-chart-dark/80 border-t border-border-black-10 dark:border-background-white-15 flex items-center justify-between text-xs text-color-black-50 dark:text-color-white-50">
          <span>
            Hiển thị <strong>{filteredUsers.length}</strong> /{" "}
            <strong>{users.length}</strong> người dùng trong user_global_roles
          </span>
          <span className="font-mono text-[11px]">
            VTV Ratings Identity System
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: XEM CHI TIẾT USER                                  */}
      {/* ============================================================ */}
      {showDetailModal && detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-xl rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#f2994a]" />

            {/* Header Modal */}
            <div className="flex items-center justify-between gap-3 mb-4 pt-1 border-b border-border-black-10 dark:border-background-white-15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-br from-[#20A7C9] to-[#7367f0] text-white shadow-xs">
                  {getInitials(
                    detailUser.first_name,
                    detailUser.last_name,
                    detailUser.username,
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                    {`${detailUser.first_name || ""} ${detailUser.last_name || ""}`.trim() ||
                      detailUser.username}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-color-neotam dark:text-[#5bd6d8] font-bold">
                      @{detailUser.username}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-background-dashboard dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50 border border-border-black-10 dark:border-background-white-15">
                      ID #{detailUser.id}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto space-y-4 flex-1 text-xs pr-1">
              {/* Thông tin cơ bản */}
              <div className="p-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-3">
                <h4 className="text-[11px] font-bold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                  Thông Tin Cơ Bản
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Họ và Tên
                    </span>
                    <p className="font-bold text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {detailUser.first_name} {detailUser.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Username
                    </span>
                    <p className="font-mono font-bold text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {detailUser.username}
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Email
                    </span>
                    <p className="font-mono text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {detailUser.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Trạng thái
                    </span>
                    <div className="mt-0.5">
                      {detailUser.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-background-succes-type-1 dark:bg-background-succes-type-1-dark text-color-neotam dark:text-[#5bd6d8]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0cb7a9]" />
                          Hoạt động (Active)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-background-rating dark:bg-[#eb5757]/15 text-color-rating dark:text-[#f87171]">
                          <span className="w-1.5 h-1.5 rounded-full bg-color-rating" />
                          Đã khóa (Inactive)
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Vai trò (Role)
                    </span>
                    <p className="font-bold text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {detailUser.role_name || detailUser.role_code || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Mật khẩu
                    </span>
                    <p className="font-mono text-[11px] text-color-black-50 dark:text-color-white-50 mt-0.5 italic">
                      •••••••••••• (Mã hóa scrypt Werkzeug)
                    </p>
                  </div>
                </div>
              </div>

              {/* Lịch sử hoạt động */}
              <div className="p-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-3">
                <h4 className="text-[11px] font-bold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                  Hoạt Động & Đăng Nhập
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Lần đăng nhập cuối
                    </span>
                    <p className="font-mono text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {formatDateDMY(detailUser.last_login)}
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Đăng nhập thành công
                    </span>
                    <p className="font-bold text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {detailUser.login_count ?? 0} lần
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Đăng nhập thất bại
                    </span>
                    <p className="font-bold text-color-rating dark:text-[#f87171] mt-0.5">
                      {detailUser.fail_login_count ?? 0} lần
                    </p>
                  </div>
                </div>
              </div>

              {/* Khởi tạo & Cập nhật */}
              <div className="p-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-3">
                <h4 className="text-[11px] font-bold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                  Khởi Tạo & Cập Nhật
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Ngày tạo (created_on)
                    </span>
                    <p className="font-mono text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {formatDateDMY(detailUser.created_on)}
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Người tạo (assigned_by)
                    </span>
                    <p className="font-semibold text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {detailUser.created_by_name ||
                        detailUser.assigned_by_username ||
                        "Hệ thống"}
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Lần đổi cuối (changed_on)
                    </span>
                    <p className="font-mono text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {formatDateDMY(detailUser.changed_on)}
                    </p>
                  </div>
                  <div>
                    <span className="text-color-black-50 dark:text-color-white-50">
                      Người đổi (changed_by_fk)
                    </span>
                    <p className="font-mono text-color-black-100 dark:text-color-white-90 mt-0.5">
                      {detailUser.changed_by_fk
                        ? `#${detailUser.changed_by_fk}`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Danh sách Group đang tham gia */}
              {Array.isArray(detailUser.groups) &&
                detailUser.groups.length > 0 && (
                  <div className="p-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-3">
                    <h4 className="text-[11px] font-bold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                      Các Group Đang Tham Gia ({detailUser.groups.length})
                    </h4>
                    <div className="space-y-2">
                      {detailUser.groups.map((g, idx) => (
                        <div
                          key={g.group_id || g.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0cb7a9]" />
                            <span className="font-bold text-color-black-100 dark:text-color-white-90">
                              {g.group_name}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-background-dashboard dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80">
                            {g.role_name || g.role_code || "Member"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-border-black-10 dark:border-background-white-15 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 text-xs font-semibold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: THÊM USER MỚI                                      */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-lg rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl max-h-[92vh] flex flex-col">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20A7C9] via-[#2fc4c6] to-[#5bd6d8] animate-gradient-shift" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-3 pt-1 border-b border-border-black-10 dark:border-background-white-15 pb-3">
              <div>
                <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                  Thêm Người Dùng Mới
                </h3>
                <p className="text-[11px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                  Tài khoản sẽ được tạo trong Superset và gán quyền trong
                  user_global_roles
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmitAdd}
              className="overflow-y-auto space-y-3.5 flex-1 pr-1 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Họ và tên đệm <span className="text-color-rating">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => {
                      setFormData({ ...formData, first_name: e.target.value });
                      if (formErrors.first_name)
                        setFormErrors({ ...formErrors, first_name: null });
                    }}
                    placeholder="Nguyễn Văn"
                    className={`w-full px-3 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 focus:outline-none transition ${
                      formErrors.first_name
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam dark:focus:border-[#5bd6d8]"
                    }`}
                  />
                  {formErrors.first_name && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Tên <span className="text-color-rating">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => {
                      setFormData({ ...formData, last_name: e.target.value });
                      if (formErrors.last_name)
                        setFormErrors({ ...formErrors, last_name: null });
                    }}
                    placeholder="An"
                    className={`w-full px-3 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 focus:outline-none transition ${
                      formErrors.last_name
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam dark:focus:border-[#5bd6d8]"
                    }`}
                  />
                  {formErrors.last_name && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                  Tên đăng nhập (Username){" "}
                  <span className="text-color-rating">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-color-black-50 dark:text-color-white-50 font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      if (formErrors.username)
                        setFormErrors({ ...formErrors, username: null });
                    }}
                    placeholder="nguyenvanan"
                    className={`w-full pl-7 pr-3 py-2 rounded-xl font-mono bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 focus:outline-none transition ${
                      formErrors.username
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam dark:focus:border-[#5bd6d8]"
                    }`}
                  />
                </div>
                {formErrors.username ? (
                  <p className="text-[11px] text-color-rating mt-1">
                    {formErrors.username}
                  </p>
                ) : (
                  <p className="text-[10px] text-color-black-50 dark:text-color-white-50 mt-1">
                    Chữ cái, số, dấu chấm, gạch dưới, gạch ngang, 3-64 ký tự
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                  Địa chỉ Email <span className="text-color-rating">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email)
                      setFormErrors({ ...formErrors, email: null });
                  }}
                  placeholder="user@vtv.vn"
                  className={`w-full px-3 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 focus:outline-none transition ${
                    formErrors.email
                      ? "border-color-rating"
                      : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam dark:focus:border-[#5bd6d8]"
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-color-rating mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Vai trò (Role) <span className="text-color-rating">*</span>
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => {
                      setFormData({ ...formData, role_id: e.target.value });
                      if (formErrors.role_id)
                        setFormErrors({ ...formErrors, role_id: null });
                    }}
                    className={`w-full px-3 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition cursor-pointer ${
                      formErrors.role_id
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam dark:focus:border-[#5bd6d8]"
                    }`}
                  >
                    <option value="" className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
                      -- Chọn vai trò --
                    </option>
                    {roleOptions.map((r) => (
                      <option key={r.id} value={r.id} className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
                        {r.role_name} ({r.role_code})
                      </option>
                    ))}
                  </select>
                  {formErrors.role_id && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.role_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Trạng thái hoạt động
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-background-black-4 peer-focus:outline-none rounded-full peer dark:bg-background-white-15 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-color-neotam"></div>
                      <span className="ml-2.5 text-xs font-semibold text-color-black-70 dark:text-color-white-80">
                        {formData.active ? "Hoạt động" : "Tạm khóa"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-black-10 dark:border-background-white-15">
                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Mật khẩu <span className="text-color-rating">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (formErrors.password)
                          setFormErrors({ ...formErrors, password: null });
                      }}
                      placeholder="Tối thiểu 6 ký tự"
                      className={`w-full px-3 pr-8 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 focus:outline-none transition ${
                        formErrors.password
                          ? "border-color-rating"
                          : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam dark:focus:border-[#5bd6d8]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Xác nhận mật khẩu{" "}
                    <span className="text-color-rating">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirm_password}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          confirm_password: e.target.value,
                        });
                        if (formErrors.confirm_password)
                          setFormErrors({
                            ...formErrors,
                            confirm_password: null,
                          });
                      }}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full px-3 pr-8 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 focus:outline-none transition ${
                        formErrors.confirm_password
                          ? "border-color-rating"
                          : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam dark:focus:border-[#5bd6d8]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90"
                    >
                      {showConfirmPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  {formErrors.confirm_password && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.confirm_password}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border-black-10 dark:border-background-white-15 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="shine inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#20A7C9] via-[#2fc4c6] to-[#5bd6d8] hover:from-[#1b8da9] hover:to-[#20A7C9] text-white text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {formSubmitting && (
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  <span>
                    {formSubmitting ? "Đang xử lý..." : "Tạo Người Dùng"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: SỬA USER                                           */}
      {/* ============================================================ */}
      {showEditModal && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-lg rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl max-h-[92vh] flex flex-col">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7367f0] via-[#887ef2] to-[#9e95f5] animate-gradient-shift" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-3 pt-1 border-b border-border-black-10 dark:border-background-white-15 pb-3">
              <div>
                <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                  Chỉnh Sửa Người Dùng #{targetUser.id}
                </h3>
                <p className="text-[11px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                  Cập nhật metadata và vai trò trong user_global_roles (không
                  đổi mật khẩu)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmitEdit}
              className="overflow-y-auto space-y-3.5 flex-1 pr-1 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Họ và tên đệm <span className="text-color-rating">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => {
                      setFormData({ ...formData, first_name: e.target.value });
                      if (formErrors.first_name)
                        setFormErrors({ ...formErrors, first_name: null });
                    }}
                    className={`w-full px-3 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                      formErrors.first_name
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-rating-percent"
                    }`}
                  />
                  {formErrors.first_name && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Tên <span className="text-color-rating">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => {
                      setFormData({ ...formData, last_name: e.target.value });
                      if (formErrors.last_name)
                        setFormErrors({ ...formErrors, last_name: null });
                    }}
                    className={`w-full px-3 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                      formErrors.last_name
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-rating-percent"
                    }`}
                  />
                  {formErrors.last_name && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                  Tên đăng nhập (Username){" "}
                  <span className="text-color-rating">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-color-black-50 dark:text-color-white-50 font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      if (formErrors.username)
                        setFormErrors({ ...formErrors, username: null });
                    }}
                    className={`w-full pl-7 pr-3 py-2 rounded-xl font-mono bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                      formErrors.username
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-rating-percent"
                    }`}
                  />
                </div>
                {formErrors.username && (
                  <p className="text-[11px] text-color-rating mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                  Địa chỉ Email <span className="text-color-rating">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email)
                      setFormErrors({ ...formErrors, email: null });
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                    formErrors.email
                      ? "border-color-rating"
                      : "border-border-black-10 dark:border-background-white-15 focus:border-color-rating-percent"
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-color-rating mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Vai trò (Role) <span className="text-color-rating">*</span>
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => {
                      setFormData({ ...formData, role_id: e.target.value });
                      if (formErrors.role_id)
                        setFormErrors({ ...formErrors, role_id: null });
                    }}
                    className={`w-full px-3 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition cursor-pointer ${
                      formErrors.role_id
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-rating-percent"
                    }`}
                  >
                    <option value="" className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
                      -- Chọn vai trò --
                    </option>
                    {roleOptions.map((r) => (
                      <option key={r.id} value={r.id} className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90">
                        {r.role_name} ({r.role_code})
                      </option>
                    ))}
                  </select>
                  {formErrors.role_id && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.role_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Trạng thái hoạt động
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-background-black-4 peer-focus:outline-none rounded-full peer dark:bg-background-white-15 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-color-rating-percent"></div>
                      <span className="ml-2.5 text-xs font-semibold text-color-black-70 dark:text-color-white-80">
                        {formData.active ? "Hoạt động" : "Tạm khóa"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border-black-10 dark:border-background-white-15 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="shine inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7367f0] to-[#887ef2] hover:from-[#5e50ee] hover:to-[#7367f0] text-white text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {formSubmitting && (
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  <span>{formSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: XÁC NHẬN XÓA USER                                  */}
      {/* ============================================================ */}
      {showDeleteModal && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl text-center">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#eb5757] via-[#f87171] to-[#eb5757] animate-gradient-shift" />

            <div className="w-12 h-12 rounded-2xl bg-background-rating dark:bg-[#eb5757]/20 text-color-rating dark:text-[#f87171] flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
              Xác Nhận Xóa Người Dùng?
            </h3>
            <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-1">
              Bạn có chắc chắn muốn xóa tài khoản{" "}
              <strong className="text-color-black-100 dark:text-color-white-90 font-mono">
                @{targetUser.username}
              </strong>{" "}
              ({targetUser.email})?
            </p>

            <div className="p-3.5 rounded-xl bg-background-rating/50 dark:bg-[#eb5757]/15 border border-[#eb5757]/30 text-[11px] text-color-rating dark:text-[#f87171] text-left mt-3.5 space-y-1.5">
              <p className="font-bold text-color-rating dark:text-[#fca5a5]">
                Lưu ý quan trọng khi xóa:
              </p>
              <ul className="list-disc list-inside space-y-1 text-color-black-70 dark:text-[#f87171]/90">
                <li>
                  Xóa tài khoản vĩnh viễn khỏi bảng metadata Superset ab_user.
                </li>
                <li>
                  Xóa vai trò trong bảng user_global_roles và ab_user_role.
                </li>
                <li>Thu hồi toàn bộ quyền Dashboard và Group liên quan.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTargetUser(null);
                }}
                disabled={formSubmitting}
                className="px-4 py-2.5 rounded-xl border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={formSubmitting}
                className="shine inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#eb5757] to-[#f87171] hover:from-[#d94848] hover:to-[#eb5757] text-white text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {formSubmitting && (
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span>{formSubmitting ? "Đang xóa..." : "Xác Nhận Xóa"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Users = () => {
  return (
    <DashboardFilterProvider>
      <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
        <Header />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
          <UsersManagementContent />
        </main>
        <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
          <Footer color="text-color-black-100 dark:text-color-white-90" />
        </div>
      </div>
    </DashboardFilterProvider>
  );
};

export default Users;
