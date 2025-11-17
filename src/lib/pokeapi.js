const BASE = "https://pokeapi.co/api/v2";

// 📦 Devuelve una lista paginada de Pokémon
export async function getPokemonList(limit = 24, offset = 0) {
  const res = await fetch(`${BASE}/pokemon?limit=${limit}&offset=${offset}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudo traer la lista de Pokémon");
  return res.json(); // { results: [{name, url}], ... }
}

// 🔍 Trae el detalle de un Pokémon por nombre o id
export async function getPokemon(nameOrId) {
  const key = /^\d+$/.test(String(nameOrId).trim())
    ? String(nameOrId).trim()
    : String(nameOrId).toLowerCase().trim();

  const res = await fetch(`${BASE}/pokemon/${key}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("No se pudo traer el Pokémon");
  return res.json();
}

// 🧪 Devuelve todos los tipos válidos de Pokémon
export async function getPokemonTypes() {
  const res = await fetch(`${BASE}/type`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudieron traer los tipos");
  const json = await res.json();
  return json.results
    .map(t => ({ name: t.name, url: t.url }))
    .filter(t => t.name !== "unknown" && t.name !== "shadow" && t.name !== "stellar"); // ❌ filtramos "stellar"
}

// 🧬 Devuelve todos los Pokémon que tienen un tipo específico
export async function getPokemonByType(typeName) {
  const res = await fetch(`${BASE}/type/${typeName}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudo traer el tipo");
  const json = await res.json();
  // Devuelve [{ name, url }]
  return json.pokemon.map(p => p.pokemon);
}

// 🔢 Devuelve todos los Pokémon de una generación específica
export async function getPokemonByGeneration(genId) {
  const res = await fetch(`${BASE}/generation/${genId}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudo traer la generación");
  const json = await res.json();
  // Transformamos de: { name, url: /pokemon-species/{id}/ }
  // A: { name, url: /pokemon/{id}/ }
  return json.pokemon_species.map((p) => ({
    name: p.name,
    url: `${BASE}/pokemon/${getIdFromUrl(p.url)}/`
  }));
}

// 🆔 Extrae el ID desde una URL
export function getIdFromUrl(url) {
  // ej: https://pokeapi.co/api/v2/pokemon/25/  =>  "25"
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

// 🎨 URL del arte oficial de un Pokémon
export function getArtworkUrlById(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
