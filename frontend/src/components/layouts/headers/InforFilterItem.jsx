import iconX from "../../../assets/icon_x.png";
import iconXDark from "../../../assets/icon_x_dark.png";
import { VALUE_LABEL } from "../../../utils/label";
import {
  useDashboardFilters,
  useDashboardFilterValues,
  useDarkMode,
  useDashboardCrossFilters,
} from "../../../context/DashboardFilterContext";
import React from "react";

const ClearSet = (
  setFilterValues,
  setAppliedFilters,
  setCrossFilters,
  keyFilter,
) => {
  setFilterValues((prev) => ({ ...prev, [keyFilter]: [] }));
  setAppliedFilters((prev) => ({ ...prev, [keyFilter]: [] }));
  setCrossFilters((prev) => {
    const { [keyFilter]: _, main: __, skipNext: ___, ...rest } = prev || {};
    return rest;
  });
};

const InforFilterItem = ({
  keyFilter = "",
  nameFilter,
  valueFilters = [],
  space,
}) => {
  // console.log("InforFilterItem");

  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { filterValues, setFilterValues } = useDashboardFilterValues();
  const { darkMode, setValue: setDarkMode } = useDarkMode();
  const { crossFilters, setCrossFilters } = useDashboardCrossFilters();

  const displayValue = Array.isArray(valueFilters)
    ? valueFilters
        .map((item) => VALUE_LABEL[item] ?? item)
        .filter((item) => item !== "")
        .join(space)
    : (VALUE_LABEL[valueFilters] ?? valueFilters);
  if (!displayValue) return null;
  return (
    <li
      className={`py-1.5 ${keyFilter == "Ngày" ? "px-4 max-lg:px-3" : "pr-2 pl-4 max-lg:pl-3 filter-item"} text-sm max-lg:text-[13px] max-md:text-xs font-normal border border-border-black-10 dark:border-border-white-20 rounded-xl text-color-black-50 dark:text-color-white-50 transition-all duration-300 flex gap-1 items-center`}
    >
      {nameFilter}:
      <span className="text-color-black-100 dark:text-color-white-90 transition-all duration-300">
        {displayValue}
      </span>
      {keyFilter != "Ngày" && (
        <figure
          onClick={() =>
            ClearSet(
              setFilterValues,
              setAppliedFilters,
              setCrossFilters,
              keyFilter,
            )
          }
          className="cursor-pointer"
        >
          <img
            src={!darkMode ? iconX : iconXDark}
            className="w-2.5 max-lg:w-2 h-2.5 max-lg:h-2"
            alt="Icon X"
          />
        </figure>
      )}
    </li>
  );
};

export default React.memo(InforFilterItem);
