export async function fetchRandomTeam(count = 6) {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await res.json();
  const pool = data.results;
  const picked = [];
  while (picked.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    const p = pool[idx];
    if (!picked.some((x) => x.name === p.name)) picked.push(p);
  }

  const detailed = await Promise.all(
    picked.map(async (p) => {
      const r = await fetch(p.url);
      const d = await r.json();
      return compactPokemon(d);
    })
  );
  return detailed;
}

export function compactPokemon(d) {
  return {
    id: d.id,
    name: d.name,
    sprite: d.sprites?.front_default || "",
    types: d.types?.map((t) => t.type.name) || [],
    stats: extractStats(d),
    base_experience: d.base_experience || 0,
  };
}

export function extractStats(d) {
  const map = {};
  d.stats?.forEach((s) => { map[s.stat?.name] = s.base_stat; });
  return {
    hp: map.hp || 0,
    attack: map.attack || 0,
    defense: map.defense || 0,
    "special-attack": map["special-attack"] || 0,
    speed: map.speed || 0,
  };
}

function powerScore(p) {
  const s = p.stats || {};
  const base =
    (s.attack || 0) +
    (s["special-attack"] || 0) +
    (s.speed || 0) +
    0.5 * (s.defense || 0) +
    0.25 * (s.hp || 0);
  const rng = Math.floor(Math.random() * 51);
  return Math.round(base + rng);
}

export async function ensureDetailedTeam(team) {
  return await Promise.all(
    team.map(async (p) => {
      if (p.stats) {
        if (Array.isArray(p.stats)) {
          const mapa = {};
          p.stats.forEach((s) => {
            mapa[s.name] = s.base_stat;
          });

          const statsNormalizadas = {
            hp: mapa.hp || 0,
            attack: mapa.attack || 0,
            defense: mapa.defense || 0,
            "special-attack": mapa["special-attack"] || 0,
            speed: mapa.speed || 0,
          };

          return {
            ...p,
            stats: statsNormalizadas,
          };
        }
        return p;
      }

      const url = `https://pokeapi.co/api/v2/pokemon/${p.id || p.name}`;
      const r = await fetch(url);
      const d = await r.json();
      return compactPokemon(d);
    })
  );
}


export async function simulateBattle(userTeamIn) {
  const userTeam = await ensureDetailedTeam(userTeamIn);
  const opponentTeam = await fetchRandomTeam(userTeam.length);

  const rounds = [];
  let myWins = 0;
  let oppWins = 0;

  const roundsCount = userTeam.length;

  for (let i = 0; i < roundsCount; i++) {
    const mine = userTeam[i % userTeam.length];  
    const opp = opponentTeam[i];                 

    const myScore = powerScore(mine);
    const oppScore = powerScore(opp);

    let winner = "draw";
    if (myScore > oppScore) { winner = "me"; myWins++; }
    else if (oppScore > myScore) { winner = "opp"; oppWins++; }

    rounds.push({ index: i + 1, me: mine, opp, myScore, oppScore, winner });
  }

  let result = "draw";
  if (myWins > oppWins) result = "win";
  if (oppWins > myWins) result = "lose";

  const awardedPoints = result === "win" ? 3 : result === "draw" ? 1 : 0;

  return { opponentTeam, rounds, result, myWins, oppWins, awardedPoints };

}
