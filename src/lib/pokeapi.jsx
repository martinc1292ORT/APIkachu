const BASE = "https://pokeapi.co/api/v2";

export async function getPokemonList(limit = 12, offset = 0) {
  const res = await fetch(`${"https://pokeapi.co/api/v2"}/pokemon?limit=${limit}&offset=${offset}`, {
    // Con App Router, esto permite cachear en SSR y reusar en build/dev
    cache: "force-cache",

  });

  if (!res.ok) throw new Error("No se pudo traer la lista");
  return res.json();
}

export async function getPokemon(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
    cache: "no-store",        // <- clave para que no te quede un 404 cacheado
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("No se pudo traer el pokemon");
  return res.json();
}

export async function getPokemonTypes() {
  const res = await fetch(`${BASE}/type`);
  if (!res.ok) throw new Error("Types fetch failed");
  const json = await res.json();
  // filtra tipos “especiales” si querés (como “unknown” o “shadow”)
  return json.results
    .map(t => ({ name: t.name, url: t.url }))
    .filter(t => t.name !== "unknown" && t.name !== "shadow");
}

export async function getPokemonByType(typeName) {
  const res = await fetch(`${BASE}/type/${typeName}`);
  if (!res.ok) throw new Error("Type fetch failed");
  const json = await res.json();
  // devuelve [{name, url}]
  return json.pokemon.map(p => p.pokemon);
}