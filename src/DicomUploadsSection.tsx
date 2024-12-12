// DicomUploadsSection.tsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DicomUploadsSectionStyles } from "./types/styles";

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
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const orders: DicomOrder[] = [
    {
      orderId: "240008",
      collaboratingDoctors: ["Dr Margaret Mwasha", "Prof Symon Guthua"],
      patientId: "IAN BARAKA",
      status: { state: "IN_PROGRESS", progress: 60 },
      creationDate: "25 January 2024",
      lastUpdate: "08 November 2024",
    },
    {
      orderId: "240005",
      collaboratingDoctors: ["Professor Symon Gutha", "Dr Margaret Mwasha"],
      patientId: "LUCY KARIUKI",
      status: { state: "PENDING", progress: 20 },
      creationDate: "20 January 2024",
      lastUpdate: "22 May 2024",
    },
  ];

  const getStatusColor = (status: DicomOrder["status"]["state"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "PENDING":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: DicomOrder["status"]["state"]) => {
    return status.replace("_", " ");
  };

  return (
    <div style={styles.container}>
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

      <div style={styles.controls}>
        <div style={styles.entriesControl}>
          <span style={styles.entriesText}>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            style={styles.entriesSelect}
          >
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span style={styles.entriesText}>entries</span>
        </div>

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search orders..."
            style={styles.searchInput}
          />
          <svg
            style={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

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
