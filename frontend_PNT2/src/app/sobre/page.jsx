"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/session";
import { useRequireUser } from "@/lib/session";
import styles from "./sobre.module.css";

export default function SobrePage() {
  useRequireUser();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);
  const [cards, setCards] = useState([]); // resultado del sobre

  // Traer datos del usuario desde el backend (puntos, etc.)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.me(); // { user: { name, points, ... }, ...}
        if (mounted) setMe(data.user || null);
      } catch (e) {
        if (mounted) setError("No pude conectar con el backend. ¿Levantaste la API Express?");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function openInitial() {
    setError("");
    setCards([]);
    setOpening(true);
    try {
      // Primer sobre: 6 cartas, costo 0
      const res = await api.buyPack({ cost: 0, size: 6 });
      setCards(res.added || []);
      // refrescar datos del usuario (puntos, colección actualizada)
      const data = await api.me();
      setMe(data.user || null);
    } catch (e) {
      setError(e.message || "Error al abrir el sobre inicial");
    } finally {
      setOpening(false);
    }
  }

  async function buyBasic() {
    setError("");
    setCards([]);
    setOpening(true);
    try {
      // Sobre básico: 3 cartas, 50 puntos
      const res = await api.buyPack({ cost: 50, size: 3 });
      setCards(res.added || []);
      const data = await api.me();
      setMe(data.user || null);
    } catch (e) {
      setError(e.message || "Error al comprar el sobre");
    } finally {
      setOpening(false);
    }
  }

  const localUser = getUser(); // por si querés mostrar el nombre guardado localmente

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>🎁 Sobres</h1>

      {loading ? (
        <p className={styles.helper}>Cargando…</p>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <section className={styles.status}>
            <div>
              <div className={styles.label}>Entrenador</div>
              <div className={styles.value}>{me?.name || localUser?.name || "—"}</div>
            </div>
            <div>
              <div className={styles.label}>Puntos</div>
              <div className={styles.value}>{me?.points ?? 0}</div>
            </div>
          </section>

          <section className={styles.actions}>
            <button
              type="button"
              onClick={openInitial}
              disabled={opening}
              className={styles.primary}
            >
              {opening ? "Abriendo…" : "Abrir sobre inicial (x6, 0 pts)"}
            </button>

            <button
              type="button"
              onClick={buyBasic}
              disabled={opening || (me?.points ?? 0) < 50}
              className={styles.secondary}
              title={(me?.points ?? 0) < 50 ? "Necesitás 50 puntos" : ""}
            >
              {opening ? "Comprando…" : "Comprar sobre básico (x3, 50 pts)"}
            </button>
          </section>

          <section>
            <h2 className={styles.subtitle}>Cartas reveladas</h2>
            {cards.length === 0 ? (
              <p className={styles.helper}>Abrí un sobre para ver las cartas obtenidas.</p>
            ) : (
              <ul className={styles.grid}>
                {cards.map((c) => {
                  // el backend devuelve algo tipo { id, species, stage, copies, energy }
                  const name = c.species || c.name || "desconocido";
                  return (
                    <li key={c.id || name} className={styles.card}>
                      <div className={styles.pokeName}>{name}</div>
                      <div className={styles.meta}>
                        <span>Etapa: {c.stage ?? 1}</span>
                        {typeof c.copies === "number" && <span>Copias: {c.copies}</span>}
                      </div>
                      <Link href={`/pokemon/${name}`} className={styles.link}>
                        Ver detalle
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={styles.next}>
            <Link href="/perfil">Ir a tu Perfil →</Link>
          </section>
        </>
      )}
    </main>
  );
}
