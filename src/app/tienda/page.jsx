"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import styles from "./tienda.module.css";
import PokemonCard from "@/components/PokemonCard";
import { useAuth } from "@/contexts/AuthProvider";
import { getPokemonPrice, purchasePokemon } from "@/lib/store";
import { getIdFromUrl } from "@/lib/pokeapi";

const LIMIT = 60;
const OFFSET = 0;

export default function TiendaPage() {
  const router = useRouter();           
  const { user, spendPoints, addToRoster, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // [{ name, url, id, price }]
  const [order, setOrder] = useState("asc"); 
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      setMsg("");
      try {

        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${OFFSET}`
        );
        if (!res.ok) throw new Error("No se pudo cargar la lista de pokémon");
        const data = await res.json();
        const base = (data?.results || []).map((r) => ({
          name: r.name,
          url: r.url,
          id: getIdFromUrl(r.url),
          price: null,
        }));

        const concurrency = 8;
        const acc = [];
        for (let i = 0; i < base.length; i += concurrency) {
          const chunk = base.slice(i, i + concurrency);
          const priced = await Promise.all(
            chunk.map(async (p) => {
              try {
                const price = await getPokemonPrice(p.name);
                return { ...p, price };
              } catch {
                return { ...p, price: null };
              }
            })
          );
          acc.push(...priced);
          if (cancel) return;
        }
        if (!cancel) setItems(acc);
      } catch (e) {
        if (!cancel) setMsg(e.message || "Error cargando la tienda");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const byName = term
      ? items.filter((p) => p.name.toLowerCase().includes(term))
      : items;
    const pricedLast = [...byName].sort((a, b) => {

      const ap = a.price ?? Infinity;
      const bp = b.price ?? Infinity;
      return order === "asc"
        ? ap - bp || a.name.localeCompare(b.name)
        : bp - ap || a.name.localeCompare(b.name);
    });
    return pricedLast;
  }, [items, q, order]);

  async function handleBuy(p) {
    if (!p?.name) return;

    // 🔒 Si no hay sesión, no intento comprar
    if (!isAuthenticated) {
      setMsg("Debés iniciar sesión para comprar un Pokémon.");
      router.push("/login?from=tienda");
      return;
    }

    setMsg("");
    setBusyId(p.id);

    try {
      const res = await purchasePokemon(p.name, spendPoints, addToRoster);
      setMsg(`✅ Compraste a ${res.bought.name} por ${res.cost} pts`);
    } catch (e) {
      setMsg(e.message || "No se pudo comprar");
    } finally {
      setBusyId(null);
    }
  }


  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tienda de Pokemones</h1>

        <div className={styles.controls}>
          <div className={styles.points}>
            Puntos: <strong>{user?.points ?? 0}</strong>
          </div>

          <input
            className={styles.search}
            placeholder="Buscar por nombre (ej. pikachu)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <label className={styles.sortLabel}>
            Ordenar por precio:
            <select
              className={styles.select}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value="asc">Menor a mayor</option>
              <option value="desc">Mayor a menor</option>
            </select>
          </label>

          <Link className={styles.linkPokedex} href="/pokedex">
            Ver Pokédex
          </Link>
        </div>
      </header>

      {loading && <div className={styles.status}>Cargando tienda…</div>}
      {msg && !loading && <div className={styles.status}>{msg}</div>}
      {!loading && filtered.length === 0 && (
        <div className={styles.status}>No hay resultados con ese filtro.</div>
      )}

      <section className={styles.grid}>
        {filtered.map((p) => (
          <div key={p.id ?? p.name} className={styles.cardWrap}>
 
            <PokemonCard name={p.name} url={p.url} />

            <div className={styles.meta}>
              <div className={styles.price}>
                Precio:{" "}
                <strong>
                  {p.price != null ? `${p.price} pts` : "—"}
                </strong>
              </div>
              <button
                className={styles.buyBtn}
                onClick={() => handleBuy(p)}
                disabled={busyId === p.id || p.price == null}
                title="Comprar y agregar al roster"
              >
                {busyId === p.id ? "Comprando…" : "Comprar"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
