import logoVTVRatings from "../../../assets/logo_VTVRating_white.png";
import logoVTVRatingsDark from "../../../assets/logo_VTVRating_dark.png";
import iconDarkMode from "../../../assets/icon_dark_mode.png";
import iconDarkModeDark from "../../../assets/icon_dark_mode_dark.png";
import imageUser from "../../../assets/image_user.png";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDarkMode } from "../../../context/DashboardFilterContext";
import Button from "./Button";
import { CUSTOM_CHART } from "../../../utils/customChart";
import iconUserInfor from "../../../assets/icon_user_infor.png";
import iconUserInforDark from "../../../assets/icon_user_infor_dark.png";
import iconLogout from "../../../assets/icon_logout.png";
import useGlobalEffects from "../../../hooks/useGlobalEffects";
import { getMe, logout } from "../../../services/authService";

const GLOBAL_ADMIN_ROLES = ["admin_ami", "super_admin", "group_admin"];

// Mỗi trang tự render Header riêng nên lưu tạm trạng thái giữa các lần mount:
// - Quyền truy cập Role & Permission: tránh nút bị nhảy vị trí khi chuyển trang
// - Vị trí pill active trước đó: để pill trượt từ nút cũ sang nút mới khi chuyển trang
let cachedCanAccessRolePermission = false;
let lastIndicatorPos = null;

const Header = ({ username, isEnglish = false }) => {
  const { value: darkMode, setValue: setDarkMode } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [canAccessRolePermission, setCanAccessRolePermission] = useState(
    cachedCanAccessRolePermission,
  );
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    getMe()
      .then((res) => {
        if (!isMounted) return;
        const globalRoles = Array.isArray(res?.user?.global_roles)
          ? res.user.global_roles
          : [];
        const isAdmin = globalRoles.some((r) =>
          GLOBAL_ADMIN_ROLES.includes(String(r).toLowerCase()),
        );
        cachedCanAccessRolePermission = isAdmin;
        setCanAccessRolePermission(isAdmin);
      })
      .catch(() => {
        if (isMounted) {
          cachedCanAccessRolePermission = false;
          setCanAccessRolePermission(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const isRolePermissionActive =
    location.pathname === "/role-permission" ||
    location.search.includes("tab=role-permission");
  const isUsersActive =
    location.pathname === "/users" ||
    location.search.includes("tab=users");
  const isUserInfoActive =
    location.pathname === "/user-info" ||
    location.search.includes("tab=user-info");
  const isDashboardActive =
    !isRolePermissionActive && !isUsersActive && !isUserInfoActive;

  // Cấu hình các nút điều hướng trên Header (màu theo bảng màu theme VTV Ratings)
  const navItems = useMemo(
    () => [
      {
        key: "dashboard",
        to: "/dashboard?view=list",
        label: "Dashboard",
        visible: true,
        gradient: "from-[#20A7C9] via-[#26b7c7] to-[#2fc4c6]",
        glow: "shadow-[0_6px_18px_-4px_rgba(32,167,201,0.55)]",
        hoverText: "hover:text-color-neotam dark:hover:text-[#5bd6d8]",
        hoverRotate: "group-hover:-rotate-6",
        iconIdle:
          "bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8]",
        icon: (
          <svg
            className="w-3.5 h-3.5 max-md:w-3 max-md:h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
        ),
      },
      {
        key: "role-permission",
        to: "/role-permission",
        label: "Role and Permission",
        visible: canAccessRolePermission,
        gradient: "from-[#7367f0] via-[#887ef3] to-[#9e95f5]",
        glow: "shadow-[0_6px_18px_-4px_rgba(115,103,240,0.55)]",
        hoverText: "hover:text-[#7367f0] dark:hover:text-[#a59ff8]",
        hoverRotate: "group-hover:rotate-6",
        iconIdle:
          "bg-background-rating-percent dark:bg-[#7367f0]/20 text-color-rating-percent dark:text-[#a59ff8]",
        icon: (
          <svg
            className="w-3.5 h-3.5 max-md:w-3 max-md:h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 12 2 2 4-4"
            />
          </svg>
        ),
      },
      {
        key: "users",
        to: "/users",
        label: "Users",
        visible: canAccessRolePermission,
        gradient: "from-[#059669] via-[#10b981] to-[#34d399]",
        glow: "shadow-[0_6px_18px_-4px_rgba(16,185,129,0.55)]",
        hoverText: "hover:text-[#10b981] dark:hover:text-[#34d399]",
        hoverRotate: "group-hover:rotate-6",
        iconIdle:
          "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        icon: (
          <svg
            className="w-3.5 h-3.5 max-md:w-3 max-md:h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 3-3.87m0 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm8-4a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            />
          </svg>
        ),
      },
      {
        key: "user-info",
        to: "/user-info",
        label: "User Info",
        visible: true,
        gradient: "from-[#f2994a] via-[#f5a83d] to-[#f7b731]",
        glow: "shadow-[0_6px_18px_-4px_rgba(242,153,74,0.55)]",
        hoverText: "hover:text-[#f2994a] dark:hover:text-[#f6b26b]",
        hoverRotate: "group-hover:-rotate-6",
        iconIdle:
          "bg-background-ave-reach-percent dark:bg-[#f2994a]/20 text-color-ave-reach-percent dark:text-[#f6b26b]",
        icon: (
          <svg
            className="w-3.5 h-3.5 max-md:w-3 max-md:h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
    ],
    [canAccessRolePermission],
  );

  const visibleNavItems = navItems.filter((item) => item.visible);
  const activeKey = isRolePermissionActive
    ? "role-permission"
    : isUsersActive
      ? "users"
      : isUserInfoActive
        ? "user-info"
        : isDashboardActive
          ? "dashboard"
          : "";
  const activeNav = visibleNavItems.find((item) => item.key === activeKey);

  // Đo vị trí nút đang active để pill nền trượt mượt giữa các nút
  const navRef = useRef(null);
  const navItemRefs = useRef({});
  const [indicator, setIndicator] = useState(() =>
    lastIndicatorPos
      ? { ...lastIndicatorPos, ready: true }
      : { left: 0, width: 0, ready: false },
  );
  const isFirstMeasureRef = useRef(true);

  const updateIndicator = useCallback(() => {
    const el = navItemRefs.current[activeKey];
    if (!el) {
      setIndicator((prev) => ({ ...prev, ready: false }));
      return;
    }
    const next = { left: el.offsetLeft, width: el.offsetWidth };
    lastIndicatorPos = next;
    setIndicator({ ...next, ready: true });
  }, [activeKey]);

  useLayoutEffect(() => {
    // Lần đo đầu tiên sau khi chuyển trang: vẽ pill ở vị trí cũ trước, rồi mới trượt sang vị trí mới
    if (isFirstMeasureRef.current && lastIndicatorPos) {
      isFirstMeasureRef.current = false;
      let raf2;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(updateIndicator);
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    isFirstMeasureRef.current = false;
    updateIndicator();
  }, [updateIndicator, canAccessRolePermission]);

  useEffect(() => {
    if (!navRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateIndicator());
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [updateIndicator]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);

    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = useCallback(async () => {
    cachedCanAccessRolePermission = false;
    lastIndicatorPos = null;
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("dashboard_filters");
    sessionStorage.removeItem("filter_values");
    sessionStorage.removeItem("dashboard_filter_spots");
    sessionStorage.removeItem("filter_value_spots");
    sessionStorage.removeItem("open_filters");
    sessionStorage.removeItem("filter_sessions_ratings");
    try {
      await logout();
    } catch {
      // ignore logout error
    }
    navigate("/", { replace: true });
  }, [navigate]);

  useGlobalEffects();

  return (
    <header className="h-15 max-lg:h-13 max-md:h-10 bg-background-light dark:bg-background-dark transition-all duration-300 px-6 max-lg:px-5 max-md:px-4 py-px flex justify-between items-center border-b border-border-black-10 dark:border-background-white-15">
      <div className="flex items-center gap-6 max-md:gap-3">
        <Link
          to="/dashboard?view=list"
          className="group flex items-center transition-transform duration-300 hover:scale-[1.02]"
        >
          <figure>
            <img
              src={!darkMode ? logoVTVRatings : logoVTVRatingsDark}
              className="h-14.5 max-lg:h-12.5 max-md:h-9.5"
              alt="Logo VTVRatings"
            />
          </figure>
        </Link>
        <nav
          ref={navRef}
          className="relative flex items-center gap-1 p-1 rounded-2xl bg-background-dashboard/80 dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 shadow-inner"
        >
          {/* Pill nền trượt theo nút đang active */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1 bottom-1 left-0 rounded-xl bg-gradient-to-r ${activeNav?.gradient || ""} ${activeNav?.glow || ""} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              indicator.ready ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
            }}
          />

          {visibleNavItems.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <Link
                key={item.key}
                to={item.to}
                ref={(el) => {
                  navItemRefs.current[item.key] = el;
                }}
                title={item.label}
                className={`shine group relative z-10 overflow-hidden px-4 max-lg:px-3 max-md:px-2.5 py-1.75 max-lg:py-1 max-md:py-0.5 rounded-xl text-sm max-lg:text-xs font-semibold transition-colors duration-300 flex items-center gap-2 active:scale-95 ${
                  isActive
                    ? "text-white"
                    : `text-color-black-70 dark:text-color-white-80 ${item.hoverText} hover:bg-background-light dark:hover:bg-background-white-8`
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 max-md:w-5 max-md:h-5 rounded-lg transition-all duration-300 group-hover:scale-110 ${item.hoverRotate} ${
                    isActive ? "bg-white/20 text-white" : item.iconIdle
                  }`}
                >
                  {item.icon}
                </span>
                <span className="max-md:hidden whitespace-nowrap">
                  {item.label}
                </span>
                {isActive && (
                  <span className="relative flex w-1.5 h-1.5 max-md:hidden">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-75 animate-ping" />
                    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2 max-lg:gap-1.5 max-md:gap-1">
          {/* <div className='flex items-center gap-2 py-2 px-4 max-lg:px-3 max-md:px-2'>
                    <figure><img src={!darkMode ? iconLanguge : iconLanguageDark} className='w-4 max-lg:w-3.5 max-md:w-3 h-4 max-lg:h-3.5 max-md:h-3' alt="Icon Language" /></figure>
                    <span className='text-base max-lg:text-sm max-md:text-xs font-medium text-color-black-100 dark:text-color-white-90 transition-all duration-300'>English</span>
                    <figure><img src={!darkMode ? iconArrowDown : iconArrowDownDark} className='w-2.25' alt="Icon Arrow Down" /></figure>
                </div> */}
          <figure
            className="p-2 max-md:pr-0 cursor-pointer"
            onClick={toggleDarkMode}
            title={darkMode ? "Chế độ sáng" : "Chế độ tối"}
          >
            <img
              src={!darkMode ? iconDarkMode : iconDarkModeDark}
              className="w-4.5 max-lg:w-4 max-md:w-3.5 h-4.5 max-lg:h-4 max-md:h-3.5"
              alt="Icon Dark Mode"
            />
          </figure>
        </div>
        <div className="w-px h-6 max-md:h-5 rounded-full bg-background-line-gray mx-2"></div>
        <div className="relative z-500">
          <div
            ref={buttonRef}
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleToggle}
          >
            <figure>
              <img
                src={imageUser}
                className="w-10 max-lg:w-8 h-10 max-lg:h-8 max-md:w-7 max-md:h-7"
                alt="Image User"
              />
            </figure>
            {/* <div className='flex flex-col justify-between'>
                        <span className='text-base max-lg:text-sm max-md:text-xs font-normal text-color-gray-800 dark:text-color-white-90 transition-all duration-300'>{currentTime}</span>
                        <span className='text-xs max-md:text-[11px] font-normal text-color-gray-600 dark:text-color-white-50 transition-all duration-300'>{currentDate}</span>
                    </div> */}
            {/* <figure><img src={!darkMode ? iconArrowDown : iconArrowDownDark} className={`w-2.25 max-md:w-2 transition-all duration-300 ${!isDropdownOpen ? '' : 'rotate-180'}`} alt="Icon Arrow Down" /></figure> */}
          </div>
          <div
            ref={dropdownRef}
            className={`${isDropdownOpen ? "scale-100 opacity-100 origin-top" : "scale-0 opacity-0 origin-top"} transition-all duration-300 absolute top-full right-0 bg-background-light dark:bg-background-dark flex flex-col border border-border-black-10 dark:border-background-white-15 rounded-xl w-[300%] max-lg:w-[350%] max-md:w-[400%] overflow-hidden`}
          >
            <div className="hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300">
              <Button
                background={"bg-transparent"}
                color={"text-color-black-100 dark:text-color-white-80"}
                src={!darkMode ? iconUserInfor : iconUserInforDark}
                widthImage="w-4.5 max-lg:w-4.25 max-md:w-4"
                alt="Icon User"
                text={username ? username : "vtvguest"}
              />
            </div>
            <div className="hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300">
              <Button
                background={"bg-transparent"}
                color={"text-color-error"}
                src={iconLogout}
                widthImage="w-4.5 max-lg:w-4.25 max-md:w-4"
                alt="Icon Logout"
                text={isEnglish ? "Logout" : "Đăng xuất"}
                click={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
