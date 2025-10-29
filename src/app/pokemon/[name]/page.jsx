import { notFound } from "next/navigation";
import { getPokemon } from "@/api/pokeapi";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Detalles({ params }) {
  const { name } = await params;
  let data;

  try {
    data = await getPokemon(name);
  } catch (error) {
    return (
      <main className={styles.container}>
        <p className={styles.error}>Error cargando el Pokémon</p>
      </main>
    );
  }

  if (!data) notFound();

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{data.name}</h1>

      <section className={styles.card}>
        <img
          src={
            data.sprites?.other?.["official-artwork"]?.front_default ||
            data.sprites?.front_default ||
            "/fallback.png"
          }
          alt={data.name}
          width={256}
          height={256}
          className={styles.image}
        />

        <div className={styles.info}>
          <h2>Datos</h2>
          <p><b>ID:</b> {data.id}</p>
          <p><b>Experiencia base:</b> {data.base_experience}</p>
          <p><b>Peso:</b> {data.weight}</p>
          <p><b>Altura:</b> {data.height}</p>

          <h3>Tipos</h3>
          <ul className={styles.pills}>
            {data.types.map((t) => (
              <li key={t.type.name}>{t.type.name}</li>
            ))}
          </ul>

          <h3>Habilidades</h3>
          <ul className={styles.abilities}>
            {data.abilities.map((a) => (
              <li key={a.ability.name}>
                {a.ability.name}
                {a.is_hidden && <span className={styles.hidden}> (oculta)</span>}
              </li>
            ))}
          </ul>

          <h3>Stats</h3>
          <ul className={styles.stats}>
            {data.stats.map((s) => (
              <li key={s.stat.name}>
                {s.stat.name}: <span>{s.base_stat}</span>
              </li>
            ))}
          </ul>

          {data.cries?.latest && (
            <div className={styles.audio}>
              <h3>Grito</h3>
              <audio controls src={data.cries.latest}></audio>
            </div>
          )}
        </div>
      </section>

      <Link href="/" className={styles.backButton}>
        ← Volver al listado
      </Link>
    </main>
  );
}

//para ponerle el nombre a la pestaña
export async function generateMetadata({ params }) {
  const { name } = await params; 
  return { title: `APIkachu - ${name}` };
}
