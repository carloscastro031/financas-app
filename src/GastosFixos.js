import React, { useState, useEffect } from "react";
import api from "./api";

function GastosFixos({ setGastosFixos, mesSelecionado, anoSelecionado }) {
  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    vencimento: "",
    formaPagamento: "",
    banco: "",
    status: "",
    parcelas: 1,
  });

  const [gastos, setGastos] = useState([]);
  const [editando, setEditando] = useState(null);

  const formasPagamento = [
    "No amor (PIX)", "Na hora (Débito)", "No fôlego (Crédito)",
    "Boleto & fé", "Dinheiro na mão",
  ];

  const bancosSugestoes = [
    "Nubank", "Bradesco", "Santander", "C6 Bank", "Next",
    "PicPay", "Banco do Brasil", "Itaú", "Mercado Pago"
  ];

  const statusList = ["Pago", "A vencer", "Vence hoje", "Vencido", "Negociado", "Parcelado"];

  const calcularStatusAutomaticamente = (dataVencimento) => {
    const hoje = new Date();
    const venc = new Date(dataVencimento);
    const diaHoje = hoje.toISOString().split("T")[0];
    const diaVenc = venc.toISOString().split("T")[0];
    if (diaVenc === diaHoje) return "Vence hoje";
    if (venc > hoje) return "A vencer";
    if (venc < hoje) return "Vencido";
    return "";
  };

  const carregarGastosFixos = async () => {
    try {
      const res = await api.get("/lancamentos");
      const fixos = res.data.filter((l) => l.is_fixo);
      setGastos(fixos);
      setGastosFixos(fixos);
    } catch (error) {
      console.error("❌ Erro ao carregar gastos fixos:", error);
    }
  };

  useEffect(() => {
    carregarGastosFixos();
  }, []);

  const adicionarGasto = async (e) => {
    e.preventDefault();

    if (!form.descricao || !form.valor || !form.vencimento) return;

    const totalParcelas = parseInt(form.parcelas || 1);
    const dataBase = new Date(form.vencimento);

    try {
      for (let i = 0; i < totalParcelas; i++) {
        const vencimentoParcela = new Date(dataBase);
        vencimentoParcela.setMonth(vencimentoParcela.getMonth() + i);
        const dataFormatada = vencimentoParcela.toISOString().split("T")[0];
        const statusCalculado = form.status || calcularStatusAutomaticamente(dataFormatada);

        const novo = {
          descricao: form.descricao,
          tipo: "despesa",
          categoria: "Gasto Fixo",
          valor: parseFloat(form.valor),
          data: dataFormatada,
          formaPagamento: form.formaPagamento,
          banco: form.banco,
          status: statusCalculado,
          numeroParcela: `${i + 1}/${totalParcelas}`,
          is_fixo: true,
        };

        await api.post("/lancamentos", novo);
      }

      carregarGastosFixos();

      setForm({
        descricao: "",
        valor: "",
        vencimento: "",
        formaPagamento: "",
        banco: "",
        status: "",
        parcelas: 1,
      });
      setEditando(null);
    } catch (error) {
      console.error("❌ Erro ao salvar gasto fixo:", error);
    }
  };

  const editar = (gasto) => {
    setEditando(gasto.id);
    setForm({
      descricao: gasto.descricao,
      valor: gasto.valor,
      vencimento: gasto.data,
      formaPagamento: gasto.formaPagamento,
      banco: gasto.banco,
      status: gasto.status,
      parcelas: 1,
    });
  };

  const excluir = async (id) => {
    const confirmar = window.confirm("Deseja excluir este gasto fixo?");
    if (!confirmar) return;

    try {
      await api.delete(`/lancamentos/${id}`);
      carregarGastosFixos();
    } catch (error) {
      console.error("❌ Erro ao excluir gasto fixo:", error);
    }
  };

  const extrairMesAno = (data) => {
    if (!data) return { ano: "", mes: "" };
    const [ano, mes] = data.split("-");
    return { ano, mes };
  };

  const gastosFiltrados = gastos.filter((g) => {
    const { mes, ano } = extrairMesAno(g.data || g.vencimento);
    const condMes = !mesSelecionado || mes === mesSelecionado;
    const condAno = !anoSelecionado || ano === anoSelecionado;
    return condMes && condAno;
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <form
        onSubmit={adicionarGasto}
        style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}
      >
        <input type="text" placeholder="Descrição" value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        <input type="number" placeholder="Valor" value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })} />
        <input type="date" value={form.vencimento}
          onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
        <select value={form.formaPagamento}
          onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })}>
          <option value="">Forma</option>
          {formasPagamento.map((f, i) => <option key={i} value={f}>{f}</option>)}
        </select>
        <input list="bancos" placeholder="Banco" value={form.banco}
          onChange={(e) => setForm({ ...form, banco: e.target.value })} />
        <datalist id="bancos">
          {bancosSugestoes.map((b, i) => <option key={i} value={b} />)}
        </datalist>
        <select value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="">Status automático</option>
          {statusList.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <input type="number" min="1" placeholder="Parcelas"
          value={form.parcelas}
          onChange={(e) => setForm({ ...form, parcelas: e.target.value })} />
        <button type="submit">{editando ? "Atualizar" : "Salvar"}</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Forma</th>
            <th>Banco</th>
            <th>Status</th>
            <th>Parcela</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {gastosFiltrados.map((g) => (
            <tr key={g.id}>
              <td>{g.descricao}</td>
              <td>R$ {parseFloat(g.valor || 0).toFixed(2)}</td>
              <td>{g.data}</td>
              <td>{g.formaPagamento}</td>
              <td>{g.banco}</td>
              <td>{g.status}</td>
              <td>{g.numeroParcela}</td>
              <td style={{ textAlign: "center" }}>
                <button onClick={() => editar(g)} title="Editar">✏️</button>{" "}
                <button onClick={() => excluir(g.id)} title="Excluir">❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GastosFixos;
