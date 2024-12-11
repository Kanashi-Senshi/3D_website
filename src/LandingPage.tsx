// src/LandingPage.tsx
// src/LandingPage

import React, { useState, useEffect, useRef } from "react";
import { AboutSection, InteractiveModel } from "./AboutSection";

// import SignupForm from "./SignupForm";
import { useAuth } from "./contexts/AuthContext";
import AuthModal from "./contexts/AuthModal";

interface LandingPageProps {
  onLogin: () => void;
}

interface MousePosition {
  x: number;
  y: number;
}

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      style={{
        color: isHovered ? "#ffffff" : "#8a8a8a",
        textDecoration: "none",
        fontSize: "0.9rem",
        transition: "color 0.3s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  );
};

const LoginButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.6rem 1.5rem",
        borderRadius: "2rem",
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
        border: "none",
        color: "white",
        fontSize: "0.9rem",
        cursor: "pointer",
        transition: "transform 0.2s ease",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Login
    </button>
  );
};

const GlowingModelContainer: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getGradientStyle = () => {
    const angle =
      Math.atan2(mousePosition.y - 0.5, mousePosition.x - 0.5) *
      (180 / Math.PI);
    const intensity = isHovered ? 0.15 : 0.1;
    const glowIntensity = isHovered ? 0.3 : 0.2;

    return {
      background: `linear-gradient(${angle}deg, 
        rgba(99, 102, 241, ${intensity}) 0%, 
        rgba(168, 85, 247, ${intensity}) 100%)`,
      boxShadow: `
        0 0 30px rgba(99, 102, 241, ${glowIntensity}),
        0 0 60px rgba(168, 85, 247, ${glowIntensity * 0.5})
      `,
      transform: isHovered ? "scale(1.01)" : "scale(1)",
      transition: "all 0.3s ease-out",
    };
  };
  return (
    <div
      ref={containerRef}
      style={{
        flex: "1 1 100%%",
        maxWidth: "100%",
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        background: "rgba(31, 41, 55, 0.3)",
        borderRadius: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(8px)",
        position: "relative",
        overflow: "hidden",
        marginTop: "5rem",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          borderRadius: "1rem",
          pointerEvents: "none",
          ...getGradientStyle(),
        }}
      />
      <InteractiveModel />
    </div>
  );
};

const GetStartedButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      style={{
        padding: "0.75rem 1.5rem",
        borderRadius: "0.5rem",
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
        border: "none",
        color: "white",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered ? "0 5px 15px rgba(99, 102, 241, 0.4)" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Get Started
    </button>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { login } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #1F2937, #111827)",
        color: "#ffffff",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "1.5rem 2rem",
          zIndex: 50,
          backgroundColor: "rgba(31, 41, 55, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              cursor: "pointer",
            }}
          >
            MediVision
          </h1>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <NavLink href="#about">About</NavLink>
            {/* <NavLink href="#services">Services</NavLink> */}
            <LoginButton onClick={() => setShowLoginModal(true)} />
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "0 2rem",
          marginTop: "5rem", // To adjust for fixed navigation
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "4rem",
          }}
        >
          {/* Text Content - 1/3 width */}
          <div
            style={{
              flex: "1 1 33.333%",
              maxWidth: "33.333%",
              paddingRight: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "3.5rem",
                fontWeight: "300",
                lineHeight: 1.2,
                marginBottom: "1.5rem",
                background: "linear-gradient(to right, #60A5FA, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Advanced Medical Imaging Solutions
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#8a8a8a",
                marginBottom: "2rem",
              }}
            >
              Connecting doctors and patients with state-of-the-art DICOM
              processing and collaboration tools.
            </p>
            <GetStartedButton />
          </div>

          {/* Interactive Model - 2/3 width */}
          <div
            style={{
              flex: "1 1 66.666%",
              maxWidth: "66.666%",
              paddingRight: "2rem",
            }}
          >
            <InteractiveModel />
          </div>
        </div>
      </section>
      {/* Add AuthModal */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={onLogin}
      />
      {/* About Section */}
      <AboutSection />
    </div>
  );
};

export default LandingPage;
