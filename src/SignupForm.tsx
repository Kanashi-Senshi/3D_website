// src/SignupForm.tsx
// src/SignupForm

import React, { useState } from "react";
import { User, Mail, Lock, Stethoscope, UserCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";

interface SignupFormProps {
  onSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as "doctor" | "patient" | "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.role) {
      setError("Please select a role");
      return;
    }

    try {
      // Mock API call - replace with actual registration endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {error && (
        <div
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            color: "#ef4444",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            color: "#22c55e",
            fontSize: "0.9rem",
          }}
        >
          Account created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <label style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
              Role
            </label>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <label
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "0.5rem",
                backgroundColor:
                  formData.role === "doctor" ? "#4f46e5" : "#2d3748",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <input
                type="radio"
                name="role"
                value="doctor"
                checked={formData.role === "doctor"}
                onChange={handleChange}
                style={{ display: "none" }}
              />
              <Stethoscope size={20} />
              Doctor
            </label>
            <label
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "0.5rem",
                backgroundColor:
                  formData.role === "patient" ? "#4f46e5" : "#2d3748",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <input
                type="radio"
                name="role"
                value="patient"
                checked={formData.role === "patient"}
                onChange={handleChange}
                style={{ display: "none" }}
              />
              <UserCircle size={20} />
              Patient
            </label>
          </div>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
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
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
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
          onChange={handleChange}
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
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1.5rem",
            borderRadius: "0.5rem",
            backgroundColor: "#2d2d2d",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            fontSize: "0.9rem",
          }}
          required
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            border: "none",
            color: "white",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
