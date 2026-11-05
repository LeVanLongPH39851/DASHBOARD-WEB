import logoVTVRatings from "../../../assets/logo_VTVRating_white.png";
import logoVTVRatingsDark from "../../../assets/logo_VTVRating_dark.png";
import iconDarkMode from "../../../assets/icon_dark_mode.png";
import iconDarkModeDark from "../../../assets/icon_dark_mode_dark.png";
import imageUser from "../../../assets/image_user.png";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDarkMode } from "../../../context/DashboardFilterContext";
import Button from "./Button";
import { CUSTOM_CHART } from "../../../utils/customChart";
import iconUserInfor from "../../../assets/icon_user_infor.png";
import iconUserInforDark from "../../../assets/icon_user_infor_dark.png";
import iconLogout from "../../../assets/icon_logout.png";
import useGlobalEffects from "../../../hooks/useGlobalEffects";
import { logout } from "../../../services/authService";

const Header = ({ username }) => {
  const { value: darkMode, setValue: setDarkMode } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const isRolePermissionActive =
    location.pathname === "/role-permission" ||
    location.search.includes("tab=role-permission");
  const isDashboardActive = !isRolePermissionActive;

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
    <header className="h-15 max-lg:h-13 max-md:h-11 bg-background-light dark:bg-background-dark transition-all duration-300 px-6 max-lg:px-5 max-md:px-4 py-px flex justify-between items-center border-b border-border-black-10 dark:border-background-white-15">
      <div className="flex items-center gap-6 max-md:gap-3">
        <Link to="/dashboard?view=list">
          <figure>
            <img
              src={!darkMode ? logoVTVRatings : logoVTVRatingsDark}
              className="h-14.5 max-lg:h-12.5 max-md:h-9.5"
              alt="Logo VTVRatings"
            />
          </figure>
        </Link>

        {/* 2 nút điều hướng trên Header: Dashboard & Role and Permission */}
        <nav className="flex items-center gap-2 max-md:gap-1.5">
          <Link
            to="/dashboard?view=list"
            className={`px-4 max-md:px-2.5 py-2 max-md:py-1.5 rounded-xl text-sm max-lg:text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
              isDashboardActive
                ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-sm"
                : "text-color-black-50 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8"
            }`}
          >
            <svg
              className="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
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
            <span>Dashboard</span>
          </Link>

          <Link
            to="/role-permission"
            className={`px-4 max-md:px-2.5 py-2 max-md:py-1.5 rounded-xl text-sm max-lg:text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
              isRolePermissionActive
                ? "bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white shadow-sm"
                : "text-color-black-50 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8"
            }`}
          >
            <svg
              className="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              />
              <circle cx="9" cy="7" r="4" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
              />
            </svg>
            <span>Role and Permission</span>
          </Link>
        </nav>
      </div>

      <div className="flex items-center">
        <div className="flex items-center gap-2 max-lg:gap-1.5 max-md:gap-1">
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
                text={"Đăng xuất"}
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
