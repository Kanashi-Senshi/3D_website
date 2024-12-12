// src/STLFilesSection.tsx
// src/STLFilesSection.tsx
import React, { useState } from "react";
import { Upload, FolderOpen, Share2, Trash2, Eye } from "lucide-react";

interface STLFile {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  sharedWith: string[];
  notes?: string;
}

const styles = {
  button: {
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    border: "none",
    color: "white",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  fileCard: {
    backgroundColor: "#2d3748",
    borderRadius: "0.5rem",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    padding: "0.5rem",
    borderRadius: "0.375rem",
    border: "none",
    background: "#374151",
    color: "white",
    cursor: "pointer",
  },
};

const STLFilesSection: React.FC = () => {
  const [files, setFiles] = useState<STLFile[]>([
    {
      id: "1",
      name: "product_design_v1.stl",
      uploadDate: "2024-03-14",
      size: "2.4 MB",
      sharedWith: ["Retailer A", "Retailer B"],
      notes: "Initial design draft",
    },
    {
      id: "2",
      name: "prototype_final.stl",
      uploadDate: "2024-03-10",
      size: "3.1 MB",
      sharedWith: ["Retailer A"],
      notes: "Final version for production",
    },
  ]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>STL Files</h2>
        <button
          onClick={() => document.getElementById("file-upload")?.click()}
          style={{
            ...styles.button,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
          }}
        >
          <Upload size={16} />
          Upload New File
        </button>
        <input
          type="file"
          id="file-upload"
          accept=".stl"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFiles((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  name: file.name,
                  uploadDate: new Date().toISOString().split("T")[0],
                  size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  sharedWith: [],
                },
              ]);
            }
          }}
        />
      </div>

      {/* File Grid */}
      <div style={{ display: "grid", gap: "1rem" }}>
        {files.map((file) => (
          <div key={file.id} style={styles.fileCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FolderOpen size={24} color="#6366f1" />
              <div>
                <h3 style={{ marginBottom: "0.25rem" }}>{file.name}</h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                  }}
                >
                  Uploaded: {file.uploadDate} • Size: {file.size}
                </p>
                {file.notes && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      marginTop: "0.25rem",
                    }}
                  >
                    Note: {file.notes}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              {file.sharedWith.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                  }}
                >
                  <Share2 size={16} />
                  Shared with {file.sharedWith.length} retailer
                  {file.sharedWith.length > 1 ? "s" : ""}
                </div>
              )}
              <button
                style={styles.actionButton}
                onClick={() => {
                  // View file logic
                  console.log("Viewing file:", file.name);
                }}
              >
                <Eye size={16} />
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  color: "#ef4444",
                }}
                onClick={() => {
                  setFiles((prev) => prev.filter((f) => f.id !== file.id));
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "#9ca3af",
            backgroundColor: "#2d3748",
            borderRadius: "0.5rem",
          }}
        >
          <Upload size={48} style={{ margin: "0 auto 1rem" }} />
          <p>No STL files uploaded yet</p>
          <button
            onClick={() => document.getElementById("file-upload")?.click()}
            style={{
              ...styles.button,
              marginTop: "1rem",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
            }}
          >
            Upload your first file
          </button>
        </div>
      )}
    </div>
  );
};

export default STLFilesSection;