import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

export default function Agendamento() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [hoveredBtnId, setHoveredBtnId] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isAdminBooking = location.state?.isAdminBooking;

  useEffect(() => {
    api.get("/api/services").then((res) => {
      setServices(res.data.services);
    });
  }, []);
  // funcao para formatar a duracao dos servicos
  function durationServices(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} min`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}min`;
  }
  // funcao para verificar se o servico esta selecionado
  function isSelected(serviceId: string) {
    return selectedServices.some((service) => service.id === serviceId);
  }
  // funcao para selecionar ou deselecionar um servico
  function toggleService(service: Service) {
    const alreadySelected = isSelected(service.id);

    if (alreadySelected) {
      setSelectedServices((prev) =>
        prev.filter((selected) => selected.id !== service.id),
      );
    } else {
      setSelectedServices((prev) => [...prev, service]);
    }
  }
  // funcao para calcular o preco total
  const totalPrice = selectedServices.reduce((sum, service) => {
    return sum + Number(service.price);
  }, 0);
  // funcao para calcular a duracao total
  const totalDuration = selectedServices.reduce((sum, service) => {
    return sum + Number(service.duration_minutes);
  }, 0);
  // funcao para continuar para a pagina de horarios
  function handleContinue() {
    if (selectedServices.length === 0) {
      alert("Selecione pelo menos um serviço.");
      return;
    }
    // funcao para pegar os ids dos servicos selecionados e passar para a proxima pagina
    const serviceIds = selectedServices.map((service) => service.id).join(",");

    navigate(`/horarios/${serviceIds}`, {
      state: {
        selectedServices,
        isAdminBooking,
      },
    });
  }

  const cardStyle = {
    padding: 20,
    backgroundColor: "var(--bg)",
    borderRadius: 8,
    border: "1px solid var(--border)",
    color: "var(--text-h)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
    position: "relative" as const,
  };

  return (
    <div style={{ width: "100%", display: "block" }}>
      <div
        style={{
          padding: 20,
          maxWidth: 1200,
          margin: "0 auto",
          color: "var(--text-h)",
          marginBottom: 120,
        }}
      >
        <h1
          style={{
            fontWeight: 500,
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Escolha os serviços
        </h1>

        <p style={{ textAlign: "center", opacity: 0.7, marginBottom: "2rem" }}>
          Você pode selecionar um ou mais serviços para o mesmo agendamento.
        </p>

        <div
          style={{
            margin: "0 auto 2rem auto",
            maxWidth: 700,
            padding: 20,
            border: "1px solid var(--border)",
            borderRadius: 8,
            backgroundColor: "var(--bg)",
            color: "var(--text-h)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            {/*mostra preco e duracao total services*/}
            <strong>{selectedServices.length}</strong> serviço(s) selecionado(s)
            <br />
            <span style={{ opacity: 0.8 }}>
              Total: R$ {totalPrice.toFixed(2)} — Duração:{" "}
              {durationServices(totalDuration)}
            </span>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedServices.length === 0}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor:
                selectedServices.length === 0 ? "#999" : "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: selectedServices.length === 0 ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            Continuar para horários
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {services.map((service) => {
            const selected = isSelected(service.id);

            return (
              <div
                key={service.id}
                style={{
                  ...cardStyle,
                  border: selected
                    ? "2px solid var(--accent)"
                    : "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: 10,
                  }}
                >
                  {service.name}
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.3rem",
                      color: "var(--text-h)",
                      fontWeight: 600,
                    }}
                  >
                    R$ {Number(service.price).toFixed(2)}
                  </p>

                  <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.7 }}>
                    🕒 Duração: {durationServices(service.duration_minutes)}
                  </p>
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    onMouseEnter={() => setHoveredBtnId(service.id)}
                    onMouseLeave={() => setHoveredBtnId(null)}
                    onClick={() => toggleService(service)}
                    style={{
                      padding: "0.6rem 1rem",
                      backgroundColor: selected
                        ? "transparent"
                        : hoveredBtnId === service.id
                          ? "transparent"
                          : "var(--accent)",
                      color:
                        selected || hoveredBtnId === service.id
                          ? "var(--accent)"
                          : "#fff",
                      border: "1px solid var(--accent)",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      transition: "all 0.2s",
                      width: "100%",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    {selected ? "Selecionado" : "Selecionar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
          </div>
        </div>
      </div>
    </div>
  );
}
