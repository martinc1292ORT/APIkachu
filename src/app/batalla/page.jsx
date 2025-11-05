"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRequireUser } from "@/lib/session";
import styles from "./batalla.module.css";

export default function BatallaPage() {
  useRequireUser();

  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("easy");
  const [result, setResult] = useState(null);
  const [battling, setBattling] = useState(false);

  // Cargar usuario y team
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.me();
        if (mounted) setMe(data.user);
      } catch {
        if (mounted) setError("No se pudo conectar al backend.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Simulación de batalla local (aleatoria)
  const simulateBattle = () => {
    if (!me?.team?.length) {
      setError("Tu equipo está vacío. Armá uno desde tu perfil.");
      return;
    }

    setBattling(true);
    setError("");
    setResult(null);

    setTimeout(async () => {
      try {
        // Lógica básica: probabilidad depende de la dificultad
        const odds = { easy: 0.8, medium: 0.5, hard: 0.25 };
        const win = Math.random() < odds[difficulty];
        const energyLoss = 1;

        const newStats = {
          wins: me.wins + (win ? 1 : 0),
          losses: me.losses + (win ? 0 : 1),
        };

        // Restar energía localmente
        const updatedTeam = me.team.map((p) => ({
          ...p,
          energy: Math.max(0, (p.energy ?? 3) - energyLoss),
        }));

        const updatedUser = { ...me, ...newStats, team: updatedTeam };

        // Simular llamada al backend
        try {
          await api.battle(difficulty);
        } catch {
          // si el backend no existe todavía, ignoramos
        }

        setMe(updatedUser);
        setResult(win ? "Ganaste 🎉" : "Perdiste 😓");
      } catch {
        setError("Error en la simulación de batalla");
      } finally {
        setBattling(false);
      }
    }, 1000);
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>⚔️ Batalla</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <section className={styles.info}>
            <p><b>Entrenador:</b> {me.name}</p>
            <p><b>Victorias:</b> {me.wins}</p>
            <p><b>Derrotas:</b> {me.losses}</p>
          </section>

          <section className={styles.team}>
            <h2>Tu equipo</h2>
            {me.team?.length ? (
              <ul className={styles.grid}>
                {me.team.map((p) => (
                  <li key={p.id} className={styles.card}>
                    <div className={styles.pokeName}>{p.species}</div>
                    <p>Etapa {p.stage}</p>
                    <p>Energía: {p.energy ?? 3}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tenés un equipo seleccionado.</p>
            )}
          </section>

          <section className={styles.controls}>
            <h2>Dificultad</h2>
            <div className={styles.difficulty}>
              {["easy", "medium", "hard"].map((lvl) => (
                <button
                  key={lvl}
                  className={`${styles.diffBtn} ${difficulty === lvl ? styles.active : ""}`}
                  onClick={() => setDifficulty(lvl)}
                  disabled={battling}
                >
                  {lvl === "easy" ? "Fácil" : lvl === "medium" ? "Media" : "Difícil"}
                </button>
              ))}
            </div>

            <button
              onClick={simulateBattle}
              disabled={battling}
              className={styles.startBtn}
            >
              {battling ? "Combatiendo..." : "Iniciar batalla"}
            </button>

            {result && <div className={styles.result}>{result}</div>}
          </section>
        </>
      )}
    </main>
  );
}
