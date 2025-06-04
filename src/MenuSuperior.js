import React, { useState } from "react";
import "./MenuSuperior.css";

function MenuSuperior({ onBuscar, notificacoes }) {
  const [mostrandoPainel, setMostrandoPainel] = useState(false);

  const togglePainel = () => {
    setMostrandoPainel(!mostrandoPainel);
  };

  return (
    <div className="menu-superior">
      <div className="logo">💰 Meu Financeiro</div>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="Buscar lançamento..."
        onChange={(e) => onBuscar(e.target.value)}
      />

      <div className="notificacoes" onClick={togglePainel}>
        🔔
        {mostrandoPainel && (
          <div className="painel-notificacoes">
            {notificacoes.length === 0 ? (
              <p>Nenhuma notificação ainda.</p>
            ) : (
              notificacoes.map((n, i) => <p key={i}>{n}</p>)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuSuperior;
