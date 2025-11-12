"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import styles from "./perfil.module.css";

export default function PerfilPage() {
  const { user, logout, updateProfile } = useAuth();

  // -----------------------------
  // ⚠️ Normalizamos estructuras
  // En AuthProvider la "colección" se llama roster (no collection).
  // -----------------------------
  const team = user?.team ?? [];
  const roster = user?.roster ?? []; // ← usar roster
  const [selectedSlot, setSelectedSlot] = useState(null); // índice del slot a reemplazar

  const isInTeam = (id) => team.some((p) => p?.id === id);
  const isInRoster = (id) => roster.some((p) => p?.id === id);

  // Utilidad para evitar duplicados por id
  const uniqueById = (arr) => {
    const seen = new Set();
    return (arr || []).filter((x) => {
      if (!x || x.id == null) return false;
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });
  };

  // -----------------------------
  // Guardar estado en el perfil
  // ✅ Guardamos siempre { team, roster } porque así lo espera AuthProvider.
  // -----------------------------
  const save = (nextTeam, nextRoster) => {
    updateProfile({
      team: uniqueById(nextTeam).slice(0, 6),
      roster: uniqueById(nextRoster),
    });
  };

  // Agregar de roster → equipo
  const handleAddToTeam = (poke) => {
    if (isInTeam(poke.id)) return;
    if (team.length >= 6) return;
    const nextTeam = [...team, poke];
    const nextRoster = roster.filter((p) => p.id !== poke.id);
    save(nextTeam, nextRoster);
  };

  // Quitar del equipo → vuelve a roster
  const handleRemoveFromTeam = (idx) => {
    const removed = team[idx];
    const nextTeam = team.filter((_, i) => i !== idx);
    const nextRoster = [...roster, removed];
    save(nextTeam, nextRoster);
    if (selectedSlot === idx) setSelectedSlot(null);
  };

  // Inicia flujo de reemplazo eligiendo el slot
  const beginReplace = (idx) => {
    setSelectedSlot(idx);
  };

  // Reemplazar slot seleccionado con un pokémon del roster
  const handleReplaceWith = (poke) => {
    if (selectedSlot == null) return;
    const outgoing = team[selectedSlot];
    if (isInTeam(poke.id)) return; // ya está en el equipo

    const nextTeam = team.slice();
    nextTeam[selectedSlot] = poke;

    // sacamos el entrante del roster
    let nextRoster = roster.filter((p) => p.id !== poke.id);

    // el que salió del equipo vuelve al roster (si existía y no estaba)
    if (outgoing && !isInRoster(outgoing.id)) {
      nextRoster = [...nextRoster, outgoing];
    }

    save(nextTeam, nextRoster);
    setSelectedSlot(null);
  };

  // Cancelar flujo de reemplazo
  const cancelReplace = () => setSelectedSlot(null);

  const teamCount = team.length;
  const rosterCount = roster.length;

  return (
    <RequireAuth>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Mi Perfil</h1>

            {/* Puntaje del ENTRENADOR (sale de user.points) */}
            <div className={styles.pointsBadge} title="Puntos del entrenador">
              <span className={styles.pointsLabel}>Puntos</span>
              <span className={styles.pointsValue}>{user?.points ?? 0}</span>
            </div>

            <button className={styles.logout} onClick={logout}>
              Cerrar sesión
            </button>
          </div>

          <div className={styles.info}>
            <div><strong>Email:</strong> {user?.email}</div>
            <div className={styles.row}>
              <label htmlFor="nombre">Nombre:</label>
              <input
                id="nombre"
                className={styles.input}
                defaultValue={user?.name || ""}
                onBlur={(e) => updateProfile({ name: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>
          </div>

          {/* Equipo */}
          <div className={styles.sectionHeader}>
            <h2>Mi Equipo ({teamCount}/6)</h2>
            {selectedSlot != null && (
              <div className={styles.replaceBanner}>
                Reemplazando el slot #{selectedSlot + 1} — elegí un pokémon de tu colección o{" "}
                <button className={styles.linkBtn} onClick={cancelReplace}>cancelá</button>.
              </div>
            )}
          </div>

          <div className={styles.teamGrid}>
            {Array.from({ length: Math.max(6, teamCount) }).map((_, i) => {
              const p = team[i];
              if (!p) {
                return (
                  <div key={`slot-${i}`} className={`${styles.poke} ${styles.emptySlot}`}>
                    <div className={styles.emptyMsg}>Slot vacío</div>
                  </div>
                );
              }
              return (
                <div
                  className={`${styles.poke} ${selectedSlot === i ? styles.activeSlot : ""}`}
                  key={p.id}
                >
                  <img src={p.sprite} alt={p.name} width={72} height={72} />
                  <div className={styles.pname}>{p.name}</div>
                  <div className={styles.ptypes}>
                    {(p.types || []).map((t) => (
                      <span key={t} className={styles.type}>{t}</span>
                    ))}
                  </div>
                  <div className={styles.pokeActions}>
                    <button
                      className={styles.btnGhost}
                      onClick={() => beginReplace(i)}
                      title="Reemplazar este slot con un pokémon de tu colección"
                    >
                      Cambiar
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleRemoveFromTeam(i)}
                      title="Sacar del equipo (vuelve a tu colección)"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Colección (roster) */}
          <div className={styles.sectionHeader}>
            <h2>Mi Colección ({rosterCount})</h2>
          </div>

          <div className={styles.collectionGrid}>
            {rosterCount === 0 && (
              <div className={styles.emptyCollection}>No tenés pokémon en tu colección.</div>
            )}
            {roster.map((p) => {
              const disabledAdd = isInTeam(p.id) || teamCount >= 6;

              return (
                <div className={styles.poke} key={p.id}>
                  <img src={p.sprite} alt={p.name} width={64} height={64} />
                  <div className={styles.pname}>{p.name}</div>
                  <div className={styles.ptypes}>
                    {(p.types || []).map((t) => (
                      <span key={t} className={styles.type}>{t}</span>
                    ))}
                  </div>

                  <div className={styles.pokeActions}>
                    {selectedSlot == null ? (
                      <button
                        className={styles.btnPrimary}
                        disabled={disabledAdd}
                        onClick={() => handleAddToTeam(p)}
                        title={
                          isInTeam(p.id)
                            ? "Ya está en el equipo"
                            : teamCount >= 6
                            ? "Tu equipo ya tiene 6 pokémon"
                            : "Agregar al equipo"
                        }
                      >
                        Agregar al equipo
                      </button>
                    ) : (
                      <button
                        className={styles.btnPrimary}
                        onClick={() => handleReplaceWith(p)}
                        title={`Enviar a slot #${selectedSlot + 1}`}
                      >
                        Enviar a slot #{selectedSlot + 1}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Opcional: link a tienda para comprar con puntos */}
          {/* <div className={styles.actions}>
            <a className={styles.btn} href="/tienda">Ir a la tienda</a>
          </div> */}
        </div>
      </div>
    </RequireAuth>
  );
}
