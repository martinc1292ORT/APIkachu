"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUser } from "@/lib/session";
import styles from "./login.module.css";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ingresá un nombre válido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Acá más adelante haremos la llamada real al backend:
      // const data = await api.register(name);
      // Por ahora simulamos usuario local:
      const user = {
        id: crypto.randomUUID(),
        name,
        points: 0,
        team: [],
      };
      setUser(user);
      router.push("/sobre"); // redirigimos al sobre inicial
    } catch (err) {
      setError("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Iniciar sesión</h1>
      <p className={styles.subtitle}>Creá tu entrenador para comenzar</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Nombre del entrenador"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Creando..." : "Entrar"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
    </main>
  );
}
