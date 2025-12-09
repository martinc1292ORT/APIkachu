const BASE = "https://pokeapi.co/api/v2";

export async function getPokemonList(limit = 24, offset = 0) {
  const res = await fetch(`${BASE}/pokemon?limit=${limit}&offset=${offset}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudo traer la lista de Pokémon");
  return res.json(); 
}

export async function getPokemon(nameOrId) {
  const cleaned = String(nameOrId).trim();
  const key = Number.isInteger(+cleaned)
    ? cleaned
    : cleaned.toLowerCase();

  const res = await fetch(`${BASE}/pokemon/${key}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("No se pudo traer el Pokémon");
  return res.json();
}

export async function getPokemonTypes() {
  const res = await fetch(`${BASE}/type`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudieron traer los tipos");
  const json = await res.json();
  return json.results
    .map(t => ({ name: t.name, url: t.url }))
    .filter(t => t.name !== "unknown" && t.name !== "shadow" && t.name !== "stellar");
}

export async function getPokemonByType(typeName) {
  const res = await fetch(`${BASE}/type/${typeName}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudo traer el tipo");
  const json = await res.json();
  return json.pokemon.map(p => p.pokemon);
}

export async function getPokemonByGeneration(genId) {
  const res = await fetch(`${BASE}/generation/${genId}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("No se pudo traer la generación");
  const json = await res.json();
  return json.pokemon_species.map((p) => ({
    name: p.name,
    url: `${BASE}/pokemon/${getIdFromUrl(p.url)}/`
  }));
}

export function getIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function getArtworkUrlById(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
