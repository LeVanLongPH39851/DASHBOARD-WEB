// src/components/Filter.jsx
import { useState, useEffect, useCallback } from "react";
import DateRangeFilter from "./components/DataRangeFilter";
import ButtonFilter from "./components/ButtonFilter";
import SelectMultiFilter from "./components/SelectMultiFilter";
import CheckboxMultiFilter from "./components/CheckboxMultiFilter";
import {
  getYesterday,
  getDayBeforeYesterday,
  generateRandomId,
} from "../../../helpers/helper";
import iconXBlack from "../../../assets/icon_x_black.png";
import iconXBlackDark from "../../../assets/icon_x_black_dark.png";
import iconReset from "../../../assets/icon_reset.png";
import iconResetDark from "../../../assets/icon_reset_dark.png";
import GroupFilter from "./components/GroupFilter";
import RangeFilter from "./components/RangeFilter";
import {
  useDashboardFilters,
  useDashboardFilterValues,
  useIsOpen,
  useCurrentTab,
  useScreenMd,
  useHorizontal,
  useDarkMode,
  useDashboardCrossFilters,
} from "../../../context/DashboardFilterContext";

const FilterWorldCup = ({ filters, horizontalFixed = false }) => {
  const ALL_CHANNELS = useMemo(
    () => [
      { value: "VTV1", label: "VTV1" },
      { value: "VTV2", label: "VTV2" },
      { value: "VTV3", label: "VTV3" },
      { value: "VTV4", label: "VTV4" },
      { value: "VTV5", label: "VTV5" },
      { value: "VTV6", label: "VTV6" },
      { value: "VTV5 Tây Nam Bộ", label: "VTV5 Tây Nam Bộ" },
      { value: "VTV5 Tây Nguyên", label: "VTV5 Tây Nguyên" },
      { value: "VTV7", label: "VTV7" },
      { value: "VTV8", label: "VTV8" },
      { value: "VTV9", label: "VTV9" },
      { value: "VTV10", label: "VTV10" },
    ],
    [],
  );

  const ALL_DAYS = useMemo(
    () => [
      { value: "Weekend", label: "Cuối tuần", groupId: "week-type" },
      { value: "InWeek", label: "Ngày thường", groupId: "week-type" },
      { value: "Monday", label: "Thứ hai" },
      { value: "Tuesday", label: "Thứ ba" },
      { value: "Wednesday", label: "Thứ tư" },
      { value: "Thursday", label: "Thứ năm" },
      { value: "Friday", label: "Thứ sáu" },
      { value: "Saturday", label: "Thứ bảy" },
      { value: "Sunday", label: "Chủ nhật" },
    ],
    [],
  );

  const ALL_REGIONALS = useMemo(
    () => [
      {
        value: "Bắc Trung Bộ và Duyên hải miền Trung",
        label: "Bắc Trung Bộ và Duyên hải miền Trung",
      },
      { value: "Đồng bằng sông Cửu Long", label: "Đồng bằng sông Cửu Long" },
      { value: "Đồng bằng sông Hồng", label: "Đồng bằng sông Hồng" },
      { value: "Đông Nam Bộ", label: "Đông Nam Bộ" },
      { value: "Tây Nguyên", label: "Tây Nguyên" },
      {
        value: "Trung du và miền núi phía Bắc",
        label: "Trung du và miền núi phía Bắc",
      },
    ],
    [],
  );

  const VALUE_DEFAULT = useMemo(() => [], []);

  const toOptions = (items = [], field) =>
    items.map((item) => ({
      value: item[field],
      label: item[field],
    }));

  const ALL_PROVINCES = useMemo(
    () => toOptions(filters?.filterProvince, "province"),
    [filters?.filterProvince],
  );
  const ALL_PROGRAMS = useMemo(
    () => toOptions(filters?.filterProgram, "program_name"),
    [filters?.filterProgram],
  );
  const FILTER_SESSION_KEY = "dashboard_filters_worldcups";

  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { filterValues, setFilterValues } = useDashboardFilterValues();
  const { value: darkMode, setValue: setDarkMode } = useDarkMode();
  const { value: currentTab, setValue: setCurrentTab } = useCurrentTab();
  const { value: screenMd, setValue: setScreenMd } = useScreenMd();
  const { value: horizontal, setValue: setHorizontal } = useHorizontal();
  const { value: isOpen, setValue: setIsOpen } = useIsOpen();
  const { crossFilters, setCrossFilters } = useDashboardCrossFilters();

  useEffect(() => {
    const filterId = document.getElementById("filter");

    if (!filterId) return;

    let wasSticky = false;

    const handleScroll = () => {
      const threshold =
        window.innerWidth < 1025 ? 40 : window.innerWidth < 1707 ? 52 : 60;
      const isSticky = window.scrollY > threshold;

      if (isSticky === wasSticky) return;
      wasSticky = isSticky;

      filterId.classList.remove(
        "top-0",
        "top-15",
        "max-lg:top-13",
        "max-md:top-10",
      );

      if (isSticky) {
        filterId.classList.add("top-0");
      } else {
        filterId.classList.add("top-15", "max-lg:top-13", "max-md:top-10");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen, horizontal]);

  useEffect(() => {
    const relatives = document.querySelectorAll(".filter-relative");

    const observers = Array.from(relatives)
      .map((relative) => {
        const absolute = relative.querySelector(".filter-absolute");
        if (!absolute) return null;

        const initialHeight = relative.dataset.initialHeight || "zero"; // lấy từ data attribute

        const updateHeight = () => {
          const isVisible =
            absolute.classList.contains("visible") &&
            absolute.classList.contains("opacity-100") &&
            absolute.classList.contains("top-0");

          relative.style.height = isVisible
            ? `${absolute.offsetHeight}px`
            : "0px";
        };

        // Set height ban đầu
        relative.style.height =
          initialHeight === "match" ? `${absolute.offsetHeight}px` : "0px";

        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(absolute);

        const mutationObserver = new MutationObserver(updateHeight);
        mutationObserver.observe(absolute, { attributeFilter: ["class"] });

        return { resizeObserver, mutationObserver };
      })
      .filter(Boolean);

    return () =>
      observers.forEach(({ resizeObserver, mutationObserver }) => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      });
  }, [horizontal, currentTab]);

  // Sync context → form
  useEffect(() => {
    if (!appliedFilters) return;

    // ✅ Lookup tables: field → options array
    const lookups = {
      days: ALL_DAYS,
      channels: ALL_CHANNELS,
      provinces: ALL_PROVINCES,
      regionals: ALL_REGIONALS,
      programs: ALL_PROGRAMS,
    };

    sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(appliedFilters));

    const transformed = {
      ...filterValues,
      startDate: appliedFilters.startDate || getDayBeforeYesterday(),
      endDate: appliedFilters.endDate || getYesterday(),
      // ✅ Generic map tất cả arrays
      ...Object.fromEntries(
        Object.entries(lookups).map(([field, options]) => [
          field,
          (appliedFilters[field] || [])
            .map((val) => options.find((item) => item.value === val))
            .filter(Boolean),
        ]),
      ),
    };
    setFilterValues(transformed);
  }, [appliedFilters]);

  const handleDateRangeChange = useCallback(({ startDate: s, endDate: e }) => {
    setFilterValues((prev) => ({ ...prev, startDate: s, endDate: e }));
  }, []);

  const handleDaysChange = useCallback((selectedDays) => {
    const normalizedDays = [];
    const groupMap = new Map();

    selectedDays.forEach((day) => {
      if (!day.groupId) {
        normalizedDays.push(day);
        return;
      }

      if (groupMap.has(day.groupId)) {
        const oldIndex = groupMap.get(day.groupId);
        normalizedDays[oldIndex] = day;
      } else {
        groupMap.set(day.groupId, normalizedDays.length);
        normalizedDays.push(day);
      }
    });

    setFilterValues((prev) => ({
      ...prev,
      days: normalizedDays,
    }));
  }, []);

  const handleFilterChange = useCallback((field, value) => {
    setFilterValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const createFilterChangeHandler = useCallback(
    (field) => (value) => {
      handleFilterChange(field, value);
    },
    [handleFilterChange],
  );

  const onSubmit = (e) => {
    e.preventDefault();

    if (!filterValues) {
      setAppliedFilters(null);
      return;
    }

    // ✅ Extract keys động từ filterValues (tự động tất cả array fields)
    const arrayFields = Object.keys(filterValues).filter(
      (key) => Array.isArray(filterValues[key]), // Chỉ array mới map .value
    );

    const transformed = {
      ...filterValues,
      ...Object.fromEntries(
        arrayFields.map((key) => [
          key,
          (filterValues[key] || []).map((item) => item.value),
        ]),
      ),
    };

    setAppliedFilters(transformed);
    sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(transformed));

    if (screenMd) {
      setIsOpen((prev) => !prev);
    }

    setCrossFilters({ ...crossFilters, skipNext: null });
  };

  const onReset = async () => {
    // THEN reset filters
    setAppliedFilters(null);
    setFilterValues(null);
    setCrossFilters(null);
    sessionStorage.removeItem(FILTER_SESSION_KEY);

    // Call Doris endpoint FIRST to kill old queries
    const userId = sessionStorage.getItem("user_id");
    // Set new session ID
    const newUserId = generateRandomId();
    sessionStorage.setItem("user_id", newUserId);

    if (userId) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/doris/processlist`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
          },
        );
        const result = await response.json();
        console.log("✅ Doris endpoint called on reset:", result);
        // ✅ Báo cho tất cả useApi hooks reset loading về false
        window.dispatchEvent(new CustomEvent("api-killed"));
      } catch (error) {
        console.error("❌ Lỗi gọi Doris endpoint:", error);
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/kill-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
          },
        );

        const data = await res.json();
        // console.log('✅ Kill result (reset):', data);

        // window.dispatchEvent(new CustomEvent('api-killed'));
      } catch (err) {
        console.error("❌ Lỗi gọi kill-user:", err);
      }
    }

    if (screenMd) {
      setIsOpen((prev) => !prev);
    }
  };

  const COMPONENTS = useMemo(
    () => [
      <CheckboxMultiFilter
        label="Vùng"
        placeholder="Chọn vùng"
        options={ALL_REGIONALS}
        value={filterValues?.regionals || VALUE_DEFAULT}
        onChange={createFilterChangeHandler("regionals")}
        marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
      />,
      <SelectMultiFilter
        label="Tỉnh/TP"
        placeholder="Chọn Tỉnh/TP"
        options={ALL_PROVINCES}
        value={filterValues?.provinces || VALUE_DEFAULT}
        onChange={createFilterChangeHandler("provinces")}
        marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
        horizontalFixed={horizontalFixed}
      />,
    ],
    [filterValues?.provinces?.length, filterValues?.regionals?.length],
  );

  return (
    <>
      <aside
        className={`${horizontalFixed ? "w-full" : `${!isOpen || horizontal ? "w-0" : "w-[16%] max-md:w-0"} h-full`} transition-all duration-300`}
      >
        <div
          id="filter"
          className={`${horizontalFixed ? "w-full" : `bg-background-light dark:bg-background-dark border-r border-background-line-gray dark:border-background-white-15 w-[16%] max-md:w-[65%] max-md:z-9999 overflow-y-auto fixed left-0 ${!isOpen || horizontal ? "-translate-x-full" : ""} top-15 max-lg:top-13 max-md:top-10 max-md:px-4 max-lg:px-5 px-6 pt-4 max-lg:pt-3 max-md:pt-2 pb-20 transition-all duration-300 h-full`}`}
        >
          {!horizontalFixed && (
            <div className="flex justify-between items-center h-10.5 max-lg:h-9 max-md:h-8 mb-2 max-lg:mb-1.5 max-md:mb-1">
              <span className="text-background-black-child-tab dark:text-color-white-90 transition-all duration-300 text-[16px] max-lg:text-sm max-md:text-xs font-semibold">
                Bộ lọc
              </span>
              <figure
                className="cursor-pointer transition-all duration-300 hover:rotate-180"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <img
                  src={!darkMode ? iconXBlack : iconXBlackDark}
                  className="w-3.25 max-lg:w-2.75 max-md:w-2.5"
                  alt="Icon X Black"
                />
              </figure>
            </div>
          )}
          <form
            className={`${horizontalFixed ? "flex flex-wrap gap-2 max-lg:gap-1.5 max-md:gap-1.5 max-md:grid max-md:grid-cols-2 items-center" : ""}`}
            onSubmit={onSubmit}
            onReset={onReset}
          >
            <div className="max-md:col-span-2">
              <DateRangeFilter
                startDate={filterValues?.startDate || getYesterday()}
                endDate={filterValues?.endDate || getYesterday()}
                onChange={handleDateRangeChange}
                horizontalFixed={horizontalFixed}
              />
            </div>

            {!horizontal ? (
              <CheckboxMultiFilter
                label="Nhóm ngày"
                placeholder="Chọn ngày..."
                options={ALL_DAYS}
                value={filterValues?.days || VALUE_DEFAULT}
                onChange={handleDaysChange}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
              />
            ) : (
              <SelectMultiFilter
                label="Nhóm ngày"
                placeholder="Chọn ngày..."
                options={ALL_DAYS}
                value={filterValues?.days || VALUE_DEFAULT}
                onChange={handleDaysChange}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                horizontalFixed={horizontalFixed}
              />
            )}

            {!horizontal ? (
              <CheckboxMultiFilter
                label="Kênh"
                placeholder="Chọn kênh..."
                options={ALL_CHANNELS}
                value={filterValues?.channels || VALUE_DEFAULT}
                onChange={createFilterChangeHandler("channels")}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
              />
            ) : (
              <SelectMultiFilter
                label="Kênh"
                placeholder="Chọn kênh..."
                options={ALL_CHANNELS}
                value={filterValues?.channels || VALUE_DEFAULT}
                onChange={createFilterChangeHandler("channels")}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                horizontalFixed={horizontalFixed}
              />
            )}

            {
              <SelectMultiFilter
                label="Chương trình"
                placeholder="Chọn chương trình"
                options={ALL_PROGRAMS}
                value={filterValues?.programs || VALUE_DEFAULT}
                onChange={createFilterChangeHandler("programs")}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                horizontalFixed={horizontalFixed}
              />
            }

            {!horizontal && (
              <GroupFilter title={"Khu vực"} components={COMPONENTS} />
            )}

            {horizontal && (
              <>
                <SelectMultiFilter
                  label="Vùng"
                  placeholder="Chọn vùng"
                  options={ALL_REGIONALS}
                  value={filterValues?.regionals || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("regionals")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
                <SelectMultiFilter
                  label="Tỉnh/TP"
                  placeholder="Chọn Tỉnh/TP"
                  options={ALL_PROVINCES}
                  value={filterValues?.provinces || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("provinces")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
              </>
            )}

            <div
              className={`flex justify-center items-center transition-all duration-700 bg-background-light ${!horizontalFixed ? `dark:bg-background-dark fixed bottom-0 left-0 w-[16%] max-md:w-[65%] border-r border-background-line-gray dark:border-background-white-15 ${!isOpen || horizontal ? "-translate-x-full" : ""} shadow-2xl shadow-color-black-50 dark:shadow-color-white-90 py-3 max-lg:py-2.5 max-lg:gap-2 gap-4` : "gap-1 dark:bg-background-chart-dark max-md:justify-start max-md:col-span-2"}`}
            >
              <ButtonFilter
                text={"Áp dụng bộ lọc"}
                background={"bg-background-primary"}
                color={"text-background-check-box"}
                type={"submit"}
              />
              <ButtonFilter
                text={"Đặt lại"}
                background={"bg-background-light dark:bg-transparent"}
                color={"text-background-black-90 dark:text-color-white-50"}
                type={"reset"}
                src={!darkMode ? iconReset : iconResetDark}
                alt={"Icon Reset"}
                width={"w-3 max-lg:w-2.75 max-md:w-2.5"}
              />
            </div>
          </form>
        </div>
      </aside>
    </>
  );
};

export default FilterWorldCup;
