"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getIdFromUrl,
  getArtworkUrlById,
  getPokemon,
} from "@/lib/pokeapi";
import styles from "./PokemonCard.module.css";

const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EF5350",
  water: "#42A5F5",
  electric: "#F4D23C",
  grass: "#66BB6A",
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
};

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

    
    return `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)`;
  };
// COmentario aklwegvailwfvblakv
  return (
    <Link
      href={`/pokemon/${slug}`}
      className={styles.card}
      style={hovered ? { background: getHoverBackground(), transform: "scale(1.05)" } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {img && <img src={img} alt={name} className={styles.img} />}
      <div className={styles.title}>{name}</div>
    </Link>
  );
}
