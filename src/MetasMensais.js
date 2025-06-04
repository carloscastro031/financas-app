import React, { useEffect, useState } from "react";
import api from "./api";

function MetasMensais({ mesSelecionado, anoSelecionado }) {
  const [metas, setMetas] = useState({});
  const [inputMeta, setInputMeta] = useState("");
  const [gastos, setGastos] = useState([]);
  const [toast, setToast] = useState(null);

  const chave = `${anoSelecionado || "todos"}-${mesSelecionado || "todos"}`;

  useEffect(() => {
    const salvas = localStorage.getItem("metas");
    if (salvas) {
      setMetas(JSON.parse(salvas));
    }

    const carregarGastos = async () => {
      try {
        const res = await api.get("/lancamentos");
        const data = Array.isArray(res.data) ? res.data : [];
        setGastos(data);
      } catch (err) {
        console.error("❌ Erro ao carregar lançamentos:", err?.response?.data || err.message);
      }
    };

    carregarGastos();
  }, []);

  const extrairMesAno = (data) => {
    if (!data) return { mes: "", ano: "" };
    try {
      const partes = data.includes("/") ? data.split("/") : data.split("-");
      return data.includes("/")
        ? { mes: partes[1], ano: partes[2] }
        : { ano: partes[0], mes: partes[1] };
    } catch {
      return { mes: "", ano: "" };
    }
  };

  const gastosFiltrados = gastos.filter((g) => {
    if (g.tipo !== "despesa") return false;
    const { ano, mes } = extrairMesAno(g.data || g.vencimento || "");
    const condMes = !mesSelecionado || mes === mesSelecionado;
    const condAno = !anoSelecionado || ano === anoSelecionado;
    return condMes && condAno;
  });

  const totalGastos = gastosFiltrados.reduce(
    (total, g) => total + parseFloat(g.valor || 0),
    0
  );

  const metaAtual = metas[chave];

  const salvarMeta = () => {
    if (!inputMeta || isNaN(inputMeta)) return;

    const nova = {
      ...metas,
      [chave]: parseFloat(inputMeta),
    };

    setMetas(nova);
    localStorage.setItem("metas", JSON.stringify(nova));
    setInputMeta("");
    mostrarToast("🎯 Meta atualizada com sucesso!", "success");
  };

  const excluirMeta = () => {
    if (!metas[chave]) return;
    const novo = { ...metas };
    delete novo[chave];
    setMetas(novo);
    localStorage.setItem("metas", JSON.stringify(novo));
    mostrarToast("🗑️ Meta excluída!", "error");
  };

  const mostrarToast = (mensagem, tipo) => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    if (!metaAtual) return;

    let mensagemStatus = "";
    let tipoStatus = "";

    if (totalGastos > metaAtual) {
      mensagemStatus = "💥 Você já torrou sua meta esse mês!";
      tipoStatus = "error";
    } else if (totalGastos >= metaAtual * 0.9) {
      mensagemStatus = "⚠️ Você está a um pastel do estouro da meta!";
      tipoStatus = "warning";
    } else if (totalGastos > 0) {
      mensagemStatus = "✅ Você ainda está dentro da meta. Continue assim!";
      tipoStatus = "success";
    }

    if (mensagemStatus) {
      mostrarToast(mensagemStatus, tipoStatus);
    }
  }, [metaAtual, totalGastos, chave]);

  return (
    <div>
      {toast && (
        <div className={`toast ${toast.tipo}`}>
          {toast.mensagem}
        </div>
      )}

      <p><strong>Mês selecionado:</strong> {mesSelecionado || "Todos"}</p>
      <p><strong>Ano selecionado:</strong> {anoSelecionado || "Todos"}</p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="number"
          placeholder="Definir meta de economia"
          value={inputMeta}
          onChange={(e) => setInputMeta(e.target.value)}
        />
        <button onClick={salvarMeta}>💾 Salvar</button>
        {metaAtual && (
          <button onClick={excluirMeta} style={{ background: "#ef476f" }}>
            🗑️ Excluir
          </button>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        {metaAtual ? (
          <>
            <p>📌 <strong>Meta:</strong> R$ {metaAtual.toFixed(2)}</p>
            <p>💰 <strong>Gastos do mês:</strong> R$ {totalGastos.toFixed(2)}</p>
          </>
        ) : (
          <p>⚠️ Nenhuma meta definida para esse período.</p>
        )}
      </div>
    </div>
  );
}

export default MetasMensais;
