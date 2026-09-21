import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import VulnerabilityZones from "./pages/VulnerabilityZones";
import ReliefPlanning from "./pages/ReliefPlanning";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  useLocation();
  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  return (
    <Routes>
        <Route path="/" element={<LoginPage />} />

       <Route
  path="/admin"
  element={
    user?.role === "admin" ? (
      <AdminDashboard />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>

        <Route
          path="/dashboard"
          element={
            user ? (
              <UserDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/vulnerability-zones"
          element={user ? <VulnerabilityZones /> : <Navigate to="/" replace />}
        />

        <Route
          path="/relief-planning"
          element={user?.role === "admin" ? <ReliefPlanning /> : <Navigate to="/" replace />}
        />
    </Routes>
  );
}

export default App;