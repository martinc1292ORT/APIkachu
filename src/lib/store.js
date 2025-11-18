import { computePokemonCost } from "./pricing";

export async function fetchPokemonDetail(idOrName) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
  if (!res.ok) throw new Error("No se pudo obtener el pokémon");
  const d = await res.json();
  return {
    id: d.id,
    name: d.name,
    sprite: d.sprites?.front_default || "",
    types: d.types?.map((t) => t.type.name) || [],
    stats: d.stats?.map((s) => ({ name: s.stat.name, base_stat: s.base_stat })) || [],
  };
}

export async function getPokemonPrice(idOrName) {
  const detail = await fetchPokemonDetail(idOrName);
  return computePokemonCost(detail);
}

export async function purchasePokemon(idOrName, spendPoints, addToRoster) {
  const detail = await fetchPokemonDetail(idOrName);
  const cost = computePokemonCost(detail);
  spendPoints(cost);
  addToRoster(detail);
  return { bought: detail, cost };
}
