import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardList from "./pages/DashboardList";
import RolePermission from "./pages/RolePermission";
import DashboardSpot from "./pages/DashboardSpot";
import DashboardBrand from "./pages/DashboardBrand";
import DashboardWorldCup from "./pages/DashboardWorldCup";
import VietnamToday from "./pages/VietnamToday.jsx";
import DashboardVietnamToday from "./pages/DashboardVietnamToday.jsx";
import BaoTri from "./pages/BaoTri";
import Login from "./pages/Login";
import {
  checkDashboardAccess,
  getDashboards,
  getMe,
} from "./services/authService";
import { filterMappedDashboards } from "./utils/dashboardMap";

const DASHBOARD_COMPONENT_BY_SLUG = {
  rating: Dashboard,
  "world-cup-2026": DashboardWorldCup,
  brand: DashboardBrand,
  spot: DashboardSpot,
  "vietnam-today": DashboardVietnamToday,
  survey: VietnamToday,
};

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((res) => {
        if (isMounted) {
          setIsAuthenticated(Boolean(res?.status === "success" && res?.user));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Kiểm tra quyền xem từng Dashboard cụ thể qua API Gateway khi user gõ /dashboard/spot hoặc /dashboard/62
const ProtectedDashboardRoute = ({ fixedTarget }) => {
  const params = useParams();
  const location = useLocation();
  const target = fixedTarget || params.target;

  const [state, setState] = useState({
    loading: true,
    unauthenticated: false,
    allowed: false,
    dashboard: null,
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      loading: true,
      unauthenticated: false,
      allowed: false,
      dashboard: null,
    });

    checkDashboardAccess(target)
      .then((res) => {
        if (!isMounted) return;
        if (res?.status === "success" && res?.allowed && res?.dashboard) {
          setState({
            loading: false,
            unauthenticated: false,
            allowed: true,
            dashboard: res.dashboard,
          });
        } else {
          setState({
            loading: false,
            unauthenticated: false,
            allowed: false,
            dashboard: null,
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const status = err.response?.status;
        setState({
          loading: false,
          unauthenticated: status === 401,
          allowed: false,
          dashboard: null,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [target]);

  if (state.loading) {
    return null;
  }

  if (state.unauthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!state.allowed || !state.dashboard) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu người dùng gõ /dashboard/62 (hoặc /spot) thì chuẩn hóa URL về /dashboard/spot
  if (location.pathname !== state.dashboard.path) {
    return <Navigate to={state.dashboard.path} replace />;
  }

  const Component = DASHBOARD_COMPONENT_BY_SLUG[state.dashboard.slug];
  return Component ? <Component /> : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    isAuthenticated: false,
    redirectPath: "/dashboard",
  });

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await getMe();
        if (!isMounted) return;

        if (res?.status === "success" && res?.user) {
          let targetPath = "/dashboard";
          try {
            const dashRes = await getDashboards();
            const mapped = filterMappedDashboards(dashRes?.dashboards);
            if (mapped.length === 1) {
              targetPath = mapped[0].path;
            }
          } catch {
            // fallback về /dashboard
          }

          if (isMounted) {
            setAuthState({
              loading: false,
              isAuthenticated: true,
              redirectPath: targetPath,
            });
          }
        } else {
          setAuthState({
            loading: false,
            isAuthenticated: false,
            redirectPath: "/dashboard",
          });
        }
      } catch {
        if (isMounted) {
          setAuthState({
            loading: false,
            isAuthenticated: false,
            redirectPath: "/dashboard",
          });
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState.loading) {
    return null;
  }

  return authState.isAuthenticated ? (
    <Navigate to={authState.redirectPath} replace />
  ) : (
    children
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-permission"
          element={
            <ProtectedRoute>
              <RolePermission />
            </ProtectedRoute>
          }
        />
        {/* Cho phép truy cập bằng cả /dashboard/spot, /dashboard/rating... lẫn /dashboard/62, /dashboard/58... */}
        <Route path="/dashboard/:target" element={<ProtectedDashboardRoute />} />

        {/* Tương thích các đường dẫn cũ (cũng kiểm tra quyền qua API Gateway và chuẩn hóa sang /dashboard/...) */}
        <Route
          path="/rating"
          element={<ProtectedDashboardRoute fixedTarget="rating" />}
        />
        <Route
          path="/spot"
          element={<ProtectedDashboardRoute fixedTarget="spot" />}
        />
        <Route
          path="/brand"
          element={<ProtectedDashboardRoute fixedTarget="brand" />}
        />
        <Route
          path="/world-cup-2026"
          element={<ProtectedDashboardRoute fixedTarget="world-cup-2026" />}
        />
        <Route
          path="/survey"
          element={<ProtectedDashboardRoute fixedTarget="survey" />}
        />
        <Route
          path="/vietnam-today"
          element={<ProtectedDashboardRoute fixedTarget="vietnam-today" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
