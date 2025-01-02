// src/types/index.ts
// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "patient";
}

export interface DashboardProps {
  onLogout: () => void;
}

export interface LandingPageProps {
  onLogin: () => void;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
