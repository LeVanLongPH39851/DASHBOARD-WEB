// Danh sách ánh xạ cố định giữa ID của Superset Dashboard và đường dẫn trên Frontend
export const DASHBOARD_ID_TO_PATH = {
  58: "/dashboard/rating",
  67: "/dashboard/world-cup-2026",
  64: "/dashboard/brand",
  62: "/dashboard/spot",
  80: "/dashboard/vietnam-today",
  75: "/dashboard/survey",
};

export const DASHBOARD_SLUG_TO_ID = {
  rating: 58,
  "world-cup-2026": 67,
  brand: 64,
  spot: 62,
  "vietnam-today": 80,
  survey: 75,
};

export function getDashboardPathById(id) {
  return DASHBOARD_ID_TO_PATH[Number(id)] || null;
}

// Chỉ giữ lại các dashboard nằm trong danh sách ánh xạ trên
export function filterMappedDashboards(dashboards = []) {
  return (Array.isArray(dashboards) ? dashboards : [])
    .filter((item) => Boolean(DASHBOARD_ID_TO_PATH[Number(item?.id)]))
    .map((item) => ({
      ...item,
      id: Number(item.id),
      path: DASHBOARD_ID_TO_PATH[Number(item.id)],
    }));
}

