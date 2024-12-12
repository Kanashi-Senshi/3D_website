// contexts/AuthContext.tsx
// src/contexts/AuthContext.tsx
// Import necessary dependencies
import React, { useState, useEffect, createContext, useContext } from "react";
import { X, AlertCircle, Check } from "lucide-react";

// Define types for our authentication system
interface User {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "patient";
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    role: "doctor" | "patient";
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for remembered user on mount
    const rememberedEmail = localStorage.getItem("userEmail");
    const rememberedRole = localStorage.getItem("userRole");
    const rememberedName = localStorage.getItem("userName");

    if (rememberedEmail && rememberedRole && rememberedName) {
      setUser({
        id: localStorage.getItem("userId") || "1",
        name: rememberedName,
        email: rememberedEmail,
        role: rememberedRole as "doctor" | "patient",
      });
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    try {
      // Here you would typically make an API call to your authentication endpoint
      // For demonstration, we're using mock data
      const response = await mockAuthCall(email, password);

      if (rememberMe) {
        localStorage.setItem("userEmail", response.email);
        localStorage.setItem("userRole", response.role);
        localStorage.setItem("userName", response.name);
        localStorage.setItem("userId", response.id);
      }

      setUser(response);
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    role: "doctor" | "patient";
  }) => {
    try {
      // Here you would typically make an API call to your registration endpoint
      const response = await mockSignupCall(userData);
      setUser(response);
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
// Mock authentication service functions
const mockAuthCall = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate validation
  if (password.length < 6) {
    throw new Error("Invalid credentials");
  }

  return {
    id: Date.now().toString(),
    name: email.split("@")[0],
    email,
    role: email.includes("doctor") ? "doctor" : "patient",
  };
};

const mockSignupCall = async (userData: {
  email: string;
  password: string;
  name: string;
  role: "doctor" | "patient";
}): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate validation
  if (userData.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  return {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };
};
