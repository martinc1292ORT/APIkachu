"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Bienvenido a APIkachu ⚡</h1>
        <p className={styles.subtitle}>
          Armá tu equipo de Pokémon, comprá sobres, y enfrentate en batallas para ganar puntos.
        </p>
      </section>

      <section className={styles.links}>
        <h2>Explorá el mundo Pokémon:</h2>
        <h2>ESTA ES LA RAMA DE MAX</h2>
        <ul>
          <li><Link href="/pokedex">📘 Pokédex</Link></li>
          <li><Link href="/sobre">🎁 Sobres</Link></li>
          <li><Link href="/batalla">⚔️ Batalla</Link></li>
          <li><Link href="/perfil">👤 Tu perfil</Link></li>
        </ul>
      </section>

      <section className={styles.info}>
        <p>
          Este proyecto combina una <b>API REST con Express</b> (backend del TP2) y un{" "}
          <b>frontend en Next.js</b> (PNT2). Todo conectado para crear una experiencia completa.
        </p>
      </section>
    </main>
  );
}
