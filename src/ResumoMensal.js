import React, { useEffect, useState } from "react";
import api from "./api";

function ResumoMensal({ mesSelecionado, anoSelecionado, gastosFixos }) {
  const [lancamentos, setLancamentos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get("/lancamentos");
        const todos = Array.isArray(res.data) ? [...res.data, ...gastosFixos] : [...gastosFixos];
        setLancamentos(todos);
      } catch (error) {
        console.error("❌ Erro ao carregar lançamentos:", error?.response?.data || error.message);
      }
    };

    carregar();
  }, [mesSelecionado, anoSelecionado, gastosFixos]);

  const extrairMesAno = (data) => {
    if (!data) return { mes: "", ano: "" };

    try {
      const partes = data.includes("/") ? data.split("/") : data.split("-");
      return data.includes("/")
        ? { dia: partes[0], mes: partes[1], ano: partes[2] }
        : { ano: partes[0], mes: partes[1], dia: partes[2] || "01" };
    } catch {
      return { mes: "", ano: "" };
    }
  };

  const dadosFiltrados = lancamentos.filter((l) => {
    const { mes, ano } = extrairMesAno(l.data || l.vencimento);
    const condMes = !mesSelecionado || mes === mesSelecionado;
    const condAno = !anoSelecionado || ano === anoSelecionado;
    return condMes && condAno;
  });

  const totalDespesas = dadosFiltrados
    .filter((l) => l.tipo === "despesa")
    .reduce((acc, l) => acc + parseFloat(l.valor || 0), 0);

  const totalReceitas = dadosFiltrados
    .filter((l) => l.tipo === "receita")
    .reduce((acc, l) => acc + parseFloat(l.valor || 0), 0);

  const saldo = totalReceitas - totalDespesas;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start", // ✅ Alinhamento à esquerda
        fontSize: "18px",
        lineHeight: "1.6",
        padding: "16px 20px",
        background: "#f9f9f9",
        borderRadius: "8px",
        maxWidth: "320px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <p style={{ margin: "8px 0" }}>
        📥 <strong>Receitas:</strong>{" "}
        <span style={{ color: "green", fontWeight: "bold" }}>
          R$ {totalReceitas.toFixed(2)}
        </span>
      </p>

      <p style={{ margin: "8px 0" }}>
        📤 <strong>Despesas:</strong>{" "}
        <span style={{ color: "red", fontWeight: "bold" }}>
          R$ {totalDespesas.toFixed(2)}
        </span>
      </p>

      <p style={{ margin: "8px 0" }}>
        💰 <strong>Saldo:</strong>{" "}
        <span
          style={{
            color: saldo >= 0 ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          R$ {saldo.toFixed(2)}
        </span>
      </p>
    </div>
  );
}

export default ResumoMensal;
