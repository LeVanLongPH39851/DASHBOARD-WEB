import React, { memo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import Label from "../layouts/components/NameChart";

const MixedChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  colors = ["#fbbf24", "#ef4444"], // vàng cho reach (bar), đỏ cho rating (line)
  fontWeight,
  nameChart,
  description,
}) => {
  const { labels = [], series = [] } = data || {};
  const chartRef = useRef(null);

  const maxVisibleItems = 24;
  const needsScroll = labels.length > maxVisibleItems;
  const zoomEndPercent = needsScroll
    ? Math.round((maxVisibleItems / labels.length) * 100)
    : 100;

  if (!labels.length || !series.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg">
        Không có dữ liệu
      </div>
    );
  }

  console.log("MixedChart - series đầu vào:", series);

  const chartSeries = series.map((s, idx) => {
    const color = colors[idx % colors.length];
    const type = s.type || (idx === 0 ? "bar" : "line"); // đảm bảo type

    return {
      name: s.name || (idx === 0 ? "reach%" : "rating%"),
      data: s.data.map((v) => Number(v) || 0),
      type, // BUỘC giữ type
      itemStyle: { color },
      z: type === "line" ? 10 : 1, // line lên trên cùng
      // BAR (reach%)
      ...(type === "bar" && {
        barWidth: "50%",
        barGap: "20%",
        label: {
          show: true,
          position: "top",
          formatter: (p) => Number(p.value).toFixed(1) + "%",
          fontSize: fontSize?.dataLabel || 12,
          fontWeight: fontWeight?.dataLabel || 600,
          color: "#1e293b",
        },
      }),
      // LINE (rating%) - NỔI BẬT CỰC ĐỈNH
      ...(type === "line" && {
        smooth: 0.4,
        symbol: "circle",
        symbolSize: 12,
        lineStyle: {
          width: 6, // dày nhất để thấy rõ
          type: "solid",
          color,
        },
        areaStyle: {
          opacity: 0.25,
          color,
        }, // fill đỏ nhạt dưới đường
        label: {
          show: true,
          position: "top",
          formatter: (p) => Number(p.value).toFixed(1) + "%",
          fontSize: fontSize?.dataLabel || 12,
          fontWeight: fontWeight?.dataLabel || 600,
          color: "#ef4444",
        },
      }),
    };
  });

  console.log("MixedChart - series cuối cùng:", chartSeries);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow", shadowStyle: { opacity: 0.1 } },
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        fontSize: fontSize?.tooltip || 15,
        color: "#1f2937",
        fontWeight: fontWeight?.tooltip || 500,
      },
      formatter: (params) => {
        const time = params[0]?.name || "";
        let content = `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
              ${time}
            </div>
        `;
        params.forEach((p) => {
          content += `
            <div style="margin: 4px 0; display: flex; align-items: center;">
              ${p.marker}
              <span style="font-weight: 600; margin-right: 8px; color: #374151;">${p.seriesName}:</span>
              <span style="font-size: 15px; font-weight: 500;">${Number(p.value).toFixed(1)}%</span>
            </div>
          `;
        });
        content += "</div>";
        return content;
      },
    },

    legend: {
      bottom: 10,
      itemWidth: 14,
      itemHeight: 14,
      textStyle: {
        fontSize: fontSize?.legend || 16,
        color: "#64748b",
        fontWeight: fontWeight?.legend || 500,
      },
    },

    grid: {
      left: "8%",
      right: "4%",
      bottom: needsScroll ? "100px" : "15%",
      top: 60,
      containLabel: true,
    },

    xAxis: {
      type: "category",
      data: labels,
      axisLine: { show: true, lineStyle: { color: "#d1d5db" } },
      axisTick: { show: false },
      axisLabel: {
        fontSize: fontSize?.axisLabel || 14,
        color: "#374151",
        fontWeight: fontWeight?.axisLabel || 600,
        rotate: 45,
        interval: 0,
      },
      splitLine: { show: false },
    },

    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: "#e5e7eb", type: "dashed", width: 1 },
      },
      axisLabel: {
        formatter: "{value} %",
        fontSize: fontSize?.axisLabel || 14,
        color: "#6b7280",
        fontWeight: fontWeight?.axisLabel || 600,
      },
      min: 0,
      max: "dataMax",
    },

    series: chartSeries,
    dataZoom: needsScroll
      ? [
          {
            type: "slider",
            show: true,
            xAxisIndex: 0,
            start: 0,
            end: zoomEndPercent,
            bottom: 20,
            height: 20,
            brushSelect: false,
            handleSize: "80%",
            handleStyle: { color: "#3b82f6" },
            textStyle: { fontSize: 12, color: "#64748b" },
            borderColor: "#e5e7eb",
            fillerColor: "rgba(59, 130, 246, 0.1)",
            dataBackground: {
              lineStyle: { color: "#3b82f6", opacity: 0.3 },
              areaStyle: { color: "#3b82f6", opacity: 0.1 },
            },
          },
          {
            type: "inside",
            xAxisIndex: 0,
            start: 0,
            end: zoomEndPercent,
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
            moveOnMouseWheel: false,
          },
        ]
      : [],
  };

  return (
    <div className="bg-background-light rounded-xl">
      <Label nameChart={nameChart} description={description} />
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: height || 420, width: "100%" }}
        opts={{
          renderer: "canvas",
          locale: "VN",
        }}
      />
    </div>
  );
};

export default memo(MixedChart);
