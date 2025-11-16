"use client";

import Link from "next/link";
import { getIdFromUrl, getArtworkUrlById } from "@/lib/pokeapi";
import styles from "./PokemonCard.module.css";

export default function PokemonCard({ name, url }) {
  const id = url ? getIdFromUrl(url) : null;
  const img = id ? getArtworkUrlById(id) : "";
  const slug = id ?? encodeURIComponent(String(name).toLowerCase());

  return (
    <Link href={`/pokemon/${slug}`} className={styles.card}>
      {img ? <img src={img} alt={name} className={styles.img} /> : null}
      <div className={styles.title}>{name}</div>
    </Link>
  );
}