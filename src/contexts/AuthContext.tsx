// src/contexts/AuthContext.tsx
import React, { useState, useEffect, createContext, useContext } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "patient";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    role: "doctor" | "patient";
  }) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for remembered user on mount
    const rememberedEmail = localStorage.getItem("userEmail");
    const rememberedRole = localStorage.getItem("userRole") as "doctor" | "patient" | null;
    const rememberedName = localStorage.getItem("userName");
    const rememberedId = localStorage.getItem("userId");

    if (rememberedEmail && rememberedRole && rememberedName && rememberedId) {
      setUser({
        id: rememberedId,
        name: rememberedName,
        email: rememberedEmail,
        role: rememberedRole,
      });
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<User> => {
    try {
      // Mock authentication - replace with actual API call
      const response = await mockAuthCall(email, password);

      if (rememberMe) {
        localStorage.setItem("userEmail", response.email);
        localStorage.setItem("userRole", response.role);
        localStorage.setItem("userName", response.name);
        localStorage.setItem("userId", response.id);
      }

      setUser(response);
      return response;
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    role: "doctor" | "patient";
  }): Promise<User> => {
    try {
      const response = await mockSignupCall(userData);
      setUser(response);
      return response;
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;