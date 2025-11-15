"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PokemonCard from "@/components/PokemonCard";
import {
  getPokemonList,
  getPokemonTypes,
  getPokemonByType,
} from "@/lib/pokeapi";
import styles from "./pokedex.module.css";

export default function PokedexPage() {
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]); // array de nombres de tipo
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]); // [{name, url}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // paginación mínima (solo cuando no hay tipo seleccionado)
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);

  // Cargar tipos al montar
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await getPokemonTypes();
        if (mounted) setTypes(t);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Cargar lista según los tipos seleccionados
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        let results = [];

        if (selectedTypes.length === 0) {
          // sin filtro: lista general con paginación
          const json = await getPokemonList(limit, offset);
          results = json.results;
        } else if (selectedTypes.length === 1) {
          // un tipo: traemos todos de ese tipo
          results = await getPokemonByType(selectedTypes[0]);
        } else if (selectedTypes.length === 2) {
          // dos tipos: intersección entre ambos
          const [listA, listB] = await Promise.all([
            getPokemonByType(selectedTypes[0]),
            getPokemonByType(selectedTypes[1]),
          ]);
          const namesA = new Set(listA.map((p) => p.name));
          results = listB.filter((p) => namesA.has(p.name)); // solo los que estén en ambos
        }

        if (mounted) setList(results);
      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || "Error al cargar");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedTypes, limit, offset]);

  // Filtrado por búsqueda (dentro de la lista actual)
  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [list, search]);

  function handleToggleType(typeName) {
    // Si ya está seleccionado → lo quitamos
    if (selectedTypes.includes(typeName)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== typeName));
      return;
    }

    // Si hay menos de 2 → agregamos
    if (selectedTypes.length < 2) {
      setSelectedTypes([...selectedTypes, typeName]);
    } else {
      alert("Solo puedes seleccionar hasta dos tipos a la vez");
    }

    setOffset(0);
    setSearch("");
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function handleClearTypes() {
    setSelectedTypes([]);
  }

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Pokédex</h1>

      {/* Barra de búsqueda */}
      <div className={styles.row}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={
            selectedTypes.length
              ? `Buscar en ${selectedTypes.join(" + ")}…`
              : "Buscar en la página actual…"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.hint}>
          {selectedTypes.length === 0
            ? "Sin filtro de tipo"
            : `Filtrando por: ${selectedTypes.join(" + ")}`}
        </span>
      </div>

      {/* Botonera de tipos */}
      <div className={styles.typesWrap}>
        <button
          onClick={handleClearTypes}
          className={`${styles.typeBtn} ${selectedTypes.length === 0 ? styles.active : ""}`}
        >
          Todos
        </button>

        {types.map((t) => {
          const isActive = selectedTypes.includes(t.name);
          const disabled = !isActive && selectedTypes.length >= 2;
          const typeClass = isActive ? styles["type--" + t.name] : ""; // <-- color solo activo

          return (
            <button
              key={t.name}
              onClick={() => handleToggleType(t.name)}
              aria-pressed={isActive}
              disabled={disabled}
              className={`${styles.typeBtn} ${typeClass} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.typeName}>{t.name}</span>
            </button>
          );
        })}
      </div>


      {/* Paginación solo cuando NO hay tipo seleccionado */}
      {selectedTypes.length === 0 && (
        <div className={styles.row}>
          <button
            className={styles.pagerBtn}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
          >
            ← Anterior
          </button>
          <span className={styles.meta}>offset: {offset}</span>
          <button
            className={styles.pagerBtn}
            onClick={() => setOffset(offset + limit)}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Estado de carga / error */}
      {loading && <p className={styles.loading}>Cargando…</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map((p) => (
          <PokemonCard key={p.name} name={p.name} url={p.url} />
        ))}
      </div>

      {/* Link atrás */}
      <p className={styles.back}>
        <Link href="/">← Volver al inicio</Link>
      </p>
    </section>
  );
}
