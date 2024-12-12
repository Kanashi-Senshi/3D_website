// App.tsx
// src/App.tsx
import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";
import AuthModal from "./contexts/AuthModal";
import { User } from "./types";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAuthSuccess = () => {
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {isAuthenticated && user ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <>
          <LandingPage onLogin={handleAuthSuccess} />
          <AuthModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={handleAuthSuccess}
          />
        </>
      )}
    </>
  );
};

export default App;
