interface Appointment {
  id: string;
  payment_method?: string;
  payment_status?: string;
}

interface AdminPaymentModalProps {
  appointment: Appointment | null;
  paymentMethod: string;
  paymentStatus: string;
  loading: boolean;
  onChangePaymentMethod: (value: string) => void;
  onChangePaymentStatus: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function AdminPaymentModal({
  appointment,
  paymentMethod,
  paymentStatus,
  loading,
  onChangePaymentMethod,
  onChangePaymentStatus,
  onClose,
  onSave,
}: AdminPaymentModalProps) {
  if (!appointment) return null;

  const inputStyle = {
    padding: "0.6rem 0.8rem",
    backgroundColor: "var(--bg)",
    color: "var(--text-h)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    outline: "none",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  const buttonStyle = {
    padding: "0.6rem 1rem",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontWeight: 500 as const,
  };

  return (
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
        padding: 20,
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
          gap: 16,
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 500 }}>Editar pagamento</h3>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            Forma de pagamento
          </label>

          <select
            value={paymentMethod}
            onChange={(e) => onChangePaymentMethod(e.target.value)}
            style={inputStyle}
          >
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de crédito</option>
            <option value="debit_card">Cartão de débito</option>
            <option value="cash">Dinheiro</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            Status do pagamento
          </label>

          <select
            value={paymentStatus}
            onChange={(e) => onChangePaymentStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 10,
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: "var(--border)",
              color: "var(--text-h)",
            }}
          >
            Fechar
          </button>

          <button
            onClick={onSave}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: "var(--accent)",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Salvando..." : "Salvar pagamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
