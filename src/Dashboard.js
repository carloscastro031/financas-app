import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import api from "./api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Dashboard({
  mesSelecionado,
  anoSelecionado,
  gastosFixos,
  categoriaSelecionada,
  setCategoriaSelecionada,
}) {
  const [lancamentos, setLancamentos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await api.get("/lancamentos");
        const data = Array.isArray(response.data) ? response.data : [];
        const todos = [...data, ...gastosFixos];
        setLancamentos(todos);
      } catch (error) {
        console.error("❌ Erro ao carregar lançamentos (Dashboard):", error?.response?.data || error.message);
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
    const { mes, ano } = extrairMesAno(l.data || l.vencimento || "");
    const condMes = !mesSelecionado || mes === mesSelecionado;
    const condAno = !anoSelecionado || ano === anoSelecionado;
    return condMes && condAno;
  });

  const categoriasDespesas = {};
  const categoriasReceitas = {};
  let totalDespesas = 0;
  let totalReceitas = 0;

  dadosFiltrados.forEach((l) => {
    const valor = parseFloat(l.valor || 0);
    if (l.tipo === "despesa") {
      totalDespesas += valor;
      categoriasDespesas[l.categoria] = (categoriasDespesas[l.categoria] || 0) + valor;
    }
    if (l.tipo === "receita") {
      totalReceitas += valor;
      categoriasReceitas[l.categoria] = (categoriasReceitas[l.categoria] || 0) + valor;
    }
  });

  const saldo = totalReceitas - totalDespesas;

  const handleClickCategoria = (event, elements, tipo) => {
    if (!elements.length) {
      setCategoriaSelecionada(null);
      localStorage.removeItem("categoriaSelecionada");
      return;
    }

    const index = elements[0].index;
    const label =
      tipo === "despesa"
        ? Object.keys(categoriasDespesas)[index]
        : Object.keys(categoriasReceitas)[index];

    if (label === categoriaSelecionada) {
      setCategoriaSelecionada(null);
      localStorage.removeItem("categoriaSelecionada");
    } else {
      setCategoriaSelecionada(label);
      localStorage.setItem("categoriaSelecionada", label);
    }
  };

  const coresDespesas = ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff", "#00f5d4"];
  const coresReceitas = ["#06d6a0", "#118ab2", "#ef476f", "#ffd166", "#8ecae6", "#219ebc"];

  const gerarCoresComDestaque = (categorias, selecionada, cores) => {
    return Object.keys(categorias).map((cat, i) =>
      selecionada === cat ? "#ffffff" : cores[i % cores.length]
    );
  };

  return (
    <div className="flex-space">
      <div className="chart-container">
        <h3 style={{ color: "white" }}>📉 Gastos por Categoria</h3>
        <Pie
          data={{
            labels: Object.keys(categoriasDespesas),
            datasets: [
              {
                data: Object.values(categoriasDespesas),
                backgroundColor: gerarCoresComDestaque(categoriasDespesas, categoriaSelecionada, coresDespesas),
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                labels: { color: "white" },
              },
            },
            onClick: (event, elements) => handleClickCategoria(event, elements, "despesa"),
          }}
        />
      </div>

      <div className="chart-container">
        <h3 style={{ color: "white" }}>📈 Receitas por Categoria</h3>
        <Pie
          data={{
            labels: Object.keys(categoriasReceitas),
            datasets: [
              {
                data: Object.values(categoriasReceitas),
                backgroundColor: gerarCoresComDestaque(categoriasReceitas, categoriaSelecionada, coresReceitas),
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                labels: { color: "white" },
              },
            },
            onClick: (event, elements) => handleClickCategoria(event, elements, "receita"),
          }}
        />
      </div>

      <div className="chart-container" style={{ width: "100%", maxWidth: "800px" }}>
        <h3 style={{ color: "white" }}>💹 Comparativo Receitas x Despesas</h3>
        <Bar
          data={{
            labels: ["Receitas", "Despesas"],
            datasets: [
              {
                label: "Total",
                data: [totalReceitas, totalDespesas],
                backgroundColor: ["#06d6a0", "#ff006e"],
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: "#fff" },
                grid: { color: "#444" },
              },
              x: {
                ticks: { color: "#fff" },
                grid: { color: "#444" },
              },
            },
            onClick: () => {
              setCategoriaSelecionada(null);
              localStorage.removeItem("categoriaSelecionada");
            },
          }}
        />
      </div>
    </div>
  );
}

export default Dashboard;
