// src/AboutSection/AboutSection.tsx
// src/AboutSection/AboutSection.tsx

import React from "react";
import {
  Microscope,
  Share2,
  Users,
  LayoutGrid,
  FileInput,
  Settings,
  Zap,
  FileOutput,
  ArrowRight,
} from "lucide-react";
import TechSpecs from "./TechSpecs";
import InteractiveModel from "./InteractiveModel";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const styles = {
  container: {
    padding: "5rem 0",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  backgroundGradient: {
    position: "absolute" as const,
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(26,26,26,0), #1a1a1a, rgba(26,26,26,0))",
    pointerEvents: "none" as const,
  },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    position: "relative" as const,
    zIndex: 1,
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "4rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    background: "linear-gradient(to right, #60A5FA, #A78BFA)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.125rem",
    color: "#94A3B8",
    maxWidth: "600px",
    margin: "0 auto",
  },
  benefitsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "5rem",
  },
  processContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    marginBottom: "5rem",
  },
  processTitle: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: "2.5rem",
    background: "linear-gradient(to right, #60A5FA, #A78BFA)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  processSteps: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },
  cta: {
    textAlign: "center" as const,
    marginTop: "5rem",
  },
  ctaTitle: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    background: "linear-gradient(to right, #60A5FA, #A78BFA)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  ctaText: {
    color: "#94A3B8",
    marginBottom: "2rem",
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 2rem",
    background: "linear-gradient(to right, #3B82F6, #8B5CF6)",
    border: "none",
    borderRadius: "0.5rem",
    color: "white",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
};

const benefitCardStyles = {
  card: {
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    transition: "transform 0.2s ease",
  },
  iconContainer: {
    width: "3rem",
    height: "3rem",
    borderRadius: "0.5rem",
    background:
      "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(147, 51, 234, 0.1))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
    background: "linear-gradient(to right, #60A5FA, #A78BFA)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  description: {
    color: "#94A3B8",
    lineHeight: "1.5",
  },
};

const processStepStyles = {
  container: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  iconContainer: {
    position: "relative" as const,
  },
  iconCircle: {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    position: "absolute" as const,
    top: "2.5rem",
    left: "50%",
    transform: "translateX(-50%)",
    width: "2px",
    height: "calc(100% + 1rem)",
    background:
      "linear-gradient(to bottom, rgba(139, 92, 246, 0.5), transparent)",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: "1.125rem",
    fontWeight: "600",
    marginBottom: "0.25rem",
    color: "white",
  },
  description: {
    color: "#94A3B8",
  },
};

const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div style={benefitCardStyles.card}>
    <div style={benefitCardStyles.iconContainer}>{icon}</div>
    <h3 style={benefitCardStyles.title}>{title}</h3>
    <p style={benefitCardStyles.description}>{description}</p>
  </div>
);

interface ProcessStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}

const ProcessStep: React.FC<ProcessStepProps> = ({
  icon,
  title,
  description,
  isLast,
}) => (
  <div style={processStepStyles.container}>
    <div style={processStepStyles.iconContainer}>
      <div style={processStepStyles.iconCircle}>{icon}</div>
      {!isLast && <div style={processStepStyles.line} />}
    </div>
    <div style={processStepStyles.content}>
      <h4 style={processStepStyles.title}>{title}</h4>
      <p style={processStepStyles.description}>{description}</p>
    </div>
  </div>
);

const AboutSection: React.FC = () => {
  const benefits = [
    {
      icon: <Microscope size={24} color="#60A5FA" />,
      title: "Enhanced Diagnosis",
      description:
        "Transform complex medical data into clear, interactive 3D visualizations for better diagnosis accuracy.",
    },
    {
      icon: <Share2 size={24} color="#60A5FA" />,
      title: "Seamless Sharing",
      description:
        "Easily share and collaborate on medical models with colleagues and other healthcare professionals.",
    },
    {
      icon: <Users size={24} color="#60A5FA" />,
      title: "Patient Communication",
      description:
        "Improve patient understanding with clear 3D visualizations of their medical conditions and treatment plans.",
    },
    {
      icon: <LayoutGrid size={24} color="#60A5FA" />,
      title: "Complete Platform",
      description:
        "One unified platform for all your medical imaging conversion and collaboration needs.",
    },
  ];

  const processSteps = [
    {
      icon: <FileInput size={20} color="white" />,
      title: "Image Upload",
      description:
        "Upload your DICOM or other medical imaging files securely to our platform.",
    },
    {
      icon: <Settings size={20} color="white" />,
      title: "Processing",
      description:
        "Advanced algorithms process and segment your medical images with high precision.",
    },
    {
      icon: <Zap size={20} color="white" />,
      title: "3D Generation",
      description:
        "Convert processed images into detailed, accurate 3D models ready for viewing.",
    },
    {
      icon: <FileOutput size={20} color="white" />,
      title: "Export & Share",
      description:
        "Export your 3D models in STL format or share directly with colleagues.",
      isLast: true,
    },
  ];

  return (
    <section id="about" style={styles.container}>
      <div style={styles.backgroundGradient} />
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h2 style={styles.title}>Transform Medical Imaging</h2>
          <p style={styles.subtitle}>
            Experience the future of medical imaging with our advanced 3D
            conversion technology. Enhance your diagnostic capabilities and
            improve patient care through better visualization.
          </p>
        </div>

        <div style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>

        <div style={styles.processContainer}>
          <h3 style={styles.processTitle}>Our Process</h3>
          <div style={styles.processSteps}>
            {processSteps.map((step, index) => (
              <ProcessStep key={index} {...step} />
            ))}
          </div>
        </div>

        <TechSpecs />
        {/* <InteractiveModel /> */}

        <div style={styles.cta}>
          <h3 style={styles.ctaTitle}>Ready to Get Started?</h3>
          <p style={styles.ctaText}>
            Join healthcare professionals worldwide who trust our platform for
            their medical imaging needs.
          </p>
          <button style={styles.ctaButton}>
            Start Converting Now
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;