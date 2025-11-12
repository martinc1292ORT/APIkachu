"use client";
import Link from "next/link";
import { getIdFromUrl, getArtworkUrlById } from "@/lib/pokeapi";

export default function PokemonCard({ name, url }) {
  const id = url ? getIdFromUrl(url) : null;
  const img = id ? getArtworkUrlById(id) : "";
  const slug = id ?? encodeURIComponent(String(name).toLowerCase());

  return (
    <Link href={`/pokemon/${slug}`} style={card}>
      {img ? <img src={img} alt={name} style={imgStyle} /> : null}
      <div style={title}>{name}</div>
    </Link>
  );
}

const card = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textDecoration: "none",
  border: "1px solid #e4e4e4",
  borderRadius: 8,
  padding: 12,
  color: "#111",
  background: "#fff",
  transition: "transform .1s ease",
};
const imgStyle = { width: 120, height: 120, objectFit: "contain" };
const title = { marginTop: 8, fontWeight: 600, textTransform: "capitalize" };
