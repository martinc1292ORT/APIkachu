import Link from "next/link";
import { notFound } from "next/navigation";
import { getPokemon } from "@/lib/pokeapi";
import styles from "./page.module.css";

export default async function PokemonDetailPage({ params }) {
  const { name } = await params;
  const key = decodeURIComponent(String(name));
  const data = await getPokemon(key);

  if (!data) notFound();

  const artwork = data.sprites?.other?.["official-artwork"]?.front_default || "";
  const types = data.types?.map((t) => t.type.name) ?? [];
  const stats = data.stats?.map((s) => ({ name: s.stat.name, value: s.base_stat })) ?? [];

  // Mapa de colores base por tipo (para el degradado)
  const typeColors = {
    fire: "#EF5350",
    water: "#42A5F5",
    grass: "#66BB6A",
    electric: "#F4D23C",
    ice: "#81D4FA",
    fighting: "#D32F2F",
    poison: "#AB47BC",
    ground: "#A1887F",
    flying: "#90CAF9",
    psychic: "#F48FB1",
    bug: "#A8B820",
    rock: "#B6A136",
    ghost: "#7C4DFF",
    dragon: "#6F35FC",
    dark: "#4E342E",
    steel: "#B0BEC5",
    fairy: "#F8BBD0",
    normal: "#A8A77A",
  };

  const bg1 = typeColors[types[0]] || "#3b4cca";
  const bg2 = typeColors[types[1]] || bg1;
  const gradient = `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)`;

  return (
    <section className={styles.container} style={{ background: gradient }}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>{data.name}</h1>
          <span className={styles.id}>#{String(data.id).padStart(4, "0")}</span>
        </header>

        <div className={styles.content}>
          {artwork && (
            <div className={styles.artworkCard}>
              <img className={styles.artwork} src={artwork} alt={data.name} />
            </div>
          )}

          <div className={styles.info}>
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Tipos</h3>
              <ul className={styles.typeList}>
                {types.map((t) => {
                  const mod = styles["type--" + t] || "";
                  return (
                    <li key={t} className={`${styles.type} ${mod}`}>
                      {t}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Estadísticas</h3>
              <ul className={styles.statsList}>
                {stats.map((s) => (
                  <li key={s.name} className={styles.statRow}>
                    <span className={styles.statName}>{s.name}</span>
                    <meter
                      className={styles.meter}
                      value={s.value}
                      min={0}
                      max={255}
                      low={60}
                      high={120}
                      optimum={180}
                    />
                    <strong className={styles.statVal}>{s.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className={styles.back}>
          <Link href="/pokedex">← Volver a la Pokédex</Link>
        </p>
      </div>
    </section>
  );
}
