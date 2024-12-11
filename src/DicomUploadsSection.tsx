// src/DicomUploadsSection.tsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const DicomUploadsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"current" | "completed">(
    "current"
  );
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data
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
    // Add more mock data as needed
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
    <div style={{ width: "100%" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid #4B5563",
        }}
      >
        {(["current", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: activeTab === tab ? "#4F46E5" : "#9CA3AF",
              borderBottom: activeTab === tab ? "2px solid #4F46E5" : "none",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            {tab === "current" ? "Current Orders" : "Completed Orders"}
          </button>
        ))}
      </div>

      {/* Table Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            style={{
              backgroundColor: "#1E293B",
              border: "1px solid #4B5563",
              borderRadius: "0.375rem",
              padding: "0.25rem 0.5rem",
              fontSize: "0.875rem",
              color: "white",
            }}
          >
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>
            entries
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search orders..."
            style={{
              backgroundColor: "#1E293B",
              border: "1px solid #4B5563",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem 0.5rem 2.5rem",
              fontSize: "0.875rem",
              color: "white",
              width: "16rem",
              outline: "none",
              transition: "border-color 0.2s",
            }}
          />
          <svg
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "1rem",
              height: "1rem",
              color: "#9CA3AF",
            }}
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

      {/* Table */}
      <div
        style={{
          backgroundColor: "#1E293B",
          borderRadius: "0.5rem",
          border: "1px solid #4B5563",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #4B5563" }}>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#9CA3AF",
                }}
              >
                Order ID
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#9CA3AF",
                }}
              >
                Collaborating Doctors
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#9CA3AF",
                }}
              >
                Patient ID
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#9CA3AF",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#9CA3AF",
                }}
              >
                Creation Date
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#9CA3AF",
                }}
              >
                Last Update
              </th>
            </tr>
          </thead>
          <tbody style={{ borderCollapse: "collapse" }}>
            {orders.map((order) => (
              <tr
                key={order.orderId}
                style={{
                  backgroundColor: "inherit",
                  transition: "background-color 0.15s",
                  "&:hover": {
                    backgroundColor: "#2D3748",
                  },
                }}
              >
                <td
                  style={{
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: "white",
                  }}
                >
                  {order.orderId}
                </td>
                <td
                  style={{
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: "#D1D5DB",
                  }}
                >
                  {order.collaboratingDoctors.join(", ")}
                </td>
                <td
                  style={{
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: "#D1D5DB",
                  }}
                >
                  {order.patientId}
                </td>
                <td
                  style={{
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#D1D5DB",
                      }}
                    >
                      {getStatusText(order.status.state)}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: "0.5rem",
                        backgroundColor: "#4B5563",
                        borderRadius: "9999px",
                      }}
                    >
                      <div
                        style={{
                          width: `${order.status.progress}%`,
                          height: "100%",
                          backgroundColor: getStatusColor(order.status.state),
                          borderRadius: "9999px",
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: "#D1D5DB",
                  }}
                >
                  {order.creationDate}
                </td>
                <td
                  style={{
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: "#D1D5DB",
                  }}
                >
                  {order.lastUpdate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "0.875rem",
            color: "#9CA3AF",
          }}
        >
          Showing 1 to {entriesPerPage} of {orders.length} entries
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            style={{
              padding: "0.5rem",
              backgroundColor: "#1E293B",
              border: "1px solid #4B5563",
              borderRadius: "0.375rem",
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "#2D3748",
              },
              "&:disabled": {
                opacity: 0.5,
                cursor: "not-allowed",
              },
            }}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <button
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4F46E5",
                color: "white",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              1
            </button>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{
              padding: "0.5rem",
              backgroundColor: "#1E293B",
              border: "1px solid #4B5563",
              borderRadius: "0.375rem",
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "#2D3748",
              },
              "&:disabled": {
                opacity: 0.5,
                cursor: "not-allowed",
              },
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
