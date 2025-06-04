import React, { useEffect } from "react";
import "./Notificacao.css";

function Notificacao({ mensagem, tipo = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notificacao ${tipo}`}>
      <span>{mensagem}</span>
    </div>
  );
}

export default Notificacao;
