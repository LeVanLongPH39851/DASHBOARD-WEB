// src/contexts/DashboardFilterContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const DashboardFilterContext = createContext(null);
const FilterValueContext = createContext(null);
const StateGlobalContext = createContext(null);
const CrossFilterContext = createContext(null);

function makeFieldContext(defaultValue) {
  return createContext({ value: defaultValue, setValue: () => {} });
}

const IsOpenContext = makeFieldContext(true);
const HorizontalContext = makeFieldContext(false);
const IsInforContext = makeFieldContext(true);
const CurrentTabContext = makeFieldContext("overview");
const DarkModeContext = makeFieldContext(true);
const ScreenMdContext = makeFieldContext(false);
const ScreenLgContext = makeFieldContext(false);

const SESSION_KEYS = {
  appliedFilters: "dashboard_filters",
};

const isRatingPage = () => {
  try {
    return window.location.pathname.includes("/rating");
  } catch {
    return false;
  }
};

const isSpotPage = () => {
  try {
    const isSpot =
      window.location.pathname.includes("/spot") ||
      window.location.pathname.includes("/brand");
    return isSpot;
  } catch {
    return false;
  }
};

const isWorldCupPage = () => {
  try {
    const isWorldCup = window.location.pathname.includes("/world-cup-2026");
    return isWorldCup;
  } catch {
    return false;
  }
};

const getSessionValue = (key, fallback = null) => {
  try {
    if (!isRatingPage() && !isSpotPage() && !isWorldCupPage()) return fallback;
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Cannot parse sessionStorage key: ${key}`, error);
    return fallback;
  }
};

export const DashboardFilterProvider = ({ children }) => {
  const [appliedFilters, setAppliedFilters] = useState(() =>
    getSessionValue(
      SESSION_KEYS.appliedFilters +
        `${isRatingPage() ? "_ratings" : isSpotPage() ? "_spots" : isWorldCupPage() ? "_worldcups" : ""}`,
      null,
    ),
  );
  const [filterValues, setFilterValues] = useState(null);
  const [stateGlobals, setStateGlobals] = useState({
    isOpen: true,
    horizontal: false,
    isInfor: true,
    currentTab: "overview",
    darkMode: true,
    screen_md: false,
    screen_lg: false,
  });
  const [crossFilters, setCrossFilters] = useState(null);

  const [isOpen, setIsOpen] = useState(true);
  const [horizontal, setHorizontal] = useState(false);
  const [isInfor, setIsInfor] = useState(true);
  const [currentTab, setCurrentTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(true);
  const [screen_md, setScreenMd] = useState(false);
  const [screen_lg, setScreenLg] = useState(false);

  const isOpenValue = useMemo(
    () => ({ value: isOpen, setValue: setIsOpen }),
    [isOpen],
  );
  const horizontalValue = useMemo(
    () => ({ value: horizontal, setValue: setHorizontal }),
    [horizontal],
  );
  const isInforValue = useMemo(
    () => ({ value: isInfor, setValue: setIsInfor }),
    [isInfor],
  );
  const currentTabValue = useMemo(
    () => ({ value: currentTab, setValue: setCurrentTab }),
    [currentTab],
  );
  const darkModeValue = useMemo(
    () => ({ value: darkMode, setValue: setDarkMode }),
    [darkMode],
  );
  const screenMdValue = useMemo(
    () => ({ value: screen_md, setValue: setScreenMd }),
    [screen_md],
  );
  const screenLgValue = useMemo(
    () => ({ value: screen_lg, setValue: setScreenLg }),
    [screen_lg],
  );

  const appliedValue = useMemo(
    () => ({ appliedFilters, setAppliedFilters }),
    [appliedFilters],
  );
  const filterValue = useMemo(
    () => ({ filterValues, setFilterValues }),
    [filterValues],
  );
  const stateGlobalValue = useMemo(
    () => ({ stateGlobals, setStateGlobals }),
    [stateGlobals],
  );
  const crossFilterValue = useMemo(
    () => ({ crossFilters, setCrossFilters }),
    [crossFilters],
  );

  return (
    <DashboardFilterContext.Provider value={appliedValue}>
      <FilterValueContext.Provider value={filterValue}>
        <StateGlobalContext.Provider value={stateGlobalValue}>
          <CrossFilterContext.Provider value={crossFilterValue}>
            <IsOpenContext.Provider value={isOpenValue}>
              <HorizontalContext.Provider value={horizontalValue}>
                <IsInforContext.Provider value={isInforValue}>
                  <CurrentTabContext.Provider value={currentTabValue}>
                    <DarkModeContext.Provider value={darkModeValue}>
                      <ScreenMdContext.Provider value={screenMdValue}>
                        <ScreenLgContext.Provider value={screenLgValue}>
                          {children}
                        </ScreenLgContext.Provider>
                      </ScreenMdContext.Provider>
                    </DarkModeContext.Provider>
                  </CurrentTabContext.Provider>
                </IsInforContext.Provider>
              </HorizontalContext.Provider>
            </IsOpenContext.Provider>
          </CrossFilterContext.Provider>
        </StateGlobalContext.Provider>
      </FilterValueContext.Provider>
    </DashboardFilterContext.Provider>
  );
};

export const useDashboardFilters = () => {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx)
    throw new Error(
      "useDashboardFilters must be used within DashboardFilterProvider",
    );
  return ctx;
};

export const useDashboardFilterValues = () => {
  const ctx = useContext(FilterValueContext);
  if (!ctx)
    throw new Error(
      "useDashboardFilterValues must be used within FilterValueProvider",
    );
  return ctx;
};

export const useDashboardStateGlobals = () => {
  const ctx = useContext(StateGlobalContext);
  if (!ctx)
    throw new Error(
      "useDashboardStateGlobals must be used within StateGlobalProvider",
    );
  return ctx;
};

export const useDashboardCrossFilters = () => {
  const ctx = useContext(CrossFilterContext);
  if (!ctx)
    throw new Error(
      "CrossFilterContext must be used within StateGlobalProvider",
    );
  return ctx;
};

// mỗi field 1 hook duy nhất, trả về cả value + setter
export const useIsOpen = () => useContext(IsOpenContext);
export const useHorizontal = () => useContext(HorizontalContext);
export const useIsInfor = () => useContext(IsInforContext);
export const useCurrentTab = () => useContext(CurrentTabContext);
export const useDarkMode = () => useContext(DarkModeContext);
export const useScreenMd = () => useContext(ScreenMdContext);
export const useScreenLg = () => useContext(ScreenLgContext);
