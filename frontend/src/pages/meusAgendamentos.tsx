import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price?: number;
  services?: Service[];
  user_name?: string;
  client_name?: string;
  client_id?: string;
}

export default function MeusAgendamentos() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // Estados do modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Estados auxiliares para hover de botões dinâmicos
  const [hoveredBtnId, setHoveredBtnId] = useState<string | null>(null);
  const [hoveredModalBtn, setHoveredModalBtn] = useState<
    "confirm" | "close" | null
  >(null);

  async function fetchAppointments() {
    try {
      setLoading(true);
      const res = await api.get("/api/appointments");
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function handleCancel() {
    if (!appointmentToCancel) return;

    if (!cancelReason.trim()) {
      alert("Informe o motivo do cancelamento.");
      return;
    }

    try {
      setCancelingId(appointmentToCancel.id);

      await api.patch(`/api/appointments/${appointmentToCancel.id}/cancel`, {
        cancellation_reason: cancelReason,
      });

      alert("Agendamento cancelado com sucesso!");

      setShowCancelModal(false);
      setAppointmentToCancel(null);
      setCancelReason("");

      fetchAppointments();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao cancelar agendamento");
    } finally {
      setCancelingId(null);
    }
  }

  // Função auxiliar para formatar a data para DD/MM/YYYY
  const formatDateBR = (dateString: string) => {
    if (!dateString) return "-";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const cardStyle = {
    padding: 20,
    backgroundColor: "var(--bg)",
    borderRadius: 8,
    border: "1px solid var(--border)",
    color: "var(--text-h)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    position: "relative" as const,
  };

  const inputControlStyle = {
    padding: "0.6rem 0.8rem",
    backgroundColor: "var(--bg)",
    color: "var(--text-h)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    outline: "none",
    fontSize: "0.9rem",
    fontFamily: "inherit",
  };

  const getStatusBadgeStyle = (status: string) => {
    let bg = "rgba(128, 128, 128, 0.15)";
    let color = "#888";

    if (status === "scheduled") {
      bg = "rgba(46, 125, 50, 0.15)";
      color = "#2e7d32";
    } else if (status === "completed") {
      bg = "rgba(21, 101, 192, 0.15)";
      color = "#1565c0";
    } else if (status === "cancelled") {
      bg = "rgba(198, 40, 40, 0.15)";
      color = "#c62828";
    }

    return {
      padding: "4px 10px",
      borderRadius: 4,
      fontSize: "0.8rem",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      backgroundColor: bg,
      color: color,
      display: "inline-block",
      width: "fit-content",
    };
  };

  return (
    <div style={{ width: "100%", display: "block" }}>
      <div
        style={{
          padding: 20,
          maxWidth: 1200,
          margin: "0 auto",
          color: "var(--text-h)",
          marginBottom: 60,
        }}
      >
        <h2
          style={{ marginBottom: "2rem", fontWeight: 500, textAlign: "center" }}
        >
          Meus agendamentos
        </h2>

        {loading ? (
          <p style={{ textAlign: "center", opacity: 0.7 }}>
            Carregando agendamentos...
          </p>
        ) : appointments.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.7 }}>
            Nenhum agendamento encontrado.
          </p>
        ) : null}

        {/* Container Grid dos Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {appointments.map((a) => (
            <div key={a.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <span style={getStatusBadgeStyle(a.status)}>
                  {a.status === "scheduled" && "Agendado"}
                  {a.status === "completed" && "Concluído"}
                  {a.status === "cancelled" && "Cancelado"}
                  {a.status === "blocked" && "Bloqueado"}
                </span>
                <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  {a.total_price !== undefined
                    ? `R$ ${a.total_price.toFixed(2)}`
                    : "-"}
                </span>
              </div>

              <p style={{ margin: 0 }}>
                <strong style={{ opacity: 0.8 }}>Data:</strong>{" "}
                {formatDateBR(a.date)}
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ opacity: 0.8 }}>Horário:</strong>{" "}
                {a.start_time?.slice(0, 5)} - {a.end_time?.slice(0, 5)}
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ opacity: 0.8 }}>Cliente:</strong>{" "}
                {a.user_name ?? a.client_name ?? a.client_id}
              </p>

              <div
                style={{
                  marginTop: 5,
                  borderTop: "1px solid var(--border)",
                  paddingTop: 10,
                }}
              >
                <strong
                  style={{
                    opacity: 0.8,
                    fontSize: "0.85rem",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Serviços:
                </strong>
                {a.services && a.services.length > 0 ? (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 20,
                      fontSize: "0.9rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {a.services.map((s) => (
                      <li key={s.id} style={{ opacity: 0.9 }}>
                        {s.name} —{" "}
                        <span style={{ fontWeight: 500 }}>
                          R$ {s.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.5 }}>
                    Nenhum serviço
                  </p>
                )}
              </div>

              {a.status === "scheduled" && (
                <button
                  disabled={cancelingId === a.id}
                  onMouseEnter={() => setHoveredBtnId(a.id)}
                  onMouseLeave={() => setHoveredBtnId(null)}
                  onClick={() => {
                    setAppointmentToCancel(a);
                    setCancelReason("");
                    setShowCancelModal(true);
                  }}
                  style={{
                    marginTop: "auto",
                    padding: "0.5rem 1rem",
                    border: "1px solid rgba(198, 40, 40, 0.3)",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.85rem",
                    transition: "all 0.2s",
                    width: "100%",
                    opacity: cancelingId === a.id ? 0.6 : 1,
                    backgroundColor:
                      hoveredBtnId === a.id
                        ? "#c62828"
                        : "rgba(198, 40, 40, 0.1)",
                    color: hoveredBtnId === a.id ? "#fff" : "#c62828",
                  }}
                >
                  {cancelingId === a.id
                    ? "Cancelando..."
                    : "Cancelar agendamento"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Modal de Cancelamento */}
        {showCancelModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 24,
                width: "100%",
                maxWidth: 450,
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                color: "var(--text-h)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Cancelar agendamento
              </h3>
              <p
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "0.9rem",
                  opacity: 0.8,
                }}
              >
                Por favor, informe detalhadamente o motivo do cancelamento
                abaixo:
              </p>

              <textarea
                rows={4}
                style={{
                  ...inputControlStyle,
                  width: "100%",
                  marginBottom: 20,
                  resize: "none",
                }}
                value={cancelReason}
                placeholder="Digite aqui o motivo..."
                onChange={(e) => setCancelReason(e.target.value)}
              />

              <div
                style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
              >
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setAppointmentToCancel(null);
                    setCancelReason("");
                  }}
                  onMouseEnter={() => setHoveredModalBtn("close")}
                  onMouseLeave={() => setHoveredModalBtn(null)}
                  style={{
                    padding: "0.5rem 1.2rem",
                    color: "var(--text-h)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    transition: "background-color 0.2s",
                    backgroundColor:
                      hoveredModalBtn === "close"
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                  }}
                >
                  Fechar
                </button>

                <button
                  onClick={handleCancel}
                  onMouseEnter={() => setHoveredModalBtn("confirm")}
                  onMouseLeave={() => setHoveredModalBtn(null)}
                  style={{
                    padding: "0.5rem 1.2rem",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    transition: "opacity 0.2s",
                    opacity: hoveredModalBtn === "confirm" ? 0.85 : 1,
                  }}
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
