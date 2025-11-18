"use client";

import Link from "next/link";
import { getIdFromUrl, getArtworkUrlById } from "@/lib/pokeapi";
import styles from "./PokemonCard.module.css";

export default function PokemonCard({ name, url }) {
  const id = url ? getIdFromUrl(url) : null;
  const img = id ? getArtworkUrlById(id) : "";
  const slug = id ?? encodeURIComponent(String(name).toLowerCase());

  const [types, setTypes] = useState([]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPokemon(name);
        if (mounted && data?.types) {
          const t = data.types.map((t) => t.type.name);
          setTypes(t);
        }
      } catch (e) {
        console.error("Error al obtener tipos:", e);
      }
    })();
    return () => { mounted = false };
  }, [name]);

  const getHoverBackground = () => {
    const [type1, type2] = types;
    const color1 = TYPE_COLORS[type1] || "#333";
    const color2 = TYPE_COLORS[type2] || color1;

    // Fondo dividido al 50% para que se vean claramente los dos tipos
    return `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)`;
  };

  return (
    <Link href={`/pokemon/${slug}`} className={styles.card}>
      {img ? <img src={img} alt={name} className={styles.img} /> : null}
      <div className={styles.title}>{name}</div>
    </Link>
  );
}
