"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PokemonCard from "@/components/PokemonCard";
import {
  getPokemonList,
  getPokemonTypes,
  getPokemonByType,
  getPokemonByGeneration,
  getIdFromUrl
} from "@/lib/pokeapi";
import styles from "./pokedex.module.css";

export default function PokedexPage() {
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedGenerations, setSelectedGenerations] = useState([]);
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);

  const generationButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await getPokemonTypes();
        const filtered = t.filter((type) => type.name !== "stellar");
        if (mounted) setTypes(filtered);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        let results = [];

        // Caso sin filtros
        if (selectedTypes.length === 0 && selectedGenerations.length === 0) {
          const json = await getPokemonList(limit, offset);
          results = json.results;
        }

        // Filtro por tipo (1 o 2)
        else if (selectedTypes.length > 0 && selectedGenerations.length === 0) {
          if (selectedTypes.length === 1) {
            results = await getPokemonByType(selectedTypes[0]);
          } else {
            const [listA, listB] = await Promise.all([
              getPokemonByType(selectedTypes[0]),
              getPokemonByType(selectedTypes[1]),
            ]);
            const namesA = new Set(listA.map((p) => p.name));
            results = listB.filter((p) => namesA.has(p.name));
          }
        }

        // Filtro por generación (una o más)
        else if (selectedGenerations.length > 0 && selectedTypes.length === 0) {
          const allLists = await Promise.all(
            selectedGenerations.map((gen) => getPokemonByGeneration(gen))
          );
          results = allLists.flat();
        }

        // Filtro combinado tipo + generación
        else {
          let typeResults = [];
          if (selectedTypes.length === 1) {
            typeResults = await getPokemonByType(selectedTypes[0]);
          } else {
            const [listA, listB] = await Promise.all([
              getPokemonByType(selectedTypes[0]),
              getPokemonByType(selectedTypes[1]),
            ]);
            const namesA = new Set(listA.map((p) => p.name));
            typeResults = listB.filter((p) => namesA.has(p.name));
          }

          const genLists = await Promise.all(
            selectedGenerations.map((gen) => getPokemonByGeneration(gen))
          );
          const genNames = new Set(genLists.flat().map((p) => p.name));

          results = typeResults.filter((p) => genNames.has(p.name));
        }

        // Ordenar por ID numérico
        results.sort((a, b) => {
          const idA = Number(getIdFromUrl(a.url));
          const idB = Number(getIdFromUrl(b.url));
          return idA - idB;
        });

        if (mounted) setList(results);
      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || "Error al cargar");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedTypes, selectedGenerations, limit, offset]);

  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [list, search]);

  function handleToggleType(typeName) {
    if (selectedTypes.includes(typeName)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== typeName));
      return;
    }

    if (selectedTypes.length < 2) {
      setSelectedTypes([...selectedTypes, typeName]);
    } else {
      alert("Solo puedes seleccionar hasta dos tipos a la vez");
    }

    setOffset(0);
    setSearch("");
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function handleToggleGeneration(genNumber) {
    if (selectedGenerations.includes(genNumber)) {
      setSelectedGenerations(selectedGenerations.filter((g) => g !== genNumber));
    } else {
      setSelectedGenerations([...selectedGenerations, genNumber]);
    }

    setOffset(0);
    setSearch("");
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function handleClearFilters() {
    setSelectedTypes([]);
    setSelectedGenerations([]);
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
            selectedTypes.length || selectedGenerations.length
              ? `Buscar en los filtros activos…`
              : "Buscar en la página actual…"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.hint}>
          {selectedTypes.length === 0 && selectedGenerations.length === 0
            ? "Sin filtros activos"
            : `Filtrando por: ${[...selectedTypes, ...selectedGenerations.map((g) => `Gen ${g}`)].join(" + ")}`}
        </span>
      </div>

      {/* Botonera de tipos */}
      <div className={styles.typesWrap}>
        <button
          onClick={handleClearFilters}
          className={`${styles.typeBtn} ${selectedTypes.length === 0 && selectedGenerations.length === 0 ? styles.active : ""
            }`}
        >
          Todos
        </button>

        {types.map((t) => {
          const isActive = selectedTypes.includes(t.name);
          const disabled = !isActive && selectedTypes.length >= 2;
          const typeClass = isActive ? styles["type--" + t.name] : "";

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

      {/* Botonera de generaciones */}
      <div className={styles.typesWrap}>
        {generationButtons.map((gen) => {
          const isActive = selectedGenerations.includes(gen);
          return (
            <button
              key={gen}
              onClick={() => handleToggleGeneration(gen)}
              aria-pressed={isActive}
              className={`${styles.typeBtn} ${isActive ? styles.active : ""}`}
            >
              Gen {gen}
            </button>
          );
        })}
      </div>

      {/* Paginación solo sin filtros */}
      {selectedTypes.length === 0 && selectedGenerations.length === 0 && (
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

      {loading && <p className={styles.loading}>Cargando…</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      <div className={styles.grid}>
        {filtered.map((p) => (
          <PokemonCard key={p.name} name={p.name} url={p.url} />
        ))}
      </div>

      <p className={styles.back}>
        <Link href="/">← Volver al inicio</Link>
      </p>
    </section>
  );
}
