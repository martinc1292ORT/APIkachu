"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthProvider";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // 6 pokes destacados rápidos
    (async () => {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const pool = (await res.json()).results;
      const pick = new Map();
      while (pick.size < 6) {
        const i = Math.floor(Math.random() * pool.length);
        pick.set(pool[i].name, pool[i].url);
      }
      const out = await Promise.all(
        [...pick.values()].map(async (url) => {
          const d = await (await fetch(url)).json();
          return {
            id: d.id,
            name: d.name,
            sprite: d.sprites?.front_default ?? "",
            types: d.types?.map((t) => t.type.name) ?? [],
          };
        })
      );
      setFeatured(out);
    })();
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim().toLowerCase();
    if (q) window.location.href = `/pokemon/${q}`;
  }

  return (
    <div className={styles.bg}>
      <main className={styles.container}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1>APIkachu</h1>
            <p>Armá tu equipo, combatí y coleccioná usando la PokeAPI.</p>

            <form className={styles.search} onSubmit={onSearch}>
              <input name="q" placeholder="Buscar Pokémon (p. ej. pikachu)" />
              <button type="submit">Buscar</button>
            </form>

            <div className={styles.ctaRow}>
              <Link className={styles.btnPrimary} href="/pokedex">Ir a la Pokédex</Link>
              <Link className={styles.btnGhost} href="/batalla">Batalla</Link>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.userRow}>
              <div className={styles.avatar}>
                {isAuthenticated ? (user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()) : "?"}
              </div>
              <div>
                <div className={styles.smallLabel}>Entrenador</div>
                <div className={styles.userName}>{isAuthenticated ? (user?.name || user?.email) : "Invitado"}</div>
              </div>
              <div className={styles.pointsBadge}>
                <span>Puntos</span>
                <strong>{isAuthenticated ? (user?.points ?? 0) : 0}</strong>
              </div>
            </div>

            <div className={styles.teamPreview}>
              {isAuthenticated && user?.team?.length ? (
                user.team.map((p) => (
                  <div key={p.id} className={styles.slot}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.sprite} alt={p.name} width={56} height={56} />
                    <div className={styles.pname}>{p.name}</div>
                  </div>
                ))
              ) : (
                <div className={styles.empty}>Iniciá sesión para ver tu equipo</div>
              )}
            </div>
          </div>
        </section>

        {/* NAV CARDS */}
        <section className={styles.navGrid}>
          <Link href="/pokedex" className={styles.navCard}>
            <div className={styles.navIcon}>📘</div>
            <h3>Pokédex</h3>
            <p>Filtrá por tipo, buscá por nombre y abrí el detalle.</p>
          </Link>

          <Link href="/batalla" className={styles.navCard}>
            <div className={styles.navIcon}>⚔️</div>
            <h3>Batalla</h3>
            <p>Combatí contra equipos aleatorios y ganá puntos.</p>
          </Link>

          <Link href="/tienda" className={styles.navCard}>
            <div className={styles.navIcon}>🛒</div>
            <h3>Tienda</h3>
            <p>Invertí puntos para mejorar tu equipo.</p>
          </Link>
        </section>

        {/* DESTACADOS */}
        <section className={styles.featured}>
          <h2>Destacados</h2>
          <div className={styles.grid}>
            {featured.length === 0
              ? [...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)
              : featured.map((p) => (
                  <Link key={p.id} href={`/pokemon/${p.name}`} className={styles.card}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.sprite} alt={p.name} width={72} height={72} />
                    <div className={styles.cardName}>{p.name}</div>
                    <div className={styles.types}>
                      {p.types.map((t) => <span key={t} className={styles.type}>{t}</span>)}
                    </div>
                  </Link>
                ))}
          </div>
        </section>
      </main>
    </div>
  );
}
