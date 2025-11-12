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

// Nuevo look oscuro, con borde sutil y hover
const card = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textDecoration: "none",
  border: "1px solid #2e354d",
  borderRadius: 12,
  padding: 14,
  color: "#eaeaea",
  background: "#1b2134",
  boxShadow: "0 2px 8px rgba(0,0,0,.25)",
  transition: "transform .12s ease, box-shadow .12s ease",
};
const imgStyle = {
  width: 140,
  height: 140,
  objectFit: "contain",
  filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))",
};
const title = {
  marginTop: 10,
  fontWeight: 700,
  textTransform: "capitalize",
  letterSpacing: ".2px",
};

// pequeño hover via style prop (si preferís CSS module, lo movemos)
card["&:hover"]; // no-op para editores; el hover lo maneja el contenedor padre si querés
