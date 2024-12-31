// src/contexts/AuthContext.tsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { API_URL } from '../config';
import axios from 'axios';

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
    // Check for stored auth token on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and fetch user data
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<User> => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data;

      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      setUser(user);
      return user;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    role: "doctor" | "patient";
  }): Promise<User> => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;