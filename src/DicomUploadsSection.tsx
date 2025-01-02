// DicomUploadsSection.tsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DicomUploadsSectionStyles } from "./types/styles";
import axios from 'axios';
import { API_URL } from '../config';

interface DicomOrder {
  orderId: string;
  collaboratingDoctors: string[];
  patientId: string;
  status: {
    state: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    progress: number;
  };
  creationDate: string;
  lastUpdate: string;
}

const styles: DicomUploadsSectionStyles = {
  container: {
    width: "100%",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #4B5563",
  },
  tabButton: {
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#9CA3AF",
    borderBottom: "none",
    transition: "color 0.2s, border-color 0.2s",
  },
  activeTabButton: {
    color: "#4F46E5",
    borderBottom: "2px solid #4F46E5",
  },
  uploadModal: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderRadius: "0.5rem",
    padding: "2rem",
    width: "90%",
    maxWidth: "500px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    padding: "0.5rem",
  },
  uploadArea: {
    border: "2px dashed #4B5563",
    borderRadius: "0.5rem",
    padding: "2rem",
    textAlign: "center" as const,
    cursor: "pointer",
    marginBottom: "1.5rem",
  },
  uploadAreaActive: {
    borderColor: "#4F46E5",
    backgroundColor: "rgba(79, 70, 229, 0.1)",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#374151",
    border: "1px solid #4B5563",
    borderRadius: "0.375rem",
    color: "white",
    marginBottom: "1rem",
  },
  uploadButton: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#4F46E5",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  filePreview: {
    backgroundColor: "#374151",
    padding: "0.75rem",
    borderRadius: "0.375rem",
    marginBottom: "1rem",
  },
  fileName: {
    color: "white",
    marginBottom: "0.25rem",
  },
  fileSize: {
    color: "#9CA3AF",
    fontSize: "0.875rem",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  entriesControl: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  entriesText: {
    fontSize: "0.875rem",
    color: "#9CA3AF",
  },
  entriesSelect: {
    backgroundColor: "#1E293B",
    border: "1px solid #4B5563",
    borderRadius: "0.375rem",
    padding: "0.25rem 0.5rem",
    fontSize: "0.875rem",
    color: "white",
  },
  searchContainer: {
    position: "relative",
  },
  searchInput: {
    backgroundColor: "#1E293B",
    border: "1px solid #4B5563",
    borderRadius: "0.375rem",
    padding: "0.5rem 1rem 0.5rem 2.5rem",
    fontSize: "0.875rem",
    color: "white",
    width: "16rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  searchIcon: {
    position: "absolute",
    left: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    width: "1rem",
    height: "1rem",
    color: "#9CA3AF",
  },
  tableContainer: {
    backgroundColor: "#1E293B",
    borderRadius: "0.5rem",
    border: "1px solid #4B5563",
    overflow: "hidden",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    borderBottom: "1px solid #4B5563",
  },
  tableHeaderCell: {
    padding: "1rem",
    textAlign: "left",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#9CA3AF",
  },
  tableRow: {
    backgroundColor: "inherit",
    transition: "background-color 0.15s",
  },
  tableCell: {
    padding: "1rem",
    fontSize: "0.875rem",
    color: "#D1D5DB",
  },
  statusContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  statusText: {
    fontSize: "0.875rem",
    color: "#D1D5DB",
  },
  progressBar: {
    width: "100%",
    height: "0.5rem",
    backgroundColor: "#4B5563",
    borderRadius: "9999px",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "9999px",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1rem",
  },
  paginationInfo: {
    fontSize: "0.875rem",
    color: "#9CA3AF",
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  paginationButton: {
    padding: "0.5rem",
    backgroundColor: "#1E293B",
    border: "1px solid #4B5563",
    borderRadius: "0.375rem",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  paginationNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  paginationActive: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4F46E5",
    color: "white",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
  },
};

const DicomUploadsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"current" | "completed">("current");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [orders, setOrders] = useState<DicomOrder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [patientId, setPatientId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const status = activeTab === "current" ? "PENDING,IN_PROGRESS" : "COMPLETED";
      const response = await axios.get(`${API_URL}/api/dicom-orders?status=${status}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || !patientId) return;

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('files', file);
    });
    formData.append('patientId', patientId);

    try {
      await axios.post(`${API_URL}/api/dicom-orders/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setShowUploadModal(false);
      setSelectedFiles(null);
      setPatientId("");
      fetchOrders();
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.tabs}>
          {(["current", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab ? styles.activeTabButton : {}),
              }}
            >
              {tab === "current" ? "Current Orders" : "Completed Orders"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          style={styles.uploadButton}
        >
          <Upload size={20} />
          Upload DICOM Files
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.uploadModal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Upload DICOM Files</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                ...styles.uploadArea,
                ...(isDragging ? styles.uploadAreaActive : {})
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files)}
                multiple
                accept=".dcm,.dicom"
              />
              <Upload size={32} style={{ margin: '0 auto', marginBottom: '1rem' }} />
              <p>Drag and drop DICOM files here or click to browse</p>
            </div>

            {selectedFiles && (
              <div style={styles.filePreview}>
                <p style={styles.fileName}>
                  Selected {selectedFiles.length} file(s)
                </p>
                <p style={styles.fileSize}>
                  Total size: {Array.from(selectedFiles).reduce((acc, file) => acc + file.size, 0) / 1024 / 1024} MB
                </p>
              </div>
            )}

            <input
              type="text"
              placeholder="Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              style={styles.input}
            />

            <button
              onClick={handleUpload}
              disabled={!selectedFiles || !patientId}
              style={{
                ...styles.uploadButton,
                ...(!selectedFiles || !patientId ? styles.disabledButton : {})
              }}
            >
              Upload Files
            </button>
          </div>
        </div>
      )}


      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              {["Order ID", "Collaborating Doctors", "Patient ID", "Status", "Creation Date", "Last Update"].map(
                (header) => (
                  <th key={header} style={styles.tableHeaderCell}>
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} style={styles.tableRow}>
                <td style={{ ...styles.tableCell, color: "white" }}>
                  {order.orderId}
                </td>
                <td style={styles.tableCell}>{order.collaboratingDoctors.join(", ")}</td>
                <td style={styles.tableCell}>{order.patientId}</td>
                <td style={{ ...styles.tableCell, padding: "1rem" }}>
                  <div style={styles.statusContainer}>
                    <span style={styles.statusText}>
                      {getStatusText(order.status.state)}
                    </span>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${order.status.progress}%`,
                          backgroundColor: getStatusColor(order.status.state),
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td style={styles.tableCell}>{order.creationDate}</td>
                <td style={styles.tableCell}>{order.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <div style={styles.paginationInfo}>
          Showing 1 to {entriesPerPage} of {orders.length} entries
        </div>
        <div style={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            style={{
              ...styles.paginationButton,
              ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
            }}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={styles.paginationNumbers}>
            <button style={styles.paginationActive}>1</button>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{
              ...styles.paginationButton,
              ...(currentPage * entriesPerPage >= orders.length
                ? styles.paginationButtonDisabled
                : {}),
            }}
            disabled={currentPage * entriesPerPage >= orders.length}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DicomUploadsSection;
