"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/session";
import { useRequireUser } from "@/lib/session";
import styles from "./perfil.module.css";

export default function PerfilPage() {
  useRequireUser();

  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState([]); // array de IDs seleccionados

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.me();
        if (mounted) {
          setMe(data.user || null);
          setTeam(data.user?.teamIds || []);
        }
      } catch (e) {
        if (mounted) setError("No pude conectar con el backend.");
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleTeamMember = (pokeId) => {
    const next = team.includes(pokeId)
      ? team.filter((id) => id !== pokeId)
      : team.length < 6
      ? [...team, pokeId]
      : team; // no más de 6
    setTeam(next);
  };

  const saveTeam = async () => {
    setSaving(true);
    setError("");
    try {
      await api.setTeam(team);
      const data = await api.me();
      setMe(data.user);
    } catch (e) {
      setError("Error al guardar el equipo");
    } finally {
      setSaving(false);
    }
  };

  const localUser = getUser();

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Perfil del entrenador</h1>

      {error && <div className={styles.error}>{error}</div>}

      {!me ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          <section className={styles.info}>
            <p><b>Nombre:</b> {me.name || localUser?.name}</p>
            <p><b>Puntos:</b> {me.points ?? 0}</p>
            <p><b>Victorias:</b> {me.wins ?? 0}</p>
            <p><b>Derrotas:</b> {me.losses ?? 0}</p>
          </section>

          <section className={styles.team}>
            <h2>Tu equipo (máx. 6)</h2>
            {team.length === 0 && <p>No elegiste ningún Pokémon aún.</p>}
            <ul className={styles.teamGrid}>
              {me.owned?.filter((p) => team.includes(p.id)).map((p) => (
                <li key={p.id} className={styles.card}>
                  <div className={styles.pokeName}>{p.species}</div>
                  <p>Etapa {p.stage}</p>
                  <p>Energía {p.energy ?? 3}</p>
                  <button
                    onClick={() => toggleTeamMember(p.id)}
                    className={styles.removeBtn}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.collection}>
            <h2>Colección</h2>
            {me.owned?.length === 0 ? (
              <p>No tenés Pokémon todavía. Comprá un sobre.</p>
            ) : (
              <ul className={styles.grid}>
                {me.owned.map((p) => {
                  const selected = team.includes(p.id);
                  return (
                    <li
                      key={p.id}
                      className={`${styles.card} ${selected ? styles.active : ""}`}
                    >
                      <div className={styles.pokeName}>{p.species}</div>
                      <p>Etapa {p.stage}</p>
                      <p>Copias {p.copies}</p>
                      <button
                        onClick={() => toggleTeamMember(p.id)}
                        className={styles.addBtn}
                        disabled={
                          !selected && team.length >= 6
                        }
                      >
                        {selected ? "Quitar" : "Agregar"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <button
            onClick={saveTeam}
            disabled={saving}
            className={styles.saveBtn}
          >
            {saving ? "Guardando..." : "Guardar equipo"}
          </button>
        </>
      )}
    </main>
  );
}
