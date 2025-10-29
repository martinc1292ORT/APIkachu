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
