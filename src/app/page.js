import Link from "next/link";
import { getPokemonList } from "@/api/pokeapi";
import styles from "./page.module.css";

export default async function Page() {
  let data;

  try {
    data = await getPokemonList(20, 0); // cambiar segun la cantidad de pokemones que queremos que traiga
  } catch (err) {
    return <div>Error cargando</div>;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>APIkachu</h1>
      <ul className={styles.grid}>
        {data.results.map((p) => (
          <li key={p.name} className={styles.card}>
            <Link href={`/pokemon/${p.name}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

//para ponerle el nombre a la pestaña
export async function generateMetadata() {
  return { title: `APIkachu` };
}
