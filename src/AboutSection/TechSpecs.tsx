// src/AboutSection/TechSpecs.tsx
// src/AboutSection/TechSpecs.tsx

import React from "react";
import { FileType, Cpu, Lock } from "lucide-react";

interface SpecificationProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
}

const styles = {
  container: {
    marginBottom: "5rem",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: "2.5rem",
    background: "linear-gradient(to right, #60A5FA, #A78BFA)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
};

const blockStyles = {
  container: {
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(8px)",
    borderRadius: "0.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "1.5rem",
  },
  iconWrapper: {
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
  blockTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    marginBottom: "0.75rem",
    color: "white",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#94A3B8",
  },
  bullet: {
    width: "0.375rem",
    height: "0.375rem",
    borderRadius: "50%",
    backgroundColor: "#60A5FA",
    flexShrink: 0,
  },
};

const SpecificationBlock: React.FC<SpecificationProps> = ({
  title,
  items,
  icon,
}) => (
  <div style={blockStyles.container}>
    <div style={blockStyles.iconWrapper}>{icon}</div>
    <h4 style={blockStyles.blockTitle}>{title}</h4>
    <ul style={blockStyles.list}>
      {items.map((item, index) => (
        <li key={index} style={blockStyles.listItem}>
          <span style={blockStyles.bullet} />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const TechSpecs: React.FC = () => {
  const specifications = [
    {
      title: "Supported Formats",
      icon: <FileType size={24} color="#60A5FA" />,
      items: [
        "DICOM (Digital Imaging and Communications in Medicine)",
        "NIfTI (Neuroimaging Informatics Technology Initiative)",
        "MINC (Medical Imaging NetCDF)",
        "NRRD (Nearly Raw Raster Data)",
        "STL (Stereolithography) export",
      ],
    },
    {
      title: "Processing Capabilities",
      icon: <Cpu size={24} color="#60A5FA" />,
      items: [
        "High-resolution image processing",
        "Automatic segmentation",
        "Multi-planar reconstruction",
        "Volume rendering",
        "Surface mesh generation",
      ],
    },
    {
      title: "Security Features",
      icon: <Lock size={24} color="#60A5FA" />,
      items: [
        "HIPAA compliant storage",
        "End-to-end encryption",
        "Secure file transfer",
        "Access control and permissions",
        "Audit logging",
      ],
    },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Technical Specifications</h3>
      <div style={styles.grid}>
        {specifications.map((spec, index) => (
          <SpecificationBlock key={index} {...spec} />
        ))}
      </div>
    </div>
  );
};

export default TechSpecs;
