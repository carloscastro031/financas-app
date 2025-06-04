import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import api from "./api"; // ✅ Importa API centralizada

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    try {
      const res = await api.post("/login", {
        email: emailLimpo,
        senha: senhaLimpa,
      });

      if (res.status === 200 && res.data.token) {
        localStorage.setItem("token", res.data.token); // ✅ Funciona no navegador
        if (onLogin) onLogin();
        navigate("/");
      } else {
        setErro(res.data.erro || "E-mail ou senha incorretos.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setErro("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="auth-container">
      <h2>🔐 Login</h2>
      {erro && <p className="erro">{erro}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>

      <p style={{ marginTop: 10 }}>
        Não tem uma conta?{" "}
        <span
          style={{ color: "#1a73e8", cursor: "pointer" }}
          onClick={() => navigate("/registro")}
        >
          Criar agora
        </span>
      </p>
    </div>
  );
}

export default Login;
