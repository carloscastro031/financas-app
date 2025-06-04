import React, { useEffect, useState } from "react";
import api from "./api";

function FormularioLancamento({
  lancamentoEditando,
  setLancamentoEditando,
  onAtualizar,
  registrarNotificacao,
}) {
  const [form, setForm] = useState({
    descricao: "",
    tipo: "despesa",
    categoria: "",
    valor: "",
    data: "",
    formaPagamento: "",
    banco: "",
    status: "",
    id: null,
  });

  const formasPagamentoSugestoes = [
    "No amor (PIX)", "Na hora (Débito)", "No fôlego (Crédito)", "Boleto & fé", "Dinheiro na mão"
  ];

  const bancosSugestoes = [
    "Nubank", "Bradesco", "Santander", "Banco do Brasil", "Caixa",
    "Itaú", "C6 Bank", "Next", "Mercado Pago", "PicPay"
  ];

  const categoriasSugestoes = [
    "Lazer", "Delivery", "Vestuário", "Transporte", "Uber", "Bar",
    "Restaurante", "Educação", "Saúde", "Assinaturas", "Investimento", "Outros"
  ];

  useEffect(() => {
    if (lancamentoEditando) {
      setForm({
        descricao: lancamentoEditando.descricao || "",
        tipo: lancamentoEditando.tipo,
        categoria: lancamentoEditando.categoria,
        valor: lancamentoEditando.valor,
        data: lancamentoEditando.data || lancamentoEditando.vencimento,
        formaPagamento: lancamentoEditando.formaPagamento || "",
        banco: lancamentoEditando.banco || "",
        status: lancamentoEditando.status || "",
        id: lancamentoEditando.id,
      });
    }
  }, [lancamentoEditando]);

  const salvar = async (e) => {
    e.preventDefault();

    if (!form.descricao || !form.tipo || !form.data || !form.valor) {
      registrarNotificacao?.("Preencha os campos obrigatórios.", "error");
      return;
    }

    const valorConvertido = parseFloat(form.valor);
    if (isNaN(valorConvertido)) {
      registrarNotificacao?.("O valor informado é inválido.", "error");
      return;
    }

    const statusCalculado =
      form.tipo === "despesa" ? "Pago" : form.tipo === "receita" ? "Recebido" : "";

    const dados = {
      descricao: form.descricao,
      tipo: form.tipo,
      categoria: form.categoria,
      valor: valorConvertido,
      data: form.data,
      formaPagamento: form.formaPagamento || "",
      banco: form.banco || "",
      status: statusCalculado,
    };

    try {
      if (form.id) {
        // ✅ PUT → envio com ID
        await api.put(`/lancamentos/${form.id}`, dados);
        registrarNotificacao?.("Lançamento atualizado com sucesso!", "success");
      } else {
        // ✅ POST → sem ID
        await api.post("/lancamentos", dados);
        registrarNotificacao?.("Lançamento adicionado com sucesso!", "success");
      }
    } catch (error) {
      console.error("❌ Erro ao salvar lançamento:", error?.response || error);
      registrarNotificacao?.("Erro ao salvar lançamento.", "error");
    }

    setForm({
      descricao: "",
      tipo: "despesa",
      categoria: "",
      valor: "",
      data: "",
      formaPagamento: "",
      banco: "",
      status: "",
      id: null,
    });

    setLancamentoEditando(null);
    onAtualizar();
  };

  return (
    <form onSubmit={salvar} style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      <input
        type="text"
        placeholder="Descrição"
        value={form.descricao}
        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        style={{ flex: "1 1 300px" }}
      />

      <select
        value={form.tipo}
        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        style={{ flex: "1 1 150px" }}
      >
        <option value="despesa">Despesa</option>
        <option value="receita">Receita</option>
      </select>

      <input
        list="categorias"
        placeholder="Categoria"
        value={form.categoria}
        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        style={{ flex: "1 1 200px" }}
      />
      <datalist id="categorias">
        {categoriasSugestoes.map((cat, i) => (
          <option key={i} value={cat} />
        ))}
      </datalist>

      <input
        type="number"
        placeholder="Valor"
        value={form.valor}
        onChange={(e) => setForm({ ...form, valor: e.target.value })}
        style={{ flex: "1 1 150px" }}
      />

      <input
        type="date"
        value={form.data}
        onChange={(e) => setForm({ ...form, data: e.target.value })}
        style={{ flex: "1 1 200px" }}
      />

      <input
        list="formas"
        placeholder="Forma de Pagamento (opcional)"
        value={form.formaPagamento}
        onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })}
        style={{ flex: "1 1 200px" }}
      />
      <datalist id="formas">
        {formasPagamentoSugestoes.map((f, i) => (
          <option key={i} value={f} />
        ))}
      </datalist>

      <input
        list="bancos"
        placeholder="Banco (opcional)"
        value={form.banco}
        onChange={(e) => setForm({ ...form, banco: e.target.value })}
        style={{ flex: "1 1 200px" }}
      />
      <datalist id="bancos">
        {bancosSugestoes.map((banco, i) => (
          <option key={i} value={banco} />
        ))}
      </datalist>

      <button type="submit" style={{ flex: "1 1 150px" }}>
        {form.id ? "Atualizar" : "Salvar"}
      </button>
    </form>
  );
}

export default FormularioLancamento;
