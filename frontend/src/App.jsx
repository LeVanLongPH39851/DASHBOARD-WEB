import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardSpot from "./pages/DashboardSpot";
import DashboardBrand from "./pages/DashboardBrand";
import DashboardWorldCup from "./pages/DashboardWorldCup";
import VietnamToday from "./pages/VietnamToday.jsx";
import DashboardVietnamToday from "./pages/DashboardVietnamToday.jsx";
import BaoTri from "./pages/BaoTri";
import Login from "./pages/Login";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("userToken");
  return token ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const token = sessionStorage.getItem("userToken");
  return token ? <Navigate to="/rating" replace /> : children;
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
          path="/rating"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spot"
          element={
            <ProtectedRoute>
              <DashboardSpot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/brand"
          element={
            <ProtectedRoute>
              <DashboardBrand />
            </ProtectedRoute>
          }
        />
        <Route
          path="/world-cup-2026"
          element={
            <ProtectedRoute>
              <DashboardWorldCup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <VietnamToday />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vietnam-today"
          element={
            <ProtectedRoute>
              <DashboardVietnamToday />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
