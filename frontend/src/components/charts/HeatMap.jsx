import React, { memo, useRef, useMemo, useCallback } from "react";
import ReactECharts from "echarts-for-react";

import NameChart from "../layouts/components/NameChart";
import Loading from "../commons/Loading";
import LoadingWorldCup from "../commons/LoadingWorldCup";
import NoData from "../commons/NoData";

import { formatKMB } from "../../utils/formatNumber";

import {
  useDashboardFilters,
  useDarkMode,
  useScreenLg,
  useScreenMd,
  useDashboardCrossFilters,
} from "../../context/DashboardFilterContext";

const EMPTY_ARRAY = [];

const DEFAULT_COLORS = [
  "#edf7fa",
  "#cde7ee",
  "#9acbd9",
  "#65abc1",
  "#38839e",
  "#205769",
  "#0b303c",
];

const DEFAULT_FONT_SIZE = {
  axisLabel: 12,
  dataLabel: 12,
  tooltip: 13,
};

const DEFAULT_FONT_WEIGHT = {
  axisLabel: 400,
  dataLabel: 500,
  tooltip: 400,
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const normalizeValue = (value) => {
  // Không biến giá trị thiếu thành 0.
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const HeatmapChart = ({
  data,
  height = 420,

  fontSize = DEFAULT_FONT_SIZE,
  fontFamily = "Inter, Arial, sans-serif",
  fontWeight = DEFAULT_FONT_WEIGHT,

  nameChart = "",
  description,
  displayName = true,
  fullScreen = false,
  refetch,

  showLabel = true,
  showVisualMap = true,
  calculable = true,
  KMB = true,
  decimals = 0,

  // Gradient từ giá trị nhỏ -> lớn.
  colors = DEFAULT_COLORS,

  // Có thể đặt cố định để so sánh nhiều chart.
  minValue,
  maxValue,

  // Zoom mặc định tắt để giao diện giống ảnh.
  enableZoom = false,
  zoomStart = 0,
  zoomEnd = 100,

  xAxisTitle = "",
  yAxisTitle = "",

  // true: hàng đầu tiên nằm phía trên.
  inverseY = true,

  // Đặt 0 nếu muốn các ô nối liền như ảnh.
  cellGap = 1,
  cellRadius = 3,

  left = 8,
  right = 16,

  // Ví dụ: crossFilter="days"
  crossFilter = false,
  keyChart = false,

  // "row" | "column"
  crossFilterBy = "row",

  onCellClick,
  onRangeChange,
}) => {
  const chartRef = useRef(null);

  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { value: darkMode } = useDarkMode();
  const { value: screenLg } = useScreenLg();
  const { value: screenMd } = useScreenMd();
  const { crossFilters, setCrossFilters } = useDashboardCrossFilters();

  const isLoading = data === "isLoading";

  const labels = Array.isArray(data?.labels) ? data.labels : EMPTY_ARRAY;

  const rows = Array.isArray(data?.series) ? data.series : EMPTY_ARRAY;

  const resolvedFontSize = {
    ...DEFAULT_FONT_SIZE,
    ...fontSize,
  };

  const resolvedFontWeight = {
    ...DEFAULT_FONT_WEIGHT,
    ...fontWeight,
  };

  const chartHeight = screenMd ? 280 : screenLg ? 350 : height;

  const axisFontSize = screenMd
    ? 10
    : screenLg
      ? 11
      : resolvedFontSize.axisLabel;

  const labelFontSize = screenMd
    ? 9
    : screenLg
      ? 10
      : resolvedFontSize.dataLabel;

  const textColor = darkMode ? "#cbd5e1" : "#64748b";
  const mainTextColor = darkMode ? "#f1f5f9" : "#334155";
  const borderColor = darkMode ? "#182430" : "#ffffff";

  const palette =
    Array.isArray(colors) && colors.length >= 2 ? colors : DEFAULT_COLORS;

  const formatValue = useCallback(
    (value, compact = KMB) => {
      if (!Number.isFinite(value)) return "—";

      return compact
        ? formatKMB(value)
        : value.toLocaleString(undefined, {
            maximumFractionDigits: decimals,
          });
    },
    [KMB, decimals],
  );

  const { cells, actualMin, actualMax } = useMemo(() => {
    const result = [];

    let smallest = Infinity;
    let largest = -Infinity;

    rows.forEach((row, yIndex) => {
      labels.forEach((_, xIndex) => {
        const value = normalizeValue(row.data?.[xIndex]);

        if (value === null) return;

        result.push([xIndex, yIndex, value]);

        smallest = Math.min(smallest, value);
        largest = Math.max(largest, value);
      });
    });

    return {
      cells: result,
      actualMin: result.length ? smallest : 0,
      actualMax: result.length ? largest : 0,
    };
  }, [labels, rows]);

  const scale = useMemo(() => {
    const requestedMin = Number.isFinite(minValue) ? minValue : actualMin;

    const requestedMax = Number.isFinite(maxValue) ? maxValue : actualMax;

    const lower = Math.min(requestedMin, requestedMax);
    const upper = Math.max(requestedMin, requestedMax);

    // Tránh khoảng màu có min === max.
    return {
      min: lower,
      max:
        lower === upper ? upper + Math.max(Math.abs(upper) * 0.01, 1) : upper,
    };
  }, [actualMin, actualMax, minValue, maxValue]);

  const isMainChart = Boolean(keyChart) && crossFilters?.main === keyChart;

  const selectedValue =
    crossFilter && isMainChart ? appliedFilters?.[crossFilter]?.[0] : undefined;

  const seriesData = useMemo(
    () =>
      cells.map(([xIndex, yIndex, value]) => {
        const filterValue =
          crossFilterBy === "column" ? labels[xIndex] : rows[yIndex]?.name;

        const hasSelection =
          selectedValue !== undefined && selectedValue !== null;

        const isSelected = hasSelection && filterValue === selectedValue;

        return {
          value: [xIndex, yIndex, value],
          ...(hasSelection && {
            itemStyle: {
              opacity: isSelected ? 1 : 0.3,
              ...(isSelected && {
                borderColor: darkMode ? "#5eead4" : "#14b8a6",
                borderWidth: 2,
              }),
            },
          }),
        };
      }),
    [cells, labels, rows, selectedValue, crossFilterBy, darkMode],
  );

  const handleCellClick = useCallback(
    (params) => {
      if (
        params.componentType !== "series" ||
        params.seriesType !== "heatmap"
      ) {
        return;
      }

      const [xIndex, yIndex, value] = params.value;

      const instance = chartRef.current?.getEchartsInstance?.();
      const vm = instance?.getModel?.()?.getComponent?.("visualMap");
      const selectedRange = vm?.getSelected?.();

      if (
        selectedRange &&
        (value < selectedRange[0] || value > selectedRange[1])
      ) {
        return;
      }

      const cell = {
        column: labels[xIndex],
        row: rows[yIndex]?.name,
        value,
        xIndex,
        yIndex,
      };

      onCellClick?.(cell);

      if (!crossFilter) return;

      const filterValue = crossFilterBy === "column" ? cell.column : cell.row;

      if (filterValue === undefined || filterValue === null) {
        return;
      }

      const shouldClear =
        selectedValue !== undefined && selectedValue === filterValue;

      setAppliedFilters((previous) => {
        const current = previous || {};

        if (shouldClear) {
          const next = { ...current };
          delete next[crossFilter];
          return next;
        }

        return {
          ...current,
          [crossFilter]: [filterValue],
        };
      });

      if (!keyChart) return;

      setCrossFilters((previous) => {
        const current = previous || {};

        if (shouldClear) {
          const next = { ...current };

          delete next[keyChart];

          if (next.main === keyChart) {
            delete next.main;
          }

          return {
            ...next,
            skipNext: keyChart,
          };
        }

        return {
          ...current,
          [keyChart]: crossFilter.endsWith("s")
            ? `${crossFilter.slice(0, -1)}Filters`
            : `${crossFilter}Filters`,
          main: keyChart,
          skipNext: null,
        };
      });
    },
    [
      labels,
      rows,
      crossFilter,
      crossFilterBy,
      keyChart,
      selectedValue,
      setAppliedFilters,
      setCrossFilters,
      onCellClick,
    ],
  );

  const handleDataRangeSelected = useCallback(
    (params) => {
      if (Array.isArray(params?.selected)) {
        onRangeChange?.(params.selected);
      }
    },
    [onRangeChange],
  );

  const onEvents = useMemo(
    () => ({
      click: handleCellClick,
      datarangeselected: handleDataRangeSelected,
    }),
    [handleCellClick, handleDataRangeSelected],
  );

  const getEChartsData = useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance();

    let startIndex = 0;
    let endIndex = labels.length - 1;

    if (enableZoom && instance && labels.length) {
      const zoom = instance.getOption()?.dataZoom?.[0];

      if (zoom) {
        const lastIndex = labels.length - 1;
        const start = zoom.start ?? 0;
        const end = zoom.end ?? 100;

        const resolveIndex = (value, fallback) => {
          if (Number.isFinite(value)) {
            return Math.round(value);
          }

          const matchedIndex = labels.indexOf(value);
          return matchedIndex >= 0 ? matchedIndex : fallback;
        };

        startIndex = resolveIndex(
          zoom.startValue,
          Math.ceil((start / 100) * lastIndex),
        );

        endIndex = resolveIndex(
          zoom.endValue,
          Math.floor((end / 100) * lastIndex),
        );

        startIndex = Math.max(0, Math.min(lastIndex, startIndex));
        endIndex = Math.max(0, Math.min(lastIndex, endIndex));
      }
    }

    return {
      labels: labels.slice(startIndex, endIndex + 1),
      series: rows.map((row) => ({
        name: row.name,
        data: labels
          .slice(startIndex, endIndex + 1)
          .map((_, index) => normalizeValue(row.data?.[startIndex + index])),
      })),
    };
  }, [labels, rows, enableZoom]);

  const option = useMemo(() => {
    const visualMapWidth = screenMd ? 120 : 220;

    return {
      animationDuration: 350,

      textStyle: {
        fontFamily,
      },

      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: darkMode ? "#152232" : "#ffffff",
        borderColor: darkMode ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        padding: 0,

        textStyle: {
          color: mainTextColor,
          fontFamily,
          fontSize: resolvedFontSize.tooltip,
          fontWeight: resolvedFontWeight.tooltip,
        },

        extraCssText:
          "border-radius:12px;" +
          "box-shadow:0 12px 32px rgba(15,23,42,0.16);" +
          "overflow:hidden;",

        formatter: (params) => {
          const [xIndex, yIndex, value] = params.value;

          const instance = chartRef.current?.getEchartsInstance?.();
          const vm = instance?.getModel?.()?.getComponent?.("visualMap");
          const selectedRange = vm?.getSelected?.();

          if (
            selectedRange &&
            (value < selectedRange[0] || value > selectedRange[1])
          ) {
            return "";
          }

          const rowName = escapeHtml(rows[yIndex]?.name);
          const columnName = escapeHtml(labels[xIndex]);
          const formattedValue = escapeHtml(formatValue(value, false));

          return `
            <div style="padding:12px 16px;min-width:160px">
              <div style="
                display:flex;
                align-items:center;
                gap:8px;
                margin-bottom:8px;
                color:${textColor};
                font-size:11px;
              ">
                <span style="
                  width:8px;
                  height:8px;
                  display:inline-block;
                  border-radius:50%;
                  background:${escapeHtml(params.color)};
                "></span>
                <span>${columnName}</span>
              </div>

              <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:24px;
              ">
                <span style="font-weight:500">
                  ${rowName}
                </span>

                <span style="
                  font-weight:700;
                  font-size:16px;
                  color:${darkMode ? "#5eead4" : "#0f766e"};
                ">
                  ${formattedValue}
                </span>
              </div>
            </div>
          `;
        },
      },

      grid: {
        left,
        right,
        top: showVisualMap ? 62 : 16,
        bottom: enableZoom ? 62 : xAxisTitle ? 46 : 16,
        containLabel: true,
      },

      xAxis: {
        type: "category",
        data: labels,

        name: xAxisTitle,
        nameLocation: "middle",
        nameGap: 32,

        nameTextStyle: {
          color: textColor,
          fontFamily,
          fontSize: axisFontSize,
        },

        axisLine: {
          show: true,
          lineStyle: {
            color: darkMode ? "#334155" : "#cbd5e1",
          },
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: textColor,
          fontFamily,
          fontSize: axisFontSize,
          fontWeight: resolvedFontWeight.axisLabel,
          margin: 12,
          interval: "auto",
          hideOverlap: true,
        },

        splitArea: {
          show: false,
        },

        splitLine: {
          show: false,
        },
      },

      yAxis: {
        type: "category",
        data: rows.map((row) => row.name),
        inverse: inverseY,

        name: yAxisTitle,

        nameTextStyle: {
          color: textColor,
          fontFamily,
          fontSize: axisFontSize,
        },

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: textColor,
          fontFamily,
          fontSize: axisFontSize,
          fontWeight: resolvedFontWeight.axisLabel,
          margin: 12,
          width: screenMd ? 70 : 120,
          overflow: "truncate",
        },

        splitArea: {
          show: false,
        },

        splitLine: {
          show: false,
        },
      },

      visualMap: {
        show: showVisualMap,
        type: "continuous",

        min: scale.min,
        max: scale.max,

        // [xIndex, yIndex, value]: value ở dimension 2.
        dimension: 2,
        seriesIndex: 0,

        orient: "horizontal",
        right,
        top: 8,

        // Với orient horizontal:
        // itemHeight là chiều dài thanh gradient.
        itemWidth: 10,
        itemHeight: visualMapWidth,

        calculable,
        realtime: true,
        precision: decimals,

        text: [formatValue(scale.max), formatValue(scale.min)],
        textGap: 8,

        textStyle: {
          color: textColor,
          fontFamily,
          fontSize: screenMd ? 10 : 11,
        },

        inRange: {
          color: palette,
          opacity: 1,
        },

        outOfRange: {
          color: ["transparent"],
          opacity: 0,
        },

        handleSize: "120%",
        handleStyle: {
          borderColor: darkMode ? "#475569" : "#cbd5e1",
          borderWidth: 1,
          shadowBlur: 3,
          shadowColor: "rgba(0, 0, 0, 0.2)",
        },
        indicatorStyle: {
          borderColor: darkMode ? "#2dd4bf" : "#0d9488",
        },

        borderWidth: 0,
      },

      dataZoom: enableZoom
        ? [
            {
              type: "slider",
              xAxisIndex: 0,
              filterMode: "filter",

              start: zoomStart,
              end: zoomEnd,

              bottom: 8,
              height: screenMd ? 12 : 18,

              showDetail: false,
              brushSelect: false,

              borderColor: darkMode ? "#334155" : "#dbeafe",
              backgroundColor: darkMode ? "#152232" : "#f1f5f9",
              fillerColor: darkMode
                ? "rgba(45,212,191,0.15)"
                : "rgba(20,184,166,0.12)",

              handleStyle: {
                color: "#14b8a6",
                borderColor: darkMode ? "#152232" : "#ffffff",
              },

              dataBackground: {
                lineStyle: {
                  color: "#14b8a6",
                  opacity: 0.4,
                },
                areaStyle: {
                  color: "#14b8a6",
                  opacity: 0.1,
                },
              },

              selectedDataBackground: {
                lineStyle: {
                  color: "#0d9488",
                },
                areaStyle: {
                  color: "#14b8a6",
                  opacity: 0.2,
                },
              },
            },
            {
              type: "inside",
              xAxisIndex: 0,
              filterMode: "filter",

              start: zoomStart,
              end: zoomEnd,

              zoomOnMouseWheel: true,
              moveOnMouseMove: true,
              moveOnMouseWheel: false,
            },
          ]
        : [],

      series: [
        {
          name: nameChart || "Heatmap",
          type: "heatmap",
          coordinateSystem: "cartesian2d",
          data: seriesData,

          progressive: 0,

          itemStyle: {
            borderColor,
            borderWidth: cellGap,
            borderRadius: cellRadius,
          },

          label: {
            show: screenMd ? false : showLabel,
            position: "inside",
            fontFamily,
            fontSize: labelFontSize,
            fontWeight: resolvedFontWeight.dataLabel,

            formatter: (params) => {
              const value = params.value[2];

              const instance = chartRef.current?.getEchartsInstance?.();
              const vm = instance?.getModel?.()?.getComponent?.("visualMap");
              const selectedRange = vm?.getSelected?.();

              if (
                selectedRange &&
                (value < selectedRange[0] || value > selectedRange[1])
              ) {
                return "";
              }

              const ratio = Math.max(
                0,
                Math.min(1, (value - scale.min) / (scale.max - scale.min)),
              );

              // Tối ưu cho palette sáng -> tối mặc định.
              const styleName = ratio >= 0.55 ? "light" : "dark";

              return `{${styleName}|${formatValue(value)}}`;
            },

            rich: {
              light: {
                color: "#f8fafc",
                fontFamily,
                fontSize: labelFontSize,
                fontWeight: resolvedFontWeight.dataLabel,
              },
              dark: {
                color: "#334155",
                fontFamily,
                fontSize: labelFontSize,
                fontWeight: resolvedFontWeight.dataLabel,
              },
            },
          },

          emphasis: {
            itemStyle: {
              borderColor: darkMode ? "#5eead4" : "#14b8a6",
              borderWidth: 2,
              shadowBlur: 12,
              shadowColor: "rgba(15,23,42,0.18)",
            },
          },
        },
      ],
    };
  }, [
    fontFamily,
    darkMode,
    mainTextColor,
    textColor,
    resolvedFontSize.tooltip,
    resolvedFontWeight.tooltip,
    resolvedFontWeight.axisLabel,
    resolvedFontWeight.dataLabel,
    rows,
    labels,
    formatValue,
    left,
    right,
    showVisualMap,
    calculable,
    enableZoom,
    xAxisTitle,
    yAxisTitle,
    axisFontSize,
    inverseY,
    screenMd,
    scale,
    decimals,
    palette,
    zoomStart,
    zoomEnd,
    nameChart,
    seriesData,
    borderColor,
    cellGap,
    cellRadius,
    showLabel,
    labelFontSize,
  ]);

  const wrapperClassName = displayName
    ? [
        "p-6 max-md:p-4",
        "bg-background-light dark:bg-background-chart-dark",
        "dark:border-background-white-15",
        "border border-border-black-10",
        "rounded-2xl shadow-component",
        "transition-all duration-300",
      ].join(" ")
    : "";

  const isWorldCup =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/world-cup-2026");

  const hasData = labels.length > 0 && rows.length > 0 && cells.length > 0;

  // Các nhánh render đều ở sau toàn bộ Hooks.
  let content;

  if (isLoading) {
    content = isWorldCup ? (
      <LoadingWorldCup height={chartHeight} />
    ) : (
      <Loading height={chartHeight} />
    );
  } else if (!hasData) {
    content = <NoData height={chartHeight} />;
  } else {
    content = (
      <ReactECharts
        ref={chartRef}
        option={option}
        onEvents={onEvents}
        notMerge={true}
        style={{
          height: chartHeight,
          width: "100%",
        }}
        opts={{
          renderer: "canvas",
        }}
      />
    );
  }

  return (
    <div className={wrapperClassName}>
      <NameChart
        nameChart={nameChart}
        description={description}
        display={displayName}
        fullScreen={fullScreen}
        refetch={refetch}
        getChartData={!isLoading && hasData ? getEChartsData : undefined}
      />

      {content}
    </div>
  );
};

export default memo(HeatmapChart);
