// src/contexts/AuthModal.tsx
// src/contexts/AuthModel.tsx

import React, { useState } from "react";
import { X, AlertCircle, Check } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  role?: "doctor" | "patient";
  rememberMe: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    name: "",
    role: undefined,
    rememberMe: false,
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (isSignup) {
        if (!formData.name || !formData.role) {
          throw new Error("Please fill in all required fields");
        }
        // Implement signup logic here
        setSuccessMessage("Account created successfully!");
        setTimeout(() => {
          setIsSignup(false);
          setSuccessMessage("");
        }, 2000);
      } else {
        // Implement login logic here
        if (formData.rememberMe) {
          localStorage.setItem("userEmail", formData.email);
        }
        setSuccessMessage("Login successful!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "2.5rem",
          borderRadius: "1rem",
          width: "100%",
          maxWidth: "400px",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: "#8a8a8a",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <X size={20} />
        </button>

        <h2
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            fontWeight: "300",
          }}
        >
          {isSignup ? "Create Account" : "Login"}
        </h2>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "0.5rem",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              color: "#ef4444",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            style={{
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "0.5rem",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: "#22c55e",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Check size={16} />
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Signup Fields */}
          {isSignup && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#2d2d2d",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "0.9rem",
                }}
                required
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#2d2d2d",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "0.9rem",
                }}
                required
              >
                <option value="">Select Role</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
            </>
          )}

          {/* Common Fields */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "0.5rem",
              backgroundColor: "#2d2d2d",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "0.9rem",
            }}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "0.5rem",
              backgroundColor: "#2d2d2d",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "0.9rem",
            }}
            required
          />

          {/* Remember Me (only for login) */}
          {!isSignup && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                style={{
                  marginRight: "0.5rem",
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  color: "#8a8a8a",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Remember me
              </label>
            </div>
          )}
          {/* Submit and Toggle Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "0.5rem",
                backgroundColor: "#2d2d2d",
                color: "white",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#3d3d3d")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#2d2d2d")
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "0.5rem",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                color: "white",
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </div>

          <div
            style={{
              marginTop: "1rem",
              textAlign: "center",
              color: "#8a8a8a",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setSuccessMessage("");
                setFormData({
                  email: "",
                  password: "",
                  name: "",
                  role: undefined,
                  rememberMe: false,
                });
              }}
              style={{
                background: "none",
                border: "none",
                color: "#6366f1",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "opacity 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {isSignup
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;