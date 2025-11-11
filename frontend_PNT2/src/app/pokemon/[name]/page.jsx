import { notFound } from "next/navigation";
import { getPokemon } from "@/lib/pokeapi";
import styles from "./page.module.css";

export default async function PokemonDetail({ params }) {
  const { name } = await params; // no hace falta await
  const data = await getPokemon(name.toLowerCase()).catch(() => null);
  if (!data) return notFound();

  const img =
    data.sprites?.other?.["official-artwork"]?.front_default ||
    data.sprites?.front_default ||
    "";

  const types = (data.types ?? []).map((t) => t.type.name);
  const abilities = (data.abilities ?? []).map((a) => a.ability.name);

  return (
    <main className={styles.container}>
      <article className={styles.card}>
        <h1 className={styles.title}>
          {data.name} <span className={styles.id}>#{String(data.id).padStart(3, "0")}</span>
        </h1>

        {img && (
          <img
            src={img}
            alt={data.name}
            width="320"
            height="320"
            className={styles.image}
          />
        )}

        <ul className={styles.info}>
          <li><b>Tipos:</b> {types.join(", ") || "—"}</li>
          <li><b>Altura:</b> {data.height}</li>
          <li><b>Peso:</b> {data.weight}</li>
          <li><b>Base EXP:</b> {data.base_experience ?? "—"}</li>
          <li><b>Habilidades:</b> {abilities.join(", ") || "—"}</li>
        </ul>
      </article>
    </main>
  );
}

export async function generateMetadata({ params }) {
  const { name } = await params;
  return { title: `APIkachu – ${name}` };
}
