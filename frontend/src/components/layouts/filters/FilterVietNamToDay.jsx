// src/components/Filter.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  useDarkMode,
  useHorizontal,
  useCurrentTab,
  useScreenMd,
  useIsOpen,
  useDashboardCrossFilters,
} from "../../../context/DashboardFilterContext";

const DISABLE_TABS = {
  overview: "overview",
  live: "live",
  vod: "vod",
  social: "social",
};

const FilterVietNamToDay = ({ filters, horizontalFixed = false }) => {
  // console.log("Filter");

  const ALL_OTTS = useMemo(
    () => [
      { value: "VTVGo", label: "VTVGo" },
      { value: "Vietnam Today", label: "Vietnam Today" },
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

  const ALL_EVENTS = useMemo(
    () => [
      { value: "Live", label: "Live" },
      { value: "VOD", label: "VOD" },
    ],
    [],
  );

  const ALL_CONTINENTS = useMemo(
    () => [
      { value: "Africa", label: "Africa" },
      { value: "America", label: "America" },
      { value: "Asia", label: "Asia" },
      { value: "Europe", label: "Europe" },
      { value: "Oceania", label: "Oceania" },
      { value: "Unknown", label: "Unknown" },
    ],
    [],
  );

  const ALL_COUNTRY_TYPES = useMemo(
    () => [
      { value: "International", label: "International" },
      { value: "Vietnam", label: "Vietnam" },
    ],
    [],
  );

  const ALL_KEY_COUNTRIES = useMemo(
    () => [{ value: "9_key_markets", label: "9 Key Martkets" }],
    [],
  );

  const ALL_TIMEBANDS = useMemo(
    () => [
      { value: "00h - 01h", label: "00h - 01h" },
      { value: "01h - 02h", label: "01h - 02h" },
      { value: "02h - 03h", label: "02h - 03h" },
      { value: "03h - 04h", label: "03h - 04h" },
      { value: "04h - 05h", label: "04h - 05h" },
      { value: "05h - 06h", label: "05h - 06h" },
      { value: "06h - 07h", label: "06h - 07h" },
      { value: "07h - 08h", label: "07h - 08h" },
      { value: "08h - 09h", label: "08h - 09h" },
      { value: "09h - 10h", label: "09h - 10h" },
      { value: "10h - 11h", label: "10h - 11h" },
      { value: "11h - 12h", label: "11h - 12h" },
      { value: "12h - 13h", label: "12h - 13h" },
      { value: "13h - 14h", label: "13h - 14h" },
      { value: "14h - 15h", label: "14h - 15h" },
      { value: "15h - 16h", label: "15h - 16h" },
      { value: "16h - 17h", label: "16h - 17h" },
      { value: "17h - 18h", label: "17h - 18h" },
      { value: "18h - 19h", label: "18h - 19h" },
      { value: "19h - 20h", label: "19h - 20h" },
      { value: "20h - 21h", label: "20h - 21h" },
      { value: "21h - 22h", label: "21h - 22h" },
      { value: "22h - 23h", label: "22h - 23h" },
      { value: "23h - 24h", label: "23h - 24h" },
    ],
    [],
  );

  const ALL_FIRST_LEVELS = useMemo(
    () => [
      { value: "Documentary", label: "Documentary" },
      { value: "Educational & Training", label: "Educational & Training" },
      { value: "Entertainment", label: "Entertainment" },
      { value: "Events/Specials", label: "Events/Specials" },
      { value: "Kid Programs", label: "Kid Programs" },
      { value: "Life - Styles", label: "Life - Styles" },
      { value: "Movies", label: "Movies" },
      { value: "News & Current Affairs", label: "News & Current Affairs" },
      { value: "Sports", label: "Sports" },
    ],
    [],
  );

  const ALL_DEVICES = useMemo(
    () => [
      { value: "SMART_TV", label: "SMART_TV" },
      { value: "PC/LAP", label: "PC/LAP" },
      { value: "MOBILE", label: "MOBILE" },
      { value: "TABLET", label: "TABLET" },
    ],
    [],
  );

  const ALL_PLATFORMS = useMemo(
    () => [
      { value: "Facebook", label: "Facebook" },
      { value: "Instagram", label: "Instagram" },
      { value: "Tiktok", label: "Tiktok" },
      { value: "Youtube", label: "Youtube" },
    ],
    [],
  );

  const VALUE_DEFAULT = useMemo(() => [], []);

  const toOptions = (items = [], field) =>
    items.map((item) => ({
      value: item[field],
      label: item[field],
    }));

  const FILTER_SESSION_KEY = "dashboard_filters_vietnamtodays";
  const FILTERS = "filter_sessions_vietnamtodays";

  var filterSessions = JSON.parse(sessionStorage.getItem(FILTERS)) || {};
  const ALL_COUNTRIES = useMemo(
    () => toOptions(filters?.filterCountry, "country"),
    [filters?.filterCountry],
  );
  if (ALL_COUNTRIES[0]?.value) filterSessions.countries = ALL_COUNTRIES;
  const ALL_SOURCES = useMemo(
    () => toOptions(filters?.filterSource, "source"),
    [filters?.filterSource],
  );
  if (ALL_SOURCES[0]?.value) filterSessions.sources = ALL_SOURCES;

  sessionStorage.setItem(FILTERS, JSON.stringify(filterSessions));

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
      const threshold = window.innerWidth < 1025 ? 40 : 60;
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
      otts: ALL_OTTS,
      events: ALL_EVENTS,
      countries: ALL_COUNTRIES[0].value
        ? ALL_COUNTRIES
        : sessionStorage.getItem(FILTERS) !== "{}"
          ? JSON.parse(sessionStorage.getItem(FILTERS)).countries
          : ALL_COUNTRIES,
      countryTypes: ALL_COUNTRY_TYPES,
      keyCountries: ALL_KEY_COUNTRIES,
      continents: ALL_CONTINENTS,
      devices: ALL_DEVICES,
      firstLevels: ALL_FIRST_LEVELS,
      platforms: ALL_PLATFORMS,
      sources: ALL_SOURCES[0].value
        ? ALL_SOURCES
        : sessionStorage.getItem(FILTERS) !== "{}"
          ? JSON.parse(sessionStorage.getItem(FILTERS)).sources
          : ALL_SOURCES,
    };

    sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(appliedFilters));

    const transformed = {
      ...filterValues,
      startDate: appliedFilters.startDate || getYesterday(),
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

    if (screenMd) {
      setIsOpen((prev) => !prev);
    }

    setCrossFilters({ ...crossFilters, main: null, skipNext: null });
  };

  const onReset = async () => {
    // THEN reset filters
    setAppliedFilters(null);
    setFilterValues(null);
    setCrossFilters(null);
    sessionStorage.removeItem(FILTER_SESSION_KEY);
    sessionStorage.removeItem(FILTERS);

    // Call Doris endpoint FIRST to kill old queries
    const userId = sessionStorage.getItem("user_id");
    // Set new session ID
    const newUserId = generateRandomId(6);
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
        // console.log('✅ Doris endpoint called on reset:', result);
        // ✅ Báo cho tất cả useApi hooks reset loading về false
        // window.dispatchEvent(new CustomEvent('api-killed'));
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
        label="Country type"
        placeholder="Chọn country type"
        options={ALL_COUNTRY_TYPES}
        value={filterValues?.countryTypes || VALUE_DEFAULT}
        onChange={createFilterChangeHandler("countryTypes")}
        marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
      />,
      <CheckboxMultiFilter
        label="Key country"
        placeholder="Chọn key country"
        options={ALL_KEY_COUNTRIES}
        value={filterValues?.keyCountries || VALUE_DEFAULT}
        onChange={createFilterChangeHandler("keyCountries")}
        marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
        isSearch={false}
      />,
      <SelectMultiFilter
        label="Country"
        placeholder="Chọn country"
        options={ALL_COUNTRIES}
        value={filterValues?.countries || VALUE_DEFAULT}
        onChange={createFilterChangeHandler("countries")}
        marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
        horizontalFixed={horizontalFixed}
      />,
      <CheckboxMultiFilter
        label="Continent"
        placeholder="Chọn Continent"
        options={ALL_CONTINENTS}
        value={filterValues?.continents || VALUE_DEFAULT}
        onChange={createFilterChangeHandler("continents")}
        marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
      />,
    ],
    [
      filterValues?.countries?.length,
      filterValues?.countryTypes?.length,
      filterValues?.keyCountries?.length,
      filterValues?.continents?.length,
      ALL_COUNTRIES,
    ],
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

            {[DISABLE_TABS.live, DISABLE_TABS.vod].includes(currentTab) &&
              (!horizontal ? (
                <CheckboxMultiFilter
                  label="Category"
                  placeholder="Chọn category"
                  options={ALL_FIRST_LEVELS}
                  value={filterValues?.firstLevels || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("firstLevels")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                />
              ) : (
                <SelectMultiFilter
                  label="Category"
                  placeholder="Chọn category"
                  options={ALL_FIRST_LEVELS}
                  value={filterValues?.firstLevels || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("firstLevels")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
              ))}

            {[DISABLE_TABS.vod].includes(currentTab) && (
              <SelectMultiFilter
                label="Source"
                placeholder="Chọn source"
                options={ALL_SOURCES}
                value={filterValues?.sources || VALUE_DEFAULT}
                onChange={createFilterChangeHandler("sources")}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                horizontalFixed={horizontalFixed}
              />
            )}

            {[DISABLE_TABS.overview, DISABLE_TABS.live].includes(currentTab) &&
              (!horizontal ? (
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
              ))}

            {currentTab == DISABLE_TABS.overview &&
              (!horizontal ? (
                <CheckboxMultiFilter
                  label="Live/VOD"
                  placeholder="Chọn event..."
                  options={ALL_EVENTS}
                  value={filterValues?.events || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("events")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                />
              ) : (
                <SelectMultiFilter
                  label="Live/TSV"
                  placeholder="Chọn event..."
                  options={ALL_EVENTS}
                  value={filterValues?.events || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("events")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
              ))}

            {[DISABLE_TABS.overview, DISABLE_TABS.live].includes(currentTab) &&
              (!horizontal ? (
                <CheckboxMultiFilter
                  label="OTT"
                  placeholder="Chọn nền tảng"
                  options={ALL_OTTS}
                  value={filterValues?.otts || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("otts")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                />
              ) : (
                <SelectMultiFilter
                  label="OTT"
                  placeholder="Chọn nền tảng"
                  options={ALL_OTTS}
                  value={filterValues?.otts || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("otts")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
              ))}

            {![DISABLE_TABS.social].includes(currentTab) && !horizontal && (
              <GroupFilter title={"GEO"} components={COMPONENTS} />
            )}

            {![DISABLE_TABS.social].includes(currentTab) && horizontal && (
              <>
                <SelectMultiFilter
                  label="Country type"
                  placeholder="Chọn country type"
                  options={ALL_COUNTRY_TYPES}
                  value={filterValues?.countryTypes || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("countryTypes")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
                <SelectMultiFilter
                  label="Key country"
                  placeholder="Chọn key country"
                  options={ALL_KEY_COUNTRIES}
                  value={filterValues?.keyCountries || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("keyCountries")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
                <SelectMultiFilter
                  label="Country"
                  placeholder="Chọn country"
                  options={ALL_COUNTRIES}
                  value={filterValues?.countries || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("countries")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
                <SelectMultiFilter
                  label="Continent"
                  placeholder="Chọn continent"
                  options={ALL_CONTINENTS}
                  value={filterValues?.continents || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("continents")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
              </>
            )}

            {[DISABLE_TABS.overview, DISABLE_TABS.live].includes(currentTab) &&
              (!horizontal ? (
                <CheckboxMultiFilter
                  label="Device"
                  placeholder="Chọn thiết bị"
                  options={ALL_DEVICES}
                  value={filterValues?.devices || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("devices")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                />
              ) : (
                <SelectMultiFilter
                  label="Device"
                  placeholder="Chọn thiết bị"
                  options={ALL_DEVICES}
                  value={filterValues?.devices || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("devices")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
              ))}

            {[DISABLE_TABS.social].includes(currentTab) &&
              (!horizontal ? (
                <CheckboxMultiFilter
                  label="Platform"
                  placeholder="Chọn platform"
                  options={ALL_PLATFORMS}
                  value={filterValues?.platforms || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("platforms")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                />
              ) : (
                <SelectMultiFilter
                  label="Platform"
                  placeholder="Chọn platform"
                  options={ALL_PLATFORMS}
                  value={filterValues?.platforms || VALUE_DEFAULT}
                  onChange={createFilterChangeHandler("platforms")}
                  marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                  horizontalFixed={horizontalFixed}
                />
              ))}

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

export default React.memo(FilterVietNamToDay);
