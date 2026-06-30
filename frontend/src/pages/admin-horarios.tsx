import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

interface BusinessHour {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_open: boolean;
}

interface Appointment {
  id: string;
  client_id?: string;
  client_name?: string;
  user_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price?: number;
  cancellation_reason?: string;
  services?: Array<{ id: string; name: string; price: number }>;
}

const dayNames = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export default function AdminHorarios() {
  const navigate = useNavigate();
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<
    string | null
  >(null);

  const [tempData, setTempData] = useState<Partial<BusinessHour>>({
    is_open: false,
    open_time: "",
    close_time: "",
    break_start_time: "",
    break_end_time: "",
    day_of_week: 0,
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  async function fetchBusinessHours() {
    try {
      setLoading(true);
      const res = await api.get("/api/dashboard/business-hours");
      setBusinessHours(res.data.business_hours || []);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar horários");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppointmentsForDay(date: string) {
    try {
      const res = await api.get(`/api/appointments?date=${date}`);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    }
  }

  async function updateAppointmentStatus(
    appointmentId: string,
    newStatus: string,
  ) {
    try {
      setUpdatingAppointmentId(appointmentId);
      await api.put(`/api/appointments/${appointmentId}`, {
        status: newStatus,
      });
      alert("Agendamento atualizado!");
      fetchAppointmentsForDay(selectedDate);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao atualizar agendamento");
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  async function cancelAppointment() {
    if (!appointmentToCancel) return;
    if (!cancelReason.trim()) {
      alert("Informe o motivo do cancelamento.");
      return;
    }

    try {
      setUpdatingAppointmentId(appointmentToCancel.id);
      await api.patch(`/api/appointments/${appointmentToCancel.id}/cancel`, {
        cancellation_reason: cancelReason,
      });
      alert("Agendamento cancelado!");
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      setCancelReason("");
      fetchAppointmentsForDay(selectedDate);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao cancelar agendamento");
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  const handleEdit = (day: BusinessHour) => {
    setEditingDay(day.day_of_week);
    setTempData({ ...day });
  };

  const handleCancel = () => {
    setEditingDay(null);
    setTempData({});
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.patch("/api/dashboard/business-hours", {
        day_of_week: tempData.day_of_week,
        open_time: tempData.open_time,
        close_time: tempData.close_time,
        break_start_time:
          tempData.break_start_time && tempData.break_start_time !== "00:00:00"
            ? tempData.break_start_time
            : null,
        break_end_time:
          tempData.break_end_time && tempData.break_end_time !== "00:00:00"
            ? tempData.break_end_time
            : null,
        is_open: !!tempData.is_open,
      });
      alert("Horários atualizados com sucesso!");
      setEditingDay(null);
      fetchBusinessHours();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao atualizar horários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointmentsForDay(selectedDate);
    }
  }, [selectedDate]);

  const containerPanelStyle = {
    marginBottom: 40,
    padding: 20,
    backgroundColor: "var(--bg)",
    borderRadius: 8,
    border: "1px solid var(--border)",
    color: "var(--text-h)",
  };

  const inputStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "var(--bg)",
    color: "var(--text-h)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    fontSize: "0.9rem",
    outline: "none",
    transition: "opacity 0.2s",
  };

  const buttonBase = {
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    fontSize: "0.9rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "500" as const,
    transition: "opacity 0.2s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const getAccentButtonStyle = (id: string) => ({
    ...buttonBase,
    backgroundColor: "var(--accent)",
    color: "#fff",
    opacity: hoveredElementId === id ? 0.85 : 1,
  });

  const getCancelButtonStyle = (id: string) => ({
    ...buttonBase,
    backgroundColor: "var(--border)",
    color: "var(--text-h)",
    opacity: hoveredElementId === id ? 0.8 : 1,
  });

  const getSuccessButtonStyle = (id: string) => ({
    ...buttonBase,
    backgroundColor: "#2e7d32",
    color: "#fff",
    opacity: hoveredElementId === id ? 0.85 : 1,
  });

  const getDangerButtonStyle = (id: string) => ({
    ...buttonBase,
    backgroundColor: "#d32f2f",
    color: "#fff",
    opacity: hoveredElementId === id ? 0.85 : 1,
  });

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1200,
        margin: "0 auto",
        color: "var(--text-h)",
        marginBottom: 80,
      }}
    >
      <h1 style={{ textAlign: "center", fontWeight: 500, marginBottom: 30 }}>
        ⏰ Administração — Horários & Agenda
      </h1>

      {/* BLOCO 1: AGENDA DO DIA */}
      <div style={containerPanelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: 25,
            borderBottom: "1px solid var(--border)",
            paddingBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0, fontWeight: 500 }}>📅 Agendamentos do Dia</h2>

          <button
            id="admin-new-booking"
            onClick={() =>
              navigate("/agendamento", { state: { isAdminBooking: true } })
            }
            style={{
              ...buttonBase,
              backgroundColor: "var(--accent)",
              color: "#fff",
              padding: "8px 18px",
              fontSize: "0.9rem",
              opacity: hoveredElementId === "admin-new-booking" ? 0.85 : 1,
            }}
            onMouseEnter={() => setHoveredElementId("admin-new-booking")}
            onMouseLeave={() => setHoveredElementId(null)}
          >
            ➕ Novo Agendamento
          </button>
        </div>

        <div
          style={{
            marginBottom: 25,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <label style={{ fontWeight: "500", fontSize: "0.95rem" }}>
            Selecione a data:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ ...inputStyle, width: "fit-content" }}
          />
        </div>

        {appointments.length === 0 ? (
          <p
            style={{
              color: "var(--text-h)",
              opacity: 0.6,
              fontStyle: "italic",
            }}
          >
            Nenhum agendamento para este dia.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "transparent",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--border)",
                  background: "var(--bg)",
                }}
              >
                <th style={{ padding: 12, textAlign: "left", fontWeight: 500 }}>
                  Cliente
                </th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 500 }}>
                  Serviços
                </th>
                <th
                  style={{ padding: 12, textAlign: "center", fontWeight: 500 }}
                >
                  Horário
                </th>
                <th
                  style={{ padding: 12, textAlign: "center", fontWeight: 500 }}
                >
                  Valor
                </th>
                <th
                  style={{ padding: 12, textAlign: "center", fontWeight: 500 }}
                >
                  Status
                </th>
                <th
                  style={{ padding: 12, textAlign: "center", fontWeight: 500 }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr
                  key={appt.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: 12, textAlign: "left" }}>
                    <strong>
                      {appt.user_name ?? appt.client_name ?? appt.client_id}
                    </strong>
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "left",
                      fontSize: "0.85rem",
                      opacity: 0.8,
                    }}
                  >
                    {appt.services?.map((s) => s.name).join(", ") || "—"}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    {appt.start_time?.slice(0, 5)} -{" "}
                    {appt.end_time?.slice(0, 5)}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    {appt.total_price
                      ? `R$ ${appt.total_price.toFixed(2)}`
                      : "—"}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: "bold",
                        backgroundColor:
                          appt.status === "scheduled"
                            ? "#c8e6c9"
                            : appt.status === "completed"
                              ? "#bbdefb"
                              : appt.status === "cancelled"
                                ? "#ffcdd2"
                                : "var(--border)",
                        color:
                          appt.status === "scheduled"
                            ? "#2e7d32"
                            : appt.status === "completed"
                              ? "#1565c0"
                              : appt.status === "cancelled"
                                ? "#c62828"
                                : "var(--text-h)",
                      }}
                    >
                      {appt.status === "scheduled" && "Agendado"}
                      {appt.status === "completed" && "Concluído"}
                      {appt.status === "cancelled" && "Cancelado"}
                      {appt.status === "blocked" && "Bloqueado"}
                    </span>
                    {appt.status === "cancelled" &&
                      appt.cancellation_reason && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 8,
                            background: "#fff3cd",
                            border: "1px solid #ffeeba",
                            borderRadius: 4,
                            fontSize: 11,
                            textAlign: "left",
                            color: "#721c24",
                          }}
                        >
                          <strong>Motivo:</strong>
                          <br />
                          {appt.cancellation_reason}
                        </div>
                      )}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    {appt.status === "scheduled" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateAppointmentStatus(appt.id, "completed")
                          }
                          disabled={updatingAppointmentId === appt.id}
                          style={{
                            ...getSuccessButtonStyle(`done-${appt.id}`),
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.8rem",
                          }}
                          onMouseEnter={() =>
                            setHoveredElementId(`done-${appt.id}`)
                          }
                          onMouseLeave={() => setHoveredElementId(null)}
                        >
                          ✓ Concluir
                        </button>
                        <button
                          onClick={() => {
                            setAppointmentToCancel(appt);
                            setCancelReason("");
                            setShowCancelModal(true);
                          }}
                          disabled={updatingAppointmentId === appt.id}
                          style={{
                            ...getDangerButtonStyle(`can-${appt.id}`),
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.8rem",
                          }}
                          onMouseEnter={() =>
                            setHoveredElementId(`can-${appt.id}`)
                          }
                          onMouseLeave={() => setHoveredElementId(null)}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CANCELAMENTO */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "var(--bg)",
              padding: 25,
              borderRadius: 8,
              border: "1px solid var(--border)",
              width: "100%",
              maxWidth: 450,
              color: "var(--text-h)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <h3 style={{ margin: 0, fontWeight: 500 }}>Cancelar agendamento</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
              Informe o motivo do cancelamento:
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              style={{ ...inputStyle, width: "100%", resize: "none" }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 5,
              }}
            >
              <button
                style={getDangerButtonStyle("modal-confirm")}
                onClick={cancelAppointment}
                onMouseEnter={() => setHoveredElementId("modal-confirm")}
                onMouseLeave={() => setHoveredElementId(null)}
              >
                Confirmar cancelamento
              </button>
              <button
                style={getCancelButtonStyle("modal-close")}
                onClick={() => {
                  setShowCancelModal(false);
                  setAppointmentToCancel(null);
                  setCancelReason("");
                }}
                onMouseEnter={() => setHoveredElementId("modal-close")}
                onMouseLeave={() => setHoveredElementId(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCO 2: HORÁRIOS DE ATENDIMENTO */}
      {businessHours.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.6 }}>
          Carregando horários...
        </p>
      ) : (
        <>
          <h3
            style={{
              marginTop: 40,
              marginBottom: 20,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Horários por Dia da Semana
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gridAutoRows: "1fr",
              gap: 20,
            }}
          >
            {businessHours.map((day) => (
              <div
                key={day.day_of_week}
                style={{
                  padding: 20,
                  borderRadius: 8,
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "var(--bg)",
                  border:
                    editingDay === day.day_of_week
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border)",
                  boxShadow:
                    editingDay === day.day_of_week
                      ? "0 0 0 1px var(--accent)"
                      : "none",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 15px 0",
                      fontWeight: 500,
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: 8,
                    }}
                  >
                    {dayNames[day.day_of_week]}
                  </h3>

                  {editingDay === day.day_of_week ? (
                    <div>
                      <div style={{ marginBottom: 15 }}>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            fontWeight: "500",
                            fontSize: 14,
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!tempData.is_open}
                            onChange={(e) =>
                              setTempData({
                                ...tempData,
                                is_open: e.target.checked,
                              })
                            }
                            style={{
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                              accentColor: "var(--accent)",
                            }}
                          />
                          Aberto para Atendimento
                        </label>
                      </div>

                      {tempData.is_open && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              marginBottom: 15,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: 5,
                                  fontSize: 12,
                                  opacity: 0.8,
                                }}
                              >
                                Abre às:
                              </label>
                              <input
                                type="time"
                                value={
                                  tempData.open_time &&
                                  tempData.open_time !== "00:00:00"
                                    ? tempData.open_time.slice(0, 5)
                                    : ""
                                }
                                onChange={(e) =>
                                  setTempData({
                                    ...tempData,
                                    open_time: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: 5,
                                  fontSize: 12,
                                  opacity: 0.8,
                                }}
                              >
                                Fecha às:
                              </label>
                              <input
                                type="time"
                                value={
                                  tempData.close_time &&
                                  tempData.close_time !== "00:00:00"
                                    ? tempData.close_time.slice(0, 5)
                                    : ""
                                }
                                onChange={(e) =>
                                  setTempData({
                                    ...tempData,
                                    close_time: e.target.value,
                                  })
                                }
                                style={inputStyle}
                              />
                            </div>
                          </div>

                          <div
                            style={{
                              marginBottom: 15,
                              padding: "10px",
                              backgroundColor: "var(--bg)",
                              borderRadius: 4,
                              border: "1px dashed var(--border)",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                marginBottom: 8,
                                fontSize: 12,
                                fontWeight: "500",
                                opacity: 0.9,
                              }}
                            >
                              🥪 Intervalo
                            </span>
                            <div style={{ display: "flex", gap: 10 }}>
                              <div style={{ flex: 1 }}>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: 3,
                                    fontSize: 11,
                                    opacity: 0.7,
                                  }}
                                >
                                  Início:
                                </label>
                                <input
                                  type="time"
                                  value={
                                    tempData.break_start_time &&
                                    tempData.break_start_time !== "00:00:00"
                                      ? tempData.break_start_time.slice(0, 5)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setTempData({
                                      ...tempData,
                                      break_start_time: e.target.value,
                                    })
                                  }
                                  style={{
                                    ...inputStyle,
                                    padding: "6px",
                                    fontSize: 13,
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: 3,
                                    fontSize: 11,
                                    opacity: 0.7,
                                  }}
                                >
                                  Fim:
                                </label>
                                <input
                                  type="time"
                                  value={
                                    tempData.break_end_time &&
                                    tempData.break_end_time !== "00:00:00"
                                      ? tempData.break_end_time.slice(0, 5)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setTempData({
                                      ...tempData,
                                      break_end_time: e.target.value,
                                    })
                                  }
                                  style={{
                                    ...inputStyle,
                                    padding: "6px",
                                    fontSize: 13,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p
                        style={{
                          margin: "0 0 12px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <strong>Expediente:</strong>{" "}
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: "bold",
                            backgroundColor: day.is_open
                              ? "#d4edda"
                              : "#f8d7da",
                            color: day.is_open ? "#155724" : "#721c24",
                          }}
                        >
                          {day.is_open ? "ABERTO" : "FECHADO"}
                        </span>
                      </p>

                      {day.is_open ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          <p style={{ margin: 0, fontSize: "0.9rem" }}>
                            <strong>Horário:</strong>{" "}
                            {day.open_time && day.open_time !== "00:00:00"
                              ? day.open_time.slice(0, 5)
                              : "—"}{" "}
                            às{" "}
                            {day.close_time && day.close_time !== "00:00:00"
                              ? day.close_time.slice(0, 5)
                              : "—"}
                          </p>

                          {day.break_start_time &&
                          day.break_end_time &&
                          day.break_start_time !== "00:00:00" &&
                          day.break_end_time !== "00:00:00" ? (
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.85rem",
                                opacity: 0.7,
                              }}
                            >
                              <strong>Intervalo:</strong>{" "}
                              {day.break_start_time.slice(0, 5)} às{" "}
                              {day.break_end_time.slice(0, 5)}
                            </p>
                          ) : (
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.85rem",
                                opacity: 0.5,
                                fontStyle: "italic",
                              }}
                            >
                              Sem intervalo
                            </p>
                          )}
                        </div>
                      ) : (
                        <p
                          style={{
                            margin: "10px 0",
                            fontSize: "0.9rem",
                            opacity: 0.6,
                            fontStyle: "italic",
                          }}
                        >
                          🚫 Não há atendimento neste dia.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 20 }}>
                  {editingDay === day.day_of_week ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                          ...getSuccessButtonStyle(`sv-${day.day_of_week}`),
                          flex: 1,
                        }}
                        onMouseEnter={() =>
                          setHoveredElementId(`sv-${day.day_of_week}`)
                        }
                        onMouseLeave={() => setHoveredElementId(null)}
                      >
                        {loading ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        style={{
                          ...getCancelButtonStyle(`cn-${day.day_of_week}`),
                          flex: 1,
                        }}
                        onMouseEnter={() =>
                          setHoveredElementId(`cn-${day.day_of_week}`)
                        }
                        onMouseLeave={() => setHoveredElementId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(day)}
                      style={{
                        ...getAccentButtonStyle(`ed-${day.day_of_week}`),
                        width: "100%",
                      }}
                      onMouseEnter={() =>
                        setHoveredElementId(`ed-${day.day_of_week}`)
                      }
                      onMouseLeave={() => setHoveredElementId(null)}
                    >
                      ✏️ Editar Horários
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
