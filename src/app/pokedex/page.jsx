"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPokemonTypes, getPokemonByType } from "@/lib/pokeapi";
import styles from "./pokedex.module.css";

export default function PokedexPage() {
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [results, setResults] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState("");

  // Cargar tipos al iniciar
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingTypes(true);
        const t = await getPokemonTypes(); // [{ name: 'fire' }, ...]
        if (isMounted) setTypes(t);
      } catch (e) {
        if (isMounted) setError("Error cargando tipos");
      } finally {
        if (isMounted) setLoadingTypes(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const toggleType = (typeName) => {
    const next = new Set(selected);
    if (next.has(typeName)) next.delete(typeName);
    else next.add(typeName);
    setSelected(next);
  };

  const clearSelection = () => {
    setSelected(new Set());
    setResults([]);
    setError("");
  };

  const handleSearch = async () => {
    if (selected.size === 0) {
      setResults([]);
      return;
    }
    setLoadingSearch(true);
    setError("");
    try {
      // Unión (match ANY): juntamos todos, sin duplicados
      const all = [];
      for (const typeName of selected) {
        const list = await getPokemonByType(typeName); // [{name, url}, ...]
        all.push(...list.map(p => p.name));
      }
      // quitar duplicados y ordenar
      const unique = Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
      setResults(unique);
    } catch (e) {
      setError("Error buscando pokémon por tipo");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Pokédex</h1>

      {/* Filtros por tipo */}
      <section className={styles.filters}>
        <h2 className={styles.subtitle}>Filtrar por tipo</h2>

        {loadingTypes ? (
          <div className={styles.helperText}>Cargando tipos…</div>
        ) : (
          <div className={styles.typeGrid}>
            {types.map((t) => {
              const isActive = selected.has(t.name);
              return (
                <button
                  key={t.name}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleType(t.name)}
                  className={`${styles.typeBtn} ${isActive ? styles.typeBtnActive : ""}`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.actions}>
          <span className={styles.helperText}>
            {selected.size > 0
              ? `Seleccionados: ${selected.size}`
              : "Elegí uno o más tipos"}
          </span>

          <div className={styles.actionsRight}>
            <button
              type="button"
              onClick={clearSelection}
              className={styles.secondaryBtn}
              disabled={selected.size === 0 && results.length === 0}
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className={styles.primaryBtn}
              disabled={selected.size === 0 || loadingSearch}
            >
              {loadingSearch ? "Buscando…" : "Buscar"}
            </button>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className={styles.results}>
        <h2 className={styles.subtitle}>Resultados</h2>

        {error && <div className={styles.error}>{error}</div>}

        {!error && !loadingSearch && results.length === 0 && selected.size === 0 && (
          <p className={styles.helperText}>
            No se listan pokémon de entrada. Elegí tipos y presioná <b>Buscar</b>.
          </p>
        )}

        {!error && !loadingSearch && results.length === 0 && selected.size > 0 && (
          <p className={styles.helperText}>Sin resultados para esa selección.</p>
        )}

        {!error && loadingSearch && (
          <p className={styles.helperText}>Cargando resultados…</p>
        )}

        {!error && results.length > 0 && (
          <ul className={styles.grid}>
            {results.map((name) => (
              <li key={name} className={styles.card}>
                <Link href={`/pokemon/${name}`}>{name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
