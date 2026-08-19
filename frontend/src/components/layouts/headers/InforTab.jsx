import iconCalendar from "../../../assets/icon_calendar.png";
import iconCalendarDark from "../../../assets/icon_calendar_dark.png";
import iconArrowDown from "../../../assets/icon_arrow_down.png";
import iconArrowDownDark from "../../../assets/icon_arrow_down_dark.png";
import {
  useDashboardFilters,
  useDarkMode,
  useIsInfor,
} from "../../../context/DashboardFilterContext";
import {
  getYesterday,
  formatDate,
  formatDateTime,
} from "../../../helpers/helper";
import React, { useState, useEffect } from "react";

const InforTab = ({ inforTab, maxInsert = false }) => {
  // console.log("InforTab");

  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { value: darkMode, setValue: setDarkMode } = useDarkMode();
  const { value: isInfor, setValue: setIsInfor } = useIsInfor();

  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const hBreadCrumb =
        document.getElementById("BreadCrumb")?.getBoundingClientRect()
          ?.height ?? 0;
      const hTab =
        window.innerWidth < 1025
          ? 0
          : (document.getElementById("Tab")?.getBoundingClientRect()?.height ??
            0);
      const h = hBreadCrumb + hTab;
      setHeight((prev) => (prev === h.toFixed(2) ? prev : h.toFixed(2)));
    };

    updateHeight();

    const tabEl = document.getElementById("Tab");
    const breadCrumbEl = document.getElementById("BreadCrumb");

    const observer = new ResizeObserver(updateHeight);
    if (tabEl) observer.observe(tabEl);
    if (breadCrumbEl) observer.observe(breadCrumbEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="inforTabSticky"
      className={`px-6 max-lg:px-5 max-md:px-4 py-3 flex gap-2.5 max-lg:gap-2 h-12 max-lg:h-11 max-md:h-10 items-center sticky bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300 border-b ${!isInfor ? " border-border-black-10 dark:border-background-white-15" : "border-transparent"}`}
      style={{ zIndex: 200, top: `${height}px` }}
    >
      <span className="text-color-black-100 dark:text-color-white-80 transition-all duration-300 font-normal text-sm max-lg:text-[13px] max-md:text-xs text-nowrap uppercase">
        {inforTab}
      </span>
      <div className="w-px h-5 rounded-full bg-background-line-gray"></div>
      <div className="flex items-center gap-1 max-md:hidden">
        <figure>
          <img
            src={!darkMode ? iconCalendar : iconCalendarDark}
            className="w-3.75 max-lg:w-3.5"
            alt="Icon Calendar"
          />
        </figure>
        <span className="text-color-black-100 dark:text-color-white-80 transition-all duration-300 font-normal text-sm max-lg:text-[13px]">
          Dữ liệu đến ngày {formatDate(getYesterday())}
        </span>
      </div>
      <div className="w-px h-5 rounded-full bg-background-line-gray max-md:hidden"></div>
      <span className="text-color-black-50 font-normal text-sm max-lg:text-[13px] dark:text-color-white-50 transition-all duration-300 max-md:text-xs text-nowrap max-md:hidden">
        Ngày xử lý{" "}
        {maxInsert
          ? formatDateTime(maxInsert)
          : formatDate(new Date()) + " 09:00"}
      </span>
      <span className="text-color-black-50 font-normal text-sm dark:text-color-white-50 transition-all duration-300 max-md:text-xs text-nowrap hidden max-md:inline">
        {formatDate(new Date())} 09:00
      </span>
      <div className="flex-1 flex justify-end pr-1">
        <figure
          className="p-1 cursor-pointer"
          onClick={() => {
            document
              .getElementById("inforFilterRelative")
              .classList.replace("duration-0", "duration-300");
            setIsInfor((prev) => !prev);
          }}
        >
          <img
            src={!darkMode ? iconArrowDown : iconArrowDownDark}
            className={`w-2.25 max-md:w-2 ${isInfor ? "rotate-180" : ""} transition-all duration-300`}
            alt="Icon Arrow Down"
          />
        </figure>
      </div>
      <span
        id="exportTime"
        className="absolute top-1/2 -translate-y-1/2 right-20 text-color-error font-semibold text-sm max-lg:text-[13px] max-md:hidden"
      ></span>
    </section>
  );
};

export default React.memo(InforTab);
