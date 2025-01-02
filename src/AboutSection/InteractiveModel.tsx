// src/AboutSection/InteractiveModel.tsx
import React from "react";
import { InteractiveModelStyles } from "../types/styles";

interface ControlButtonProps {
  icon: React.ReactNode;
  label: React.ReactNode;
}

const styles: InteractiveModelStyles = {
  wrapper: {
    maxWidth: "90rem",
    margin: "0 auto",
    marginBottom: "5rem",
    padding: "0 1rem",
  },
  modelContainer: {
    position: "relative",
    width: "100%",
    height: "85vh",
    minHeight: "800px",
    marginBottom: "1.5rem",
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "0.5rem",
    overflow: "hidden",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  controlsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
  },
  controlItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#94A3B8",
  },
  controlIcon: {
    width: "2rem",
    height: "2rem",
    borderRadius: "0.5rem",
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  controlLabel: {
    display: "flex",
    flexDirection: "column",
  },
  controlText: {
    fontSize: "0.875rem",
  },
  controlSubText: {
    fontSize: "0.62rem",
  },
};

const InteractiveModel: React.FC = () => {
  const controls: ControlButtonProps[] = [
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 356.572 356.572"
          fill="currentColor"
        >
          <path
            d="M181.563,0C120.762,0,59.215,30.525,59.215,88.873V237.5c0,65.658,53.412,119.071,119.071,119.071
            c65.658,0,119.07-53.413,119.07-119.071V88.873C297.356,27.809,237.336,0,181.563,0z M274.945,237.5
            c0,53.303-43.362,96.657-96.659,96.657c-53.299,0-96.657-43.354-96.657-96.657v-69.513c20.014,6.055,57.685,15.215,102.221,15.215
            c28.515,0,59.831-3.809,91.095-14.567V237.5z M274.945,144.794c-81.683,31.233-168.353,7.716-193.316-0.364V88.873
            c0-43.168,51.489-66.46,99.934-66.46c46.481,0,93.382,20.547,93.382,66.46V144.794z M92.272,130.378c0,0,46.687,13.072,62.566,10.271V36.988
            C154.838,36.988,80.132,37.923,92.272,130.378z"
          />
        </svg>
      ),
      label: (
        <div style={styles.controlLabel}>
          <span>Rotate</span>
          <span style={styles.controlSubText}>(Left Click)</span>
        </div>
      ),
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 356.572 356.572"
          fill="currentColor"
        >
          <path
            d="M181.563,0C120.762,0,59.215,30.525,59.215,88.873V237.5c0,65.658,53.412,119.071,119.071,119.071
            c65.658,0,119.07-53.413,119.07-119.071V88.873C297.356,27.809,237.336,0,181.563,0z M274.945,237.5
            c0,53.303-43.362,96.657-96.659,96.657c-53.299,0-96.657-43.354-96.657-96.657v-69.513c20.014,6.055,57.685,15.215,102.221,15.215
            c28.515,0,59.831-3.809,91.095-14.567V237.5z M274.945,144.794c-81.683,31.233-168.353,7.716-193.316-0.364V88.873
            c0-43.168,51.489-66.46,99.934-66.46c46.481,0,93.382,20.547,93.382,66.46V144.794z M190.893,48.389v81.248
            c0,6.187-5.023,11.208-11.206,11.208c-6.185,0-11.207-5.021-11.207-11.208V48.389c0-6.186,5.021-11.207,11.207-11.207
            C185.869,37.182,190.893,42.203,190.893,48.389z"
          />
        </svg>
      ),
      label: (
        <div style={styles.controlLabel}>
          <span>Zoom</span>
          <span style={styles.controlSubText}>(Scroll)</span>
        </div>
      ),
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 356.572 356.572"
          fill="currentColor"
        >
          <path
            d="M181.563,0C120.762,0,59.215,30.525,59.215,88.873V237.5c0,65.658,53.412,119.071,119.071,119.071
            c65.658,0,119.07-53.413,119.07-119.071V88.873C297.356,27.809,237.336,0,181.563,0z M274.945,237.5
            c0,53.303-43.362,96.657-96.659,96.657c-53.299,0-96.657-43.354-96.657-96.657v-69.513c20.014,6.055,57.685,15.215,102.221,15.215
            c28.515,0,59.831-3.809,91.095-14.567V237.5z M274.945,144.794c-81.683,31.233-168.353,7.716-193.316-0.364V88.873
            c0-43.168,51.489-66.46,99.934-66.46c46.481,0,93.382,20.547,93.382,66.46V144.794z M264.272,130.378c0,0-46.687,13.072-62.566,10.271V36.988
            C201.706,36.988,276.412,37.923,264.272,130.378z"
          />
        </svg>
      ),
      label: (
        <div style={styles.controlLabel}>
          <span>Pan</span>
          <span style={styles.controlSubText}>(Right Click)</span>
        </div>
      ),
    },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.modelContainer}>
        <div style={{ width: "100%", height: "100%" }}>
          <iframe
            title="Cranioplasty metal 3D printed"
            style={styles.iframe}
            allowFullScreen={true}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            src="https://sketchfab.com/models/e888ba8a4dfb4e6595dc3e1085537f02/embed?autostart=1"
            {...({
              mozallowfullscreen: "true",
              webkitallowfullscreen: "true",
              "xr-spatial-tracking": "",
              "execution-while-out-of-viewport": "",
              "execution-while-not-rendered": "",
              "web-share": "",
            } as {})}
          />
        </div>
      </div>

      <div style={styles.controlsContainer}>
        {controls.map((control, index) => (
          <div key={index} style={styles.controlItem}>
            <div style={styles.controlIcon}>{control.icon}</div>
            <span style={styles.controlText}>{control.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveModel;
