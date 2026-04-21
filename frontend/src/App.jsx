import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import DashboardSpot from './pages/DashboardSpot';
import DashboardBrand from './pages/DashboardBrand';
import Login from "./pages/Login";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('userToken');
  return token ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const token = sessionStorage.getItem('userToken');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<PublicRoute><Login /></PublicRoute>}/> */}
        <Route path="/rating" element={<Dashboard />}/>
        <Route path="/spot" element={<DashboardSpot />}/>
        <Route path="/brand" element={<DashboardBrand />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
