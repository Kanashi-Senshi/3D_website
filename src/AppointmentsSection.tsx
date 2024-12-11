// src/AppointmentsSection.tsx
import React, { useState } from "react";
import { Calendar, Clock, User, X } from "lucide-react";

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

  // Mock doctors list - in production, this would come from an API
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

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments</h2>
        {userType === "patient" && (
          <button
            onClick={() => setShowScheduleModal(true)}
            style={{
              padding: "0.5rem 1rem",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              borderRadius: "0.5rem",
              color: "white",
              border: "none",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Calendar size={20} />
            Schedule Appointment
          </button>
        )}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments
          .filter((apt) =>
            userType === "patient"
              ? apt.patientName === currentUserName
              : apt.doctorName === currentUserName
          )
          .map((appointment) => (
            <div
              key={appointment.id}
              style={{
                backgroundColor: "#2d3748",
                borderRadius: "0.5rem",
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "start", gap: "1rem" }}
              >
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#374151",
                    borderRadius: "0.5rem",
                  }}
                >
                  <Calendar size={24} style={{ color: "#6366f1" }} />
                </div>
                <div>
                  <h3
                    style={{
                      fontWeight: "semibold",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {userType === "patient"
                      ? appointment.doctorName
                      : appointment.patientName}
                  </h3>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Clock size={16} />
                      {new Date(appointment.date).toLocaleDateString()} at{" "}
                      {appointment.time}
                    </div>
                    {appointment.notes && (
                      <p style={{ color: "#9ca3af" }}>{appointment.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    color: "white",
                    ...getStatusColor(appointment.status),
                  }}
                >
                  {appointment.status}
                </span>
                {userType === "doctor" && appointment.status === "pending" && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() =>
                        handleStatusChange(appointment.id, "confirmed")
                      }
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: "#22c55e",
                        borderRadius: "0.375rem",
                        color: "white",
                        fontSize: "0.875rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(appointment.id, "cancelled")
                      }
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: "#ef4444",
                        borderRadius: "0.375rem",
                        color: "white",
                        fontSize: "0.875rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

        {appointments.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "#9ca3af",
              backgroundColor: "#2d3748",
              borderRadius: "0.5rem",
            }}
          >
            <Calendar size={48} style={{ margin: "0 auto 1rem" }} />
            <p>No appointments scheduled</p>
          </div>
        )}
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div
          style={{
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
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "2.5rem",
              borderRadius: "1rem",
              width: "100%",
              maxWidth: "400px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "semibold" }}>
                Schedule Appointment
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{
                  padding: "0.25rem",
                  backgroundColor: "#2d2d2d",
                  borderRadius: "0.375rem",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                    marginBottom: "0.5rem",
                  }}
                >
                  Select doctor
                </label>
                <select
                  value={selecteddoctor}
                  onChange={(e) => setSelecteddoctor(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "#2d2d2d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.name}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                    marginBottom: "0.5rem",
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "#2d2d2d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "0.9rem",
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                    marginBottom: "0.5rem",
                  }}
                >
                  Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "#2d2d2d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                    marginBottom: "0.5rem",
                  }}
                >
                  Notes (Optional)
                </label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "#2d2d2d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "0.9rem",
                    resize: "none",
                  }}
                  rows={3}
                  placeholder="Add any notes or special requests..."
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "#2d2d2d",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleAppointment}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
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
