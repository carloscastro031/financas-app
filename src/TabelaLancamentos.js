import React, { useEffect, useState } from "react";
import api from "./api";

function TabelaLancamentos({
  mesSelecionado,
  anoSelecionado,
  setLancamentoEditando,
  filtroBusca,
  categoriaSelecionada,
  gastosFixos,
}) {
  const [lancamentos, setLancamentos] = useState([]);

  useEffect(() => {
    carregarLancamentos();
  }, []);

  const carregarLancamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/lancamentos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setLancamentos(data);
    } catch (err) {
      console.error("❌ Erro ao carregar lançamentos:", err?.response?.data || err.message);
    }
  };

  const excluirLancamento = async (id) => {
    const confirmar = window.confirm("Excluir lançamento?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/lancamentos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLancamentos((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("❌ Erro ao excluir:", err?.response?.data || err.message);
    }
  };

  const editarLancamento = (lancamento) => {
    setLancamentoEditando(lancamento);
  };

  const extrairMes = (data) => (data || "").slice(5, 7);
  const extrairAno = (data) => (data || "").slice(0, 4);

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const ordenarPorData = (lista, isFixos = false) => {
    return [...lista].sort((a, b) => {
      const dataA = new Date(isFixos ? a.vencimento : a.data || "9999-12-31");
      const dataB = new Date(isFixos ? b.vencimento : b.data || "9999-12-31");
      return dataA - dataB;
    });
  };

  const filtrar = (lista, isFixos = false) =>
    ordenarPorData(
      lista
        .filter((l) => {
          const data = isFixos ? l.vencimento : l.data;
          const mes = extrairMes(data);
          const ano = extrairAno(data);
          const condMes = !mesSelecionado || mes === mesSelecionado;
          const condAno = !anoSelecionado || ano === anoSelecionado;
          return condMes && condAno;
        })
        .filter((l) => {
          if (!filtroBusca) return true;
          const texto = filtroBusca.toLowerCase();
          return (
            l.descricao?.toLowerCase().includes(texto) ||
            l.categoria?.toLowerCase().includes(texto) ||
            l.formaPagamento?.toLowerCase().includes(texto) ||
            l.banco?.toLowerCase().includes(texto) ||
            String(l.valor).includes(texto)
          );
        }),
      isFixos
    );

  const normais = filtrar(lancamentos);
  const fixos = filtrar(gastosFixos, true);

  const renderLinha = (l, isFixos = false) => {
    const data = isFixos ? l.vencimento : l.data;
    const destacar =
      categoriaSelecionada &&
      l.categoria?.toLowerCase().includes(categoriaSelecionada.toLowerCase());

    return (
      <tr
        key={l.id}
        style={{
          backgroundColor: destacar ? "#fff8b3" : "#fff",
          color: "#000",
        }}
      >
        <td style={td}>{l.descricao}</td>
        <td style={td}>{l.categoria}</td>
        <td style={td}>{l.tipo}</td>
        <td style={td}>R$ {parseFloat(l.valor || 0).toFixed(2)}</td>
        <td style={td}>{formatarData(data)}</td>
        <td style={td}>{l.formaPagamento}</td>
        <td style={td}>{l.banco}</td>
        <td style={td}>{l.status || "-"}</td>
        <td style={td}>{l.numeroParcela || "-"}</td>
        <td style={{ ...td, textAlign: "center" }}>
          <button onClick={() => editarLancamento(l)} title="Editar">✏️</button>{" "}
          <button onClick={() => excluirLancamento(l.id)} title="Excluir">❌</button>
        </td>
      </tr>
    );
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" }}>
        <thead>
          <tr style={{ background: "#f0f0f0", color: "#000" }}>
            <th style={th}>Descrição</th>
            <th style={th}>Categoria</th>
            <th style={th}>Tipo</th>
            <th style={th}>Valor</th>
            <th style={th}>Data</th>
            <th style={th}>Forma</th>
            <th style={th}>Banco</th>
            <th style={th}>Status</th>
            <th style={th}>Parcela</th>
            <th style={th}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {normais.map((l) => renderLinha(l))}
        </tbody>

        {fixos.length > 0 && (
          <>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th colSpan={10} style={{ textAlign: "left", padding: "12px", fontWeight: "bold" }}>
                  🔁 Gastos Fixos
                </th>
              </tr>
            </thead>
            <tbody>
              {fixos.map((l) => renderLinha(l, true))}
            </tbody>
          </>
        )}
      </table>
    </div>
  );
}

const th = {
  padding: "8px",
  borderBottom: "2px solid #ccc",
};

const td = {
  padding: "8px",
  borderBottom: "1px solid #ddd",
};

export default TabelaLancamentos;
