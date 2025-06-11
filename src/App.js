import React, { useState } from "react";
import MenuSuperior from "./MenuSuperior";
import FormularioLancamento from "./FormularioLancamento";
import TabelaLancamentos from "./TabelaLancamentos";
import Dashboard from "./Dashboard";
import GastosFixos from "./GastosFixos";
import ResumoMensal from "./ResumoMensal";
import MetasMensais from "./MetasMensais";
import Notificacao from "./Notificacao";
import "./App.css";

function App() {
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState("");
  const [gastosFixos, setGastosFixos] = useState([]);
  const [lancamentoEditando, setLancamentoEditando] = useState(null);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  const atualizarTela = () => {
    setMesSelecionado((mes) => mes); // força renderização
  };

  const scrollPara = (id) => {
    const secao = document.getElementById(id);
    if (secao) {
      secao.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBusca = (termo) => {
    setFiltroBusca(termo.toLowerCase());
  };

  const registrarNotificacao = (texto, tipo = "success") => {
    const horario = new Date().toLocaleTimeString();
    setNotificacoes((prev) => [...prev, `${horario} - ${texto}`]);
    setNotificacaoAtiva({ mensagem: texto, tipo });

    // remover notificação após 4 segundos
    setTimeout(() => setNotificacaoAtiva(null), 4000);
  };

  return (
    <>
      {notificacaoAtiva && (
        <Notificacao
          mensagem={notificacaoAtiva.mensagem}
          tipo={notificacaoAtiva.tipo}
          onClose={() => setNotificacaoAtiva(null)}
        />
      )}

      <MenuSuperior onBuscar={handleBusca} notificacoes={notificacoes} />

      <div className="sidebar">
        <button className="sidebar-button" onClick={() => scrollPara("selecao")}>
          <span className="icon">📆</span>
          <span className="text">Selecionar Mês/Ano</span>
        </button>
        <button className="sidebar-button" onClick={() => scrollPara("formulario")}>
          <span className="icon">➕</span>
          <span className="text">Adicionar</span>
        </button>
        <button className="sidebar-button" onClick={() => scrollPara("tabela")}>
          <span className="icon">📋</span>
          <span className="text">Lançamentos</span>
        </button>
        <button className="sidebar-button" onClick={() => scrollPara("resumo")}>
          <span className="icon">📊</span>
          <span className="text">Resumo</span>
        </button>
        <button className="sidebar-button" onClick={() => scrollPara("dashboard")}>
          <span className="icon">📈</span>
          <span className="text">Dashboard</span>
        </button>
        <button className="sidebar-button" onClick={() => scrollPara("fixos")}>
          <span className="icon">💸</span>
          <span className="text">Fixos</span>
        </button>
        <button className="sidebar-button" onClick={() => scrollPara("metas")}>
          <span className="icon">🎯</span>
          <span className="text">Metas</span>
        </button>
        <button className="logout-button" onClick={() => {
  localStorage.removeItem("token");
  window.location.href = "/login";
}}>
  Logout
</button>

      </div>

      <div className="container">
        <h1>📒 Controle Financeiro</h1>

        <div id="selecao" className="card">
          <label style={{ fontWeight: "bold" }}>Selecionar mês:</label>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="mes-select"
          >
            <option value="">Todos os meses</option>
            {[
              "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
              "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
            ].map((m, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
            ))}
          </select>

          <label style={{ fontWeight: "bold", marginLeft: "20px" }}>Selecionar ano:</label>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(e.target.value)}
            className="mes-select"
          >
            <option value="">Todos os anos</option>
            {Array.from({ length: 20 }, (_, i) => {
              const ano = 2024 + i;
              return <option key={ano} value={ano.toString()}>{ano}</option>;
            })}
          </select>
        </div>

        <div id="formulario" className="card">
          <h2>✍️ Adicionar Lançamento</h2>
          <FormularioLancamento
            lancamentoEditando={lancamentoEditando}
            setLancamentoEditando={setLancamentoEditando}
            onAtualizar={atualizarTela}
            registrarNotificacao={registrarNotificacao}
          />
        </div>

        <div id="tabela" className="card">
          <h2>📋 Todos os Lançamentos</h2>
          <TabelaLancamentos
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            gastosFixos={gastosFixos}
            setLancamentoEditando={setLancamentoEditando}
            filtroBusca={filtroBusca}
            categoriaSelecionada={categoriaSelecionada}
          />
        </div>

        <div id="resumo" className="card">
          <h2>📊 Resumo Mensal</h2>
          <ResumoMensal
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            gastosFixos={gastosFixos}
          />
        </div>

        <div id="dashboard" className="card">
          <h2>📈 Dashboard</h2>
          <Dashboard
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            gastosFixos={gastosFixos}
            setCategoriaSelecionada={setCategoriaSelecionada}
            categoriaSelecionada={categoriaSelecionada}
          />
        </div>

        <div id="fixos" className="card">
          <h2>💸 Gastos Fixos com Parcelas</h2>
          <GastosFixos
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            setGastosFixos={setGastosFixos}
          />
        </div>

        <div id="metas" className="card">
          <h2>🎯 Metas Mensais</h2>
          <MetasMensais
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            registrarNotificacao={registrarNotificacao}
          />
        </div>
      </div>
    </>
  );
}

export default App;
