export async function getPokemonList(limit = 12, offset = 0) {
  const res = await fetch(`${"https://pokeapi.co/api/v2"}/pokemon?limit=${limit}&offset=${offset}`, {
    // Con App Router, esto permite cachear en SSR y reusar en build/dev
    cache: "force-cache",

  });

  if (!res.ok) throw new Error("No se pudo traer la lista");
  return res.json(); // { count, next, previous, results: [{name,url}] }
}
