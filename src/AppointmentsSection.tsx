// AppointmentsSection.tsx
import React, { useState } from "react";
import { Calendar, Clock, User, X } from "lucide-react";
import { AppointmentsSectionStyles } from "./types/styles";

interface Appointment {
  id: string;
  date: string;
  time: string;
  patientName: string;
  doctorName: string;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
}

interface AppointmentsSectionProps {
  userType: "patient" | "doctor";
  currentUserName: string;
}

const styles: AppointmentsSectionStyles = {
  // Main container layout
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },

  // Header section styling
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },

  // Schedule button styling
  scheduleButton: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    borderRadius: "0.5rem",
    color: "white",
    border: "none",
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  // Appointments list container
  appointmentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  // Individual appointment card
  appointmentCard: {
    backgroundColor: "#2d3748",
    borderRadius: "0.5rem",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Appointment information section
  appointmentInfo: {
    display: "flex",
    alignItems: "start",
    gap: "1rem",
  },

  // Icon container styling
  iconContainer: {
    padding: "0.75rem",
    backgroundColor: "#374151",
    borderRadius: "0.5rem",
  },

  // Appointment title styling
  appointmentTitle: {
    fontWeight: "600",
    marginBottom: "0.25rem",
  },

  // Appointment details styling
  appointmentDetails: {
    fontSize: "0.875rem",
    color: "#9ca3af",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },

  // Appointment metadata styling
  appointmentMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  // Status container styling
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  // Action buttons styling
  actionButton: {
    padding: "0.25rem 0.75rem",
    borderRadius: "0.375rem",
    color: "white",
    fontSize: "0.875rem",
    border: "none",
    cursor: "pointer",
  },

  // Confirm button specific styling
  confirmButton: {
    backgroundColor: "#22c55e",
  },

  // Cancel button specific styling
  cancelButton: {
    backgroundColor: "#ef4444",
  },

  // Empty state styling
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#9ca3af",
    backgroundColor: "#2d3748",
    borderRadius: "0.5rem",
  },

  // Modal styling
  modal: {
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
  },

  // Modal content styling
  modalContent: {
    backgroundColor: "#1a1a1a",
    padding: "2.5rem",
    borderRadius: "1rem",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  // Modal header styling
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },

  // Modal title styling
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
  },

  // Close button styling
  closeButton: {
    padding: "0.25rem",
    backgroundColor: "#2d2d2d",
    borderRadius: "0.375rem",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  // Form group styling
  formGroup: {
    marginBottom: "1rem",
  },

  // Label styling
  label: {
    display: "block",
    fontSize: "0.875rem",
    color: "#9ca3af",
    marginBottom: "0.5rem",
  },

  // Input styling
  input: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    backgroundColor: "#2d2d2d",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "0.9rem",
  },

  // Select styling
  select: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    backgroundColor: "#2d2d2d",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "0.9rem",
  },

  // Textarea styling
  textarea: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    backgroundColor: "#2d2d2d",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "0.9rem",
    resize: "none",
  },

  // Modal actions container
  modalActions: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },

  // Modal cancel button
  modalCancelButton: {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "0.375rem",
    backgroundColor: "#2d2d2d",
    color: "white",
    border: "none",
    cursor: "pointer",
  },

  // Modal submit button
  modalSubmitButton: {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "0.375rem",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    color: "white",
    border: "none",
    cursor: "pointer",
  },

  // Previously missing properties
  appointmentContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "1rem",
    backgroundColor: "#2d3748",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
  },

  appointmentIcon: {
    width: "2.5rem",
    height: "2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    color: "#6366f1",
  },

  actionsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginLeft: "auto",
  },

  emptyStateIcon: {
    width: "3rem",
    height: "3rem",
    color: "#9CA3AF",
    margin: "0 auto 1rem",
  },

  scheduleTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "white",
    marginBottom: "1rem",
  },

  appointmentNotes: {
    color: "#9ca3af",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  },
  actionButtons: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
};

const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({
  userType,
  currentUserName,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      date: "2024-03-20",
      time: "10:00",
      patientName: "John Doe",
      doctorName: "Medion",
      status: "confirmed",
      notes: "Product review and customization discussion",
    },
    {
      id: "2",
      date: "2024-03-22",
      time: "14:30",
      patientName: "John Doe",
      doctorName: "Maker Space",
      status: "pending",
      notes: "Initial consultation",
    },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selecteddoctor, setSelecteddoctor] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");

  const doctors = [
    { id: "1", name: "Medion" },
    { id: "2", name: "Maker Space" },
    { id: "3", name: "Pro Printing Solutions" },
  ];

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime || !selecteddoctor) {
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      date: selectedDate,
      time: selectedTime,
      patientName: currentUserName,
      doctorName: selecteddoctor,
      status: "pending",
      notes: appointmentNotes,
    };

    setAppointments([...appointments, newAppointment]);
    setShowScheduleModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDate("");
    setSelectedTime("");
    setSelecteddoctor("");
    setAppointmentNotes("");
  };

  const handleStatusChange = (
    appointmentId: string,
    newStatus: Appointment["status"]
  ) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: '#4CAF50' };
      case 'pending':
        return { backgroundColor: '#FFA500' };
      case 'cancelled':
        return { backgroundColor: '#F44336' };
      default:
        return { backgroundColor: '#808080' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 className="text-2xl font-bold">Appointments</h2>
        {userType === "patient" && (
          <button
            onClick={() => setShowScheduleModal(true)}
            style={styles.scheduleButton}
          >
            <Calendar size={20} />
            Schedule Appointment
          </button>
        )}
      </div>

      <div style={styles.appointmentsList}>
        {appointments
          .filter((apt) =>
            userType === "patient"
              ? apt.patientName === currentUserName
              : apt.doctorName === currentUserName
          )
          .map((appointment) => (
            <div key={appointment.id} style={styles.appointmentCard}>
              <div style={styles.appointmentInfo}>
                <div style={styles.iconContainer}>
                  <Calendar size={24} style={{ color: "#6366f1" }} />
                </div>
                <div>
                  <h3 style={styles.appointmentTitle}>
                    {userType === "patient"
                      ? appointment.doctorName
                      : appointment.patientName}
                  </h3>
                  <div style={styles.appointmentDetails}>
                    <div style={styles.appointmentMeta}>
                      <Clock size={16} />
                      {new Date(appointment.date).toLocaleDateString()} at{" "}
                      {appointment.time}
                    </div>
                    {appointment.notes && (
                      <p style={styles.appointmentNotes}>{appointment.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.statusContainer}>
                <span
                  style={{
                    ...styles.actionButton,
                    ...getStatusColor(appointment.status),
                  }}
                >
                  {appointment.status}
                </span>
                {userType === "doctor" && appointment.status === "pending" && (
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() =>
                        handleStatusChange(appointment.id, "confirmed")
                      }
                      style={{ ...styles.actionButton, ...styles.confirmButton }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(appointment.id, "cancelled")
                      }
                      style={{ ...styles.actionButton, ...styles.cancelButton }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

        {appointments.length === 0 && (
          <div style={styles.emptyState}>
            <Calendar size={48} style={{ margin: "0 auto 1rem" }} />
            <p>No appointments scheduled</p>
          </div>
        )}
      </div>

      {showScheduleModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Schedule Appointment</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div style={styles.formGroup}>
                <label style={styles.label}>Select doctor</label>
                <select
                  value={selecteddoctor}
                  onChange={(e) => setSelecteddoctor(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.name}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={styles.input}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (Optional)</label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  style={styles.textarea}
                  rows={3}
                  placeholder="Add any notes or special requests..."
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={styles.modalCancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleAppointment}
                  style={{
                    ...styles.modalSubmitButton,
                    opacity: !selectedDate || !selectedTime || !selecteddoctor ? 0.5 : 1,
                  }}
                  disabled={!selectedDate || !selectedTime || !selecteddoctor}
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsSection;