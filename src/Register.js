import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import api from "./api"; // ✅ Usando a API centralizada

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registrar = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const senha = form.senha.trim();
    const confirmarSenha = form.confirmarSenha.trim();

    if (!email || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (senha.length < 4) {
      setErro("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      const res = await api.post("/registro", {
        email,
        senha
      });

      if (res.status === 200) {
        alert("✅ Registro realizado com sucesso! Faça login.");
        navigate("/login");
      } else {
        setErro(res.data.erro || "Erro ao registrar.");
      }
    } catch (err) {
      console.error("Erro de registro:", err);
      setErro("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="auth-container">
      <h2>📝 Registro</h2>
      {erro && <p className="erro">{erro}</p>}

      <form onSubmit={registrar}>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmarSenha"
          placeholder="Confirmar senha"
          value={form.confirmarSenha}
          onChange={handleChange}
        />
        <button type="submit">Registrar</button>
      </form>

      <p style={{ marginTop: 10 }}>
        Já tem conta?{" "}
        <span
          style={{ color: "#1a73e8", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Fazer login
        </span>
      </p>
    </div>
  );
}

export default Register;
