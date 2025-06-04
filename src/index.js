import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./Login";
import Register from "./Register";
import "./index.css";

function Root() {
  const [autenticado, setAutenticado] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const handleLogin = () => {
    setAutenticado(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={autenticado ? <App /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/registro" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
