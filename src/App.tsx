// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";

const PrivateRoute: React.FC<{
  element: React.ReactElement;
  allowedRole?: "doctor" | "patient";
}> = ({ element, allowedRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return element;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <LandingPage onLogin={() => {}} />
            ) : (
              <Navigate
                to={user?.role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard"}
                replace
              />
            )
          }
        />
        <Route
          path="/doctor-dashboard/*"
          element={
            <PrivateRoute
              element={<Dashboard onLogout={handleLogout} />}
              allowedRole="doctor"
            />
          }
        />
        <Route
          path="/patient-dashboard/*"
          element={
            <PrivateRoute
              element={<Dashboard onLogout={handleLogout} />}
              allowedRole="patient"
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

