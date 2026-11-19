import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
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
  const [users, setUsers] = useState([]);
  const [actorRole, setActorRole] = useState(null);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [roleFilter, setRoleFilter] = useState("all");

  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [targetUser, setTargetUser] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    role_id: "",
    active: true,
    require_otp: true,
    can_change_password: true,
    password: "",
    confirm_password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
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
        setIsSystemAdmin(Boolean(usersRes.isSystemAdmin || usersRes.is_system));
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

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.active === true).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

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
          "Không thể tải đầy đủ chi tiết người dùng",
        "error",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      role_id: roleOptions[0]?.id ? String(roleOptions[0].id) : "",
      active: true,
      require_otp: true,
      can_change_password: true,
      password: "",
      confirm_password: "",
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAddModal(true);
  };

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
      require_otp:
        user.require_otp !== undefined ? Boolean(user.require_otp) : true,
      can_change_password:
        user.can_change_password !== undefined
          ? Boolean(user.can_change_password)
          : true,
      password: "",
      confirm_password: "",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

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

  const validateForm = (isEdit = false) => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "Vui lòng nhập họ và tên đệm";
    } else if (formData.first_name.length > 64) {
      errors.first_name = "Tối đa 64 ký tự";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Vui lòng nhập tên";
    } else if (formData.last_name.length > 64) {
      errors.last_name = "Tối đa 64 ký tự";
    }

    if (!formData.username.trim()) {
      errors.username = "Vui lòng nhập username";
    } else if (!USERNAME_REGEX.test(formData.username.trim())) {
      errors.username = "Username 3-64 ký tự (chữ, số, ., _, @, -)";
    }

    if (!formData.email.trim()) {
      errors.email = "Vui lòng nhập email";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = "Định dạng email không hợp lệ";
    }

    if (!formData.role_id) {
      errors.role_id = "Vui lòng chọn vai trò";
    }

    if (!isEdit) {
      if (!formData.password) {
        errors.password = "Vui lòng nhập mật khẩu";
      } else if (formData.password.length < 8) {
        errors.password = "Mật khẩu phải có tối thiểu 8 ký tự";
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
        require_otp: Boolean(formData.require_otp),
        can_change_password: Boolean(formData.can_change_password),
        password: formData.password,
        confirm_password: formData.confirm_password,
      };

      const res = await createManagedUser(payload);
      if (res?.status === "success") {
        showToast(`Đã tạo tài khoản "${payload.username}"`, "success");
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

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!targetUser) return;
    if (!targetUser.can_manage) {
      showToast(
        targetUser.cannot_manage_reason === "admin_ami_peer" ||
          targetUser.is_admin_ami
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
        require_otp: Boolean(formData.require_otp),
        can_change_password: Boolean(formData.can_change_password),
      };

      const res = await updateManagedUser(targetUser.id, payload);
      if (res?.status === "success") {
        showToast(`Đã cập nhật tài khoản "${payload.username}"`, "success");
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

  const handleConfirmDelete = async () => {
    if (!targetUser) return;
    if (!targetUser.can_manage) {
      showToast(
        targetUser.cannot_manage_reason === "admin_ami_peer" ||
          targetUser.is_admin_ami
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
        showToast(`Đã xóa tài khoản "${targetUser.username}"`, "success");
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

  const hasActiveFilter =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "all" ||
    roleFilter !== "all";

  return (
    <div className="space-y-5 font-family-be-vietnam-pro">
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

      {/* Executive Header & KPI Bar */}
      <section className="shine-auto animate-fade-up relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 sm:p-6 shadow-component">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#0cb7a9] animate-gradient-shift" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-border-black-10 dark:border-background-white-15">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl p-[2px] overflow-hidden shrink-0 shadow-sm">
              <div className="pointer-events-none absolute -inset-1/2 bg-[conic-gradient(from_0deg,#20A7C9,#7367f0,#f2994a,#2fc4c6,#20A7C9)] animate-spin-slow opacity-90" />
              <div className="relative w-full h-full rounded-[14px] bg-gradient-to-br from-[#20A7C9] to-[#7367f0] text-white flex items-center justify-center">
                <svg
                  className="w-6 h-6"
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
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-color-black-100 dark:text-color-white-90 tracking-tight">
                  Quản lý Tài khoản
                </h1>
                <span
                  style={{ animationDelay: "100ms" }}
                  className="animate-pop-in inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] border border-[#21b8b8]/30"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0cb7a9] animate-pulse" />
                  {isSystemAdmin
                    ? "Quản trị hệ thống"
                    : actorRole?.role_name || "Quản trị viên"}
                </span>
              </div>
              <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-0.5">
                Quản lý danh sách tài khoản, phân quyền vai trò và chính sách
                bảo mật
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="group/refresh inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-dashboard dark:bg-background-white-8 hover:border-color-neotam hover:-translate-y-0.5 text-color-black-70 dark:text-color-white-80 text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-500 group-hover/refresh:rotate-180 ${refreshing ? "animate-spin text-[#20A7C9]" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
              className="shine relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white text-xs font-bold shadow-xs hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
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
              <span>Tạo tài khoản</span>
            </button>
          </div>
        </div>

        {/* 3 KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div
            style={{ animationDelay: "80ms" }}
            className="animate-fade-up flex items-center justify-between p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#20A7C9]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div>
              <p className="text-[11px] font-semibold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                Tổng tài khoản
              </p>
              <p className="text-xl font-extrabold text-color-black-100 dark:text-color-white-90 mt-0.5">
                {stats.total}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          <div
            style={{ animationDelay: "140ms" }}
            className="animate-fade-up flex items-center justify-between p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#0cb7a9]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div>
              <p className="text-[11px] font-semibold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                Đang hoạt động
              </p>
              <p className="text-xl font-extrabold text-color-neotam dark:text-[#5bd6d8] mt-0.5">
                {stats.active}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-background-succes-type-1 dark:bg-background-succes-type-1-dark text-color-succes-type-1 dark:text-color-succes-type-1-dark flex items-center justify-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div
            style={{ animationDelay: "200ms" }}
            className="animate-fade-up flex items-center justify-between p-3.5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 hover:border-[#eb5757]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div>
              <p className="text-[11px] font-semibold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                Tạm khóa
              </p>
              <p className="text-xl font-extrabold text-color-rating dark:text-[#f87171] mt-0.5">
                {stats.inactive}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-background-rating dark:bg-[#eb5757]/20 text-color-rating dark:text-[#f87171] flex items-center justify-center">
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Command Bar */}
      <section
        style={{ animationDelay: "120ms" }}
        className="animate-fade-up flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component"
      >
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
            placeholder="Tìm theo tên, username, email..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 text-color-black-100 dark:text-color-white-90 placeholder:text-color-black-50 dark:placeholder:text-color-white-50 focus:outline-none focus:border-color-neotam transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-color-black-50 hover:text-color-error cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
            {[
              { id: "all", label: "Tất cả" },
              { id: "active", label: "Hoạt động" },
              { id: "inactive", label: "Tạm khóa" },
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

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 focus:outline-none focus:border-color-neotam cursor-pointer"
          >
            <option
              value="all"
              className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90"
            >
              Tất cả vai trò
            </option>
            <option
              value="admin_ami"
              className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90"
            >
              Admin AMI
            </option>
            <option
              value="super_admin"
              className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90"
            >
              Super Admin
            </option>
            <option
              value="group_admin"
              className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90"
            >
              Group Admin
            </option>
            <option
              value="group_member"
              className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90"
            >
              Thành viên
            </option>
          </select>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRoleFilter("all");
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-color-error hover:bg-color-error/10 transition cursor-pointer"
            >
              Đặt lại
            </button>
          )}
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-background-rating dark:bg-[#eb5757]/15 border border-[#eb5757]/30 text-color-rating dark:text-[#f87171] text-xs flex items-center justify-between">
          <span className="font-semibold">{error}</span>
          <button
            type="button"
            onClick={() => fetchData()}
            className="text-xs font-bold underline hover:no-underline cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Users Directory Table & Mobile Cards */}
      <section
        style={{ animationDelay: "180ms" }}
        className="animate-fade-up rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component overflow-hidden"
      >
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loading />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4 animate-fade-up">
            <div className="w-14 h-14 rounded-2xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center mb-3 animate-float-slow">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-color-black-100 dark:text-color-white-90">
              {hasActiveFilter
                ? "Không tìm thấy tài khoản phù hợp"
                : "Chưa có tài khoản nào"}
            </h3>
            {hasActiveFilter ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setRoleFilter("all");
                }}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-color-neotam dark:text-[#5bd6d8] bg-background-ave-reach dark:bg-[#21b8b8]/15 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] cursor-pointer"
              >
                + Tạo tài khoản
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background-dashboard dark:bg-background-white-8/50 text-color-black-50 dark:text-color-white-50 uppercase tracking-wider border-b border-border-black-10 dark:border-background-white-15">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-bold">
                    Tài khoản
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-bold">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-bold">
                    Vai trò
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-bold">
                    Bảo mật
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-bold">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-bold">
                    Khởi tạo
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-bold text-right">
                    Thao tác
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
                        animationDelay: `${Math.min(idx * 35 + 220, 680)}ms`,
                      }}
                      className="animate-fade-up group/row hover:bg-background-dashboard/80 dark:hover:bg-background-white-8/50 transition-colors"
                    >
                      {/* Tài khoản */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br from-[#20A7C9] to-[#7367f0] text-white transition-transform duration-200 group-hover/row:scale-105">
                              {initials}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background-light dark:border-background-chart-dark ${
                                user.active
                                  ? "bg-[#0cb7a9] animate-pulse"
                                  : "bg-color-error"
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-color-black-100 dark:text-color-white-90 text-xs sm:text-sm truncate">
                              {fullName}
                            </div>
                            <p className="text-[11px] text-color-black-50 dark:text-color-white-50 font-mono">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 font-mono text-color-black-70 dark:text-color-white-80">
                        {user.email || "—"}
                      </td>

                      {/* Vai trò */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleBadge.classes}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${roleBadge.dot}`}
                          />
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Bảo mật */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              user.require_otp !== false
                                ? "bg-[#20A7C9]/15 text-[#20A7C9] dark:text-[#5bd6d8]"
                                : "bg-background-black-4 dark:bg-white/10 text-color-black-50 dark:text-color-white-50"
                            }`}
                          >
                            OTP: {user.require_otp !== false ? "Bật" : "Tắt"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              user.can_change_password !== false
                                ? "bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8]"
                                : "bg-color-error/15 text-color-error"
                            }`}
                          >
                            Đổi MK:{" "}
                            {user.can_change_password !== false ? "Mở" : "Khóa"}
                          </span>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-succes-type-1 dark:bg-background-succes-type-1-dark text-color-succes-type-1 dark:text-color-succes-type-1-dark">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0cb7a9] animate-pulse" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-rating dark:bg-[#eb5757]/15 text-color-rating dark:text-[#f87171]">
                            <span className="w-1.5 h-1.5 rounded-full bg-color-rating" />
                            Tạm khóa
                          </span>
                        )}
                      </td>

                      {/* Khởi tạo */}
                      <td className="px-4 py-3.5">
                        <div className="text-color-black-100 dark:text-color-white-90 font-semibold">
                          {user.created_by_name ||
                            user.assigned_by_username ||
                            "Hệ thống"}
                        </div>
                        <div className="text-[11px] text-color-black-50 dark:text-color-white-50 font-mono">
                          {formatDateDMY(user.created_on)}
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(user)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-color-ave-reach dark:text-[#5bd6d8] hover:bg-background-ave-reach dark:hover:bg-[#21b8b8]/20 transition cursor-pointer"
                            title="Chi tiết"
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

                          {user.can_manage ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(user)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-rating-percent dark:text-[#a59ff8] hover:bg-background-rating-percent dark:hover:bg-[#7367f0]/20 transition cursor-pointer"
                                title="Chỉnh sửa"
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

                              <button
                                type="button"
                                onClick={() => handleOpenDelete(user)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-rating dark:text-[#f87171] hover:bg-background-rating dark:hover:bg-[#eb5757]/20 transition cursor-pointer"
                                title="Xóa"
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-background-black-4 dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50 border border-border-black-10 dark:border-background-white-15 select-none">
                              {user.cannot_manage_reason === "self"
                                ? "Bạn"
                                : user.cannot_manage_reason ===
                                      "admin_ami_peer" || user.is_admin_ami
                                  ? "Đồng cấp"
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

        {/* Table Footer */}
        <div className="px-5 py-3 bg-background-dashboard/70 dark:bg-background-chart-dark/70 border-t border-border-black-10 dark:border-background-white-15 flex items-center justify-between text-xs text-color-black-50 dark:text-color-white-50">
          <span>
            Hiển thị <strong>{filteredUsers.length}</strong> /{" "}
            <strong>{users.length}</strong> tài khoản
          </span>
          <span className="font-medium">VTV Ratings</span>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MODAL 1: CHI TIẾT TÀI KHOẢN                                 */}
      {/* ============================================================ */}
      {showDetailModal && detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-lg rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="h-1 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#0cb7a9]" />

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border-black-10 dark:border-background-white-15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br from-[#20A7C9] to-[#7367f0] text-white">
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
                  <p className="text-xs font-mono text-color-neotam dark:text-[#5bd6d8]">
                    @{detailUser.username}
                  </p>
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

            <div className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
              {detailLoading && (
                <div className="text-[11px] text-color-neotam animate-pulse">
                  Đang đồng bộ dữ liệu chi tiết...
                </div>
              )}

              <div className="p-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 grid grid-cols-2 gap-3.5">
                <div>
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Họ và tên
                  </span>
                  <p className="font-bold text-color-black-100 dark:text-color-white-90 mt-0.5">
                    {`${detailUser.first_name || ""} ${detailUser.last_name || ""}`.trim() ||
                      "—"}
                  </p>
                </div>
                <div>
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Vai trò hệ thống
                  </span>
                  <p className="font-bold text-color-neotam dark:text-[#5bd6d8] mt-0.5">
                    {detailUser.role_name || detailUser.role_code || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Email
                  </span>
                  <p className="font-mono font-semibold text-color-black-100 dark:text-color-white-90 mt-0.5 break-all">
                    {detailUser.email || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Trạng thái
                  </span>
                  <p className="font-semibold text-color-black-100 dark:text-color-white-90 mt-0.5">
                    {detailUser.active ? "Đang hoạt động" : "Tạm khóa"}
                  </p>
                </div>
                <div>
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Xác thực OTP
                  </span>
                  <p className="font-semibold text-color-black-100 dark:text-color-white-90 mt-0.5">
                    {detailUser.require_otp !== false ? "Bắt buộc" : "Tắt"}
                  </p>
                </div>
                <div>
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Đổi mật khẩu
                  </span>
                  <p className="font-semibold text-color-black-100 dark:text-color-white-90 mt-0.5">
                    {detailUser.can_change_password !== false
                      ? "Được phép"
                      : "Đã khóa"}
                  </p>
                </div>
                <div>
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Người tạo
                  </span>
                  <p className="font-semibold text-color-black-100 dark:text-color-white-90 mt-0.5">
                    {detailUser.created_by_name ||
                      detailUser.assigned_by_username ||
                      "Hệ thống"}
                  </p>
                </div>
                <div>
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Ngày tạo
                  </span>
                  <p className="font-mono text-color-black-100 dark:text-color-white-90 mt-0.5">
                    {formatDateDMY(detailUser.created_on)}
                  </p>
                </div>
                <div>
                  <span className="text-color-black-50 dark:text-color-white-50">
                    Đăng nhập gần nhất
                  </span>
                  <p className="font-mono text-color-black-100 dark:text-color-white-90 mt-0.5">
                    {formatDateDMY(detailUser.last_login)}
                  </p>
                </div>
              </div>

              {Array.isArray(detailUser.groups) &&
                detailUser.groups.length > 0 && (
                  <div className="p-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-2.5">
                    <h4 className="text-[11px] font-bold text-color-black-50 dark:text-color-white-50 uppercase tracking-wider">
                      Nhóm tham gia ({detailUser.groups.length})
                    </h4>
                    <div className="space-y-2">
                      {detailUser.groups.map((g, idx) => (
                        <div
                          key={g.group_id || g.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15"
                        >
                          <span className="font-bold text-color-black-100 dark:text-color-white-90">
                            {g.group_name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-background-dashboard dark:bg-background-white-8 text-color-neotam dark:text-[#5bd6d8]">
                            {g.role_name || g.role_code || "Thành viên"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="px-6 py-3.5 border-t border-border-black-10 dark:border-background-white-15 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 text-xs font-semibold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2 & 3: THÊM HOẶC SỬA TÀI KHOẢN                         */}
      {/* ============================================================ */}
      {(showAddModal || (showEditModal && targetUser)) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-lg rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl max-h-[92vh] flex flex-col">
            <div
              className={`h-1 bg-gradient-to-r ${
                showAddModal
                  ? "from-[#20A7C9] to-[#2fc4c6]"
                  : "from-[#7367f0] to-[#9e95f5]"
              }`}
            />

            <div className="flex items-center justify-between px-6 py-4 border-b border-border-black-10 dark:border-background-white-15">
              <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                {showAddModal
                  ? "Tạo tài khoản mới"
                  : `Chỉnh sửa tài khoản @${targetUser?.username}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={showAddModal ? handleSubmitAdd : handleSubmitEdit}
              className="overflow-y-auto p-6 space-y-4 flex-1 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    className={`w-full px-3.5 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                      formErrors.first_name
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam"
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
                    className={`w-full px-3.5 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                      formErrors.last_name
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam"
                    }`}
                  />
                  {formErrors.last_name && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Username <span className="text-color-rating">*</span>
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
                      placeholder="username"
                      className={`w-full pl-7 pr-3 py-2 rounded-xl font-mono bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                        formErrors.username
                          ? "border-color-rating"
                          : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam"
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
                    Email <span className="text-color-rating">*</span>
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
                    className={`w-full px-3.5 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                      formErrors.email
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-color-rating mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                    Vai trò <span className="text-color-rating">*</span>
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => {
                      setFormData({ ...formData, role_id: e.target.value });
                      if (formErrors.role_id)
                        setFormErrors({ ...formErrors, role_id: null });
                    }}
                    className={`w-full px-3.5 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition cursor-pointer ${
                      formErrors.role_id
                        ? "border-color-rating"
                        : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam"
                    }`}
                  >
                    <option
                      value=""
                      className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90"
                    >
                      -- Chọn vai trò --
                    </option>
                    {roleOptions.map((r) => (
                      <option
                        key={r.id}
                        value={r.id}
                        className="bg-background-light dark:bg-background-dark text-color-black-100 dark:text-color-white-90"
                      >
                        {r.role_name}
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
                    Trạng thái
                  </label>
                  <div className="flex items-center h-[38px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-gray-300 dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-color-neotam" />
                      <span className="ml-2.5 text-xs font-semibold text-color-black-70 dark:text-color-white-80">
                        {formData.active ? "Đang hoạt động" : "Tạm khóa"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {showAddModal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border-black-10 dark:border-background-white-15">
                  <div>
                    <label className="block font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                      Mật khẩu <span className="text-color-rating">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          });
                          if (formErrors.password)
                            setFormErrors({ ...formErrors, password: null });
                        }}
                        placeholder="Tối thiểu 8 ký tự"
                        className={`w-full px-3.5 pr-9 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                          formErrors.password
                            ? "border-color-rating"
                            : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-white cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          {showPassword ? (
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
                        className={`w-full px-3.5 pr-9 py-2 rounded-xl bg-background-search dark:bg-background-white-8 border text-color-black-100 dark:text-color-white-90 focus:outline-none transition ${
                          formErrors.confirm_password
                            ? "border-color-rating"
                            : "border-border-black-10 dark:border-background-white-15 focus:border-color-neotam"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-white cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          {showConfirmPassword ? (
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
                    {formErrors.confirm_password && (
                      <p className="text-[11px] text-color-rating mt-1">
                        {formErrors.confirm_password}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Security Toggles */}
              <div className="pt-2 border-t border-border-black-10 dark:border-background-white-15 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      require_otp: !formData.require_otp,
                    })
                  }
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    formData.require_otp
                      ? "bg-[#20A7C9]/10 border-[#20A7C9]/40"
                      : "bg-background-search dark:bg-background-white-8 border-border-black-10 dark:border-background-white-15"
                  }`}
                >
                  <div className="select-none">
                    <p className="text-xs font-semibold text-color-black-100 dark:text-color-white-90">
                      Xác thực OTP
                    </p>
                    <p className="text-[11px] text-color-black-50 dark:text-color-white-50">
                      {formData.require_otp
                        ? "Bắt buộc khi đăng nhập"
                        : "Bỏ qua OTP"}
                    </p>
                  </div>
                  <div className="relative inline-flex items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.require_otp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          require_otp: e.target.checked,
                        })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-gray-300 dark:bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#20A7C9]" />
                  </div>
                </div>

                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      can_change_password: !formData.can_change_password,
                    })
                  }
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    formData.can_change_password
                      ? "bg-[#7367f0]/10 border-[#7367f0]/40"
                      : "bg-background-search dark:bg-background-white-8 border-border-black-10 dark:border-background-white-15"
                  }`}
                >
                  <div className="select-none">
                    <p className="text-xs font-semibold text-color-black-100 dark:text-color-white-90">
                      Đổi mật khẩu
                    </p>
                    <p className="text-[11px] text-color-black-50 dark:text-color-white-50">
                      {formData.can_change_password
                        ? "Cho phép tự đổi"
                        : "Khóa đổi mật khẩu"}
                    </p>
                  </div>
                  <div className="relative inline-flex items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.can_change_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          can_change_password: e.target.checked,
                        })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-gray-300 dark:bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#7367f0]" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border-black-10 dark:border-background-white-15 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 transition cursor-pointer bg-gradient-to-r ${
                    showAddModal
                      ? "from-[#20A7C9] to-[#2fc4c6]"
                      : "from-[#7367f0] to-[#887ef2]"
                  }`}
                >
                  {formSubmitting
                    ? "Đang lưu..."
                    : showAddModal
                      ? "Tạo tài khoản"
                      : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: XÁC NHẬN XÓA TÀI KHOẢN                              */}
      {/* ============================================================ */}
      {showDeleteModal && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#eb5757] to-[#f87171]" />

            <div className="relative w-11 h-11 rounded-2xl bg-background-rating dark:bg-[#eb5757]/20 text-color-rating dark:text-[#f87171] flex items-center justify-center mx-auto mb-3">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-2xl bg-color-error/25" />
              <svg
                className="relative w-5 h-5"
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
              Xóa tài khoản @{targetUser.username}?
            </h3>
            <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-1.5 leading-relaxed">
              Tài khoản{" "}
              <strong className="text-color-black-100 dark:text-color-white-90">
                {targetUser.email}
              </strong>{" "}
              cùng toàn bộ phân quyền nhóm và báo cáo liên quan sẽ bị thu hồi
              vĩnh viễn.
            </p>

            <div className="flex items-center justify-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTargetUser(null);
                }}
                disabled={formSubmitting}
                className="px-4 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 text-xs font-semibold transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={formSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#eb5757] to-[#f87171] text-white text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
              >
                {formSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
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
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <UsersManagementContent />
        </main>
        <div className="px-4 sm:px-6 lg:px-8 pb-6 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
          <Footer color="text-color-black-100 dark:text-color-white-90" />
        </div>
      </div>
    </DashboardFilterProvider>
  );
};

export default Users;
