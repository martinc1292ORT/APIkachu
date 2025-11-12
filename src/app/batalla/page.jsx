"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./batalla.module.css";
import { simulateBattle } from "@/lib/battle";
import { useAuth } from "@/contexts/AuthProvider";

const TEAM_SIZE = 6; // define aquí qué significa "equipo completo"

export default function BatallaPage() {
  const router = useRouter();
  const { user, isAuthenticated, addPoints } = useAuth();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  // Si no está autenticado, redirigimos a /login con next param para volver luego.
  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace(`/login?next=/batalla`);
    }
  }, [isAuthenticated, router]);

  // Mientras resolvemos auth (undefined) o redirigimos, no mostramos nada para evitar flicker
  if (isAuthenticated === false) return null;

  const myTeam = useMemo(() => user?.team ?? [], [user?.team]);
  const hasFullTeam = myTeam.length === TEAM_SIZE;

  async function onFight() {
    setError("");
    setReport(null);

    if (!hasFullTeam) {
      setError(`No podés pelear: tu equipo debe tener ${TEAM_SIZE} pokémon.`);
      return;
    }

    setLoading(true);
    try {
      // Simulamos SIEMPRE con el equipo del usuario (ya autenticado y validado)
      const result = await simulateBattle(myTeam);

      setReport({ ...result, myTeam });

      // Sumamos puntos al PERFIL del usuario (no a cada pokémon)
      if (isAuthenticated && Number(result.awardedPoints) > 0) {
        addPoints(result.awardedPoints); // esto debe actualizar user.points en tu AuthProvider
      }
    } catch (e) {
      setError(e?.message || "Error en la simulación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1>Batalla</h1>

        <p>
          Peleás contra 6 pokémon aleatorios. Ganás puntos si estás logueado:
          <strong> +3</strong> por victoria, <strong>+1</strong> por empate.
        </p>

        {/* Estado de bloqueo por equipo incompleto */}
        {!hasFullTeam && (
          <div className={styles.warning}>
            No podés acceder a la batalla porque no tenés el equipo completo
            ({myTeam.length}/{TEAM_SIZE}). Completalo en tu perfil antes de pelear.
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.btn}
            onClick={onFight}
            disabled={loading || !hasFullTeam}
            aria-disabled={loading || !hasFullTeam}
            title={
              !hasFullTeam
                ? `Necesitás ${TEAM_SIZE} pokémon en tu equipo`
                : undefined
            }
          >
            {loading ? "Simulando..." : "Luchar ahora"}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {report && (
          <>
            <h2>Resultado: {labelResult(report.result)}</h2>
            <p>
              Rounds ganados: <strong>{report.myWins}</strong> vs{" "}
              <strong>{report.oppWins}</strong>
              {isAuthenticated && (
                <>
                  {" "}
                  — Puntos otorgados: <strong>{report.awardedPoints}</strong>
                </>
              )}
            </p>

            <div className={styles.teams}>
              <div>
                <h3>Mi equipo</h3>
                <div className={styles.grid}>
                  {report.myTeam.map((p) => (
                    <PokeCard key={`me-${p.id}`} p={p} />
                  ))}
                </div>
              </div>
              <div>
                <h3>Rival</h3>
                <div className={styles.grid}>
                  {report.opponentTeam.map((p) => (
                    <PokeCard key={`opp-${p.id}`} p={p} />
                  ))}
                </div>
              </div>
            </div>

            <h3>Rounds</h3>
            <div className={styles.rounds}>
              {report.rounds.map((r) => (
                <div key={r.index} className={styles.round}>
                  <div className={styles.side}>
                    <img src={r.me.sprite} alt={r.me.name} width={56} height={56} />
                    <div className={styles.name}>{r.me.name}</div>
                    <div className={styles.score}>{r.myScore}</div>
                  </div>
                  <div className={styles.vs}>vs</div>
                  <div className={styles.side}>
                    <img src={r.opp.sprite} alt={r.opp.name} width={56} height={56} />
                    <div className={styles.name}>{r.opp.name}</div>
                    <div className={styles.score}>{r.oppScore}</div>
                  </div>
                  <div
                    className={`${styles.result} ${
                      r.winner === "me"
                        ? styles.win
                        : r.winner === "opp"
                        ? styles.lose
                        : styles.draw
                    }`}
                  >
                    {r.winner === "me"
                      ? "Ganado"
                      : r.winner === "opp"
                      ? "Perdido"
                      : "Empate"}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function labelResult(res) {
  if (res === "win") return "¡Victoria!";
  if (res === "lose") return "Derrota";
  return "Empate";
}

function PokeCard({ p }) {
  return (
    <div className={styles.poke}>
      <img src={p.sprite} alt={p.name} width={72} height={72} />
      <div className={styles.pname}>{p.name}</div>
      <div className={styles.ptypes}>
        {(p.types || []).map((t) => (
          <span key={t} className={styles.type}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
