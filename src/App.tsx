// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Timeline from "./pages/Timeline";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute pageName={"Landing"}>
                <Landing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute pageName={"Login"}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute pageName={"Signup"}>
                <Signup />
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute pageName={"Dashboard"}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute pageName={"Timeline"}>
                <Timeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute pageName={"Settings"}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute pageName={"Categories"}>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upgrade"
            element={
              <ProtectedRoute pageName={"Upgrade"}>
                <Upgrade />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
