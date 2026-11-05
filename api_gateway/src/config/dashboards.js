const DASHBOARD_ROUTES = {
  58: { id: 58, slug: "rating", path: "/dashboard/rating" },
  67: { id: 67, slug: "world-cup-2026", path: "/dashboard/world-cup-2026" },
  64: { id: 64, slug: "brand", path: "/dashboard/brand" },
  62: { id: 62, slug: "spot", path: "/dashboard/spot" },
  80: { id: 80, slug: "vietnam-today", path: "/dashboard/vietnam-today" },
  75: { id: 75, slug: "survey", path: "/dashboard/survey" },
};

const MAPPED_DASHBOARD_IDS = Object.keys(DASHBOARD_ROUTES).map(Number);

function resolveDashboardTarget(target) {
  if (!target) return null;

  const trimmed = String(target).trim().toLowerCase();
  const asNum = Number(trimmed);

  if (Number.isInteger(asNum) && DASHBOARD_ROUTES[asNum]) {
    return DASHBOARD_ROUTES[asNum];
  }

  for (const item of Object.values(DASHBOARD_ROUTES)) {
    if (item.slug.toLowerCase() === trimmed) {
      return item;
    }
  }

  return null;
}

module.exports = {
  DASHBOARD_ROUTES,
  MAPPED_DASHBOARD_IDS,
  resolveDashboardTarget,
};

