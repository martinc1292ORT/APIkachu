"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const LS_USERS_KEY = "apikachu_users"; // [{email, passwordHash, name, team, roster, points, battles}]
const LS_SESSION_KEY = "apikachu_session"; // {email}
const TEAM_SIZE = 6;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);

  // Utils de storage
  function getUsers() {
    return JSON.parse(localStorage.getItem(LS_USERS_KEY) || "[]");
  }
  function saveUsers(users) {
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  }
  function findUserIndex(users, email) {
    return users.findIndex((u) => u.email === email);
  }
  function persistUserByEmail(email, updater) {
    const users = getUsers();
    const idx = findUserIndex(users, email);
    if (idx < 0) return null;
    const updated = updater({ ...users[idx] });
    users[idx] = updated;
    saveUsers(users);
    return updated;
  }
  function startSession(email) {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify({ email }));
  }
  function endSession() {
    localStorage.removeItem(LS_SESSION_KEY);
  }

  function ensureUrl(pokemon) {
    if (!pokemon) {
      return pokemon;
    }
    if (pokemon.url) {
      return pokemon;
    }
    if (pokemon.id) {
      pokemon.url = "https://pokeapi.co/api/v2/pokemon/" + pokemon.id + "/";
      return pokemon;
    }
    return pokemon;
  }

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(LS_SESSION_KEY);
      if (!storedSession) return;

      const sessionData = JSON.parse(storedSession);
      const email = sessionData.email;

      const users = getUsers();

      const userFound = users.find((u) => u.email === email);
      if (!userFound) return;

      setUser({
        email: userFound.email,
        name: userFound.name || "",
        team: userFound.team || [],
        roster: userFound.roster || [],
        points: typeof userFound.points === "number" ? userFound.points : 0,
        battles: typeof userFound.battles === "number" ? userFound.battles : 0,
      });
    } catch (error) {
      console.log("Hubo un problema cargando la sesión");
    }
  }, []);

  // Hash del pass (prelimiar)
  async function hash(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function getStarterTeam() {
    const respuesta = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=151"
    );
    const data = await respuesta.json();
    const listaPokemones = data.results; // [{name, url}]

    const picked = [];
    while (picked.length < TEAM_SIZE) {
      const indiceRandom = Math.floor(Math.random() * listaPokemones.length);
      const pokeElegido = listaPokemones[indiceRandom];

      const yaElegido = picked.some((p) => p.name === pokeElegido.name);
      if (!yaElegido) {
        picked.push(pokeElegido);
      }
    }

    const equipoCompleto = await Promise.all(
      picked.map(async (pokemon) => {
        const respuestaDetalle = await fetch(pokemon.url);
        const datosDetalle = await respuestaDetalle.json();

        return {
          id: datosDetalle.id,
          name: datosDetalle.name,
          sprite: datosDetalle.sprites?.front_default || "",
          types: datosDetalle.types?.map((t) => t.type.name) || [],
          stats:
            datosDetalle.stats?.map((s) => ({
              name: s.stat.name,
              base_stat: s.base_stat,
            })) || [],
          url: `https://pokeapi.co/api/v2/pokemon/${datosDetalle.id}/`,
        };
      })
    );
    return equipoCompleto;
  }

  async function register({ email, password, name }) {
    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      throw new Error("Ya existe un usuario con ese email.");
    }
    const passwordHash = await hash(password);

    const team = await getStarterTeam();
    const newUser = {
      email,
      name: name || "",
      passwordHash,
      team,
      roster: [],
      points: 0,
      battles: 0,
    };

    users.push(newUser);
    saveUsers(users);
    startSession(email);
    setUser({
      email,
      name: name || "",
      team,
      roster: [],
      points: 0,
      battles: 0,
    });
    router.push("/");
  }

  async function login({ email, password }) {
    const users = getUsers();

    const user = users.find((u) => u.email === email);
    if (!user) throw new Error("Usuario no encontrado.");

    const passwordHash = await hash(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Contraseña incorrecta.");
    }

    if (!user.roster) user.roster = [];
    if (typeof user.points !== "number") user.points = 0;
    if (typeof user.battles !== "number") user.battles = 0;

    if (Array.isArray(user.roster)) {
      user.roster = user.roster.map(ensureUrl);
    } else {
      user.roster = [];
    }

    if (Array.isArray(user.team)) {
      user.team = user.team.map(ensureUrl);
    } else {
      user.team = [];
    }

    saveUsers(users);

    startSession(email);

    setUser({
      email: user.email,
      name: user.name || "",
      team: user.team || [],
      roster: user.roster || [],
      points: typeof user.points === "number" ? user.points : 0,
      battles: typeof user.battles === "number" ? user.battles : 0,
    });

    router.push("/");
  }

  function logout() {
    endSession();
    setUser(null);
    if (pathname !== "/login") router.push("/login");
  }

  function updateProfile(cambios) {
    if (!user) return;

    const usuarioActualizado = persistUserByEmail(
      user.email,
      (usuarioViejo) => {
        const nuevoUsuario = {
          ...usuarioViejo,
          ...cambios,
        };
        return nuevoUsuario;
      }
    );

    if (usuarioActualizado) {
      const nuevoEstado = {
        ...user,
        ...cambios,
      };

      setUser(nuevoEstado);
    }
  }

  function addPoints(cantidad) {
    setUser((prev) => {
      if (!prev) return prev;

      const nuevosPuntos = (prev.points || 0) + Number(cantidad);

      persistUserByEmail(prev.email, (u) => ({
        ...u,
        points: nuevosPuntos,
      }));

      return {
        ...prev,
        points: nuevosPuntos,
      };
    });
  }

  function spendPoints(cantidad) {
    setUser((prev) => {
      if (!prev) throw new Error("No hay usuario activo");

      const puntosAGastar = Number(cantidad);
      const puntosActuales = prev.points || 0;

      if (puntosActuales < puntosAGastar) {
        throw new Error("No tenés puntos suficientes");
      }

      const nuevosPuntos = puntosActuales - puntosAGastar;

      persistUserByEmail(prev.email, (u) => ({
        ...u,
        points: nuevosPuntos,
      }));

      return {
        ...prev,
        points: nuevosPuntos,
      };
    });

    if (usuarioActualizado) {
      setUser({
        ...user,
        points: usuarioActualizado.points,
      });
    }
  }

  function addToRoster(pokemon) {
    if (!user) throw new Error("No hay usuario activo");

    const pokemonNormalizado = {
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon.sprite ? pokemon.sprite : "",
      types: Array.isArray(pokemon.types) ? pokemon.types : [],
      url:
        pokemon.url ||
        (pokemon.id
          ? `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`
          : undefined),
    };

    const usuarioActualizado = persistUserByEmail(
      user.email,
      (usuarioViejo) => {
        const rosterViejo = Array.isArray(usuarioViejo.roster)
          ? usuarioViejo.roster
          : [];

        const rosterNuevo = [...rosterViejo, pokemonNormalizado];

        return {
          ...usuarioViejo,
          roster: rosterNuevo,
        };
      }
    );

    if (usuarioActualizado) {
      const rosterPrevio = Array.isArray(user.roster) ? user.roster : [];

      setUser({
        ...user,
        roster: [...rosterPrevio, pokemonNormalizado],
      });
    }
  }

  function replaceInTeam(posicion, idPokemon) {
    if (!user) throw new Error("No hay usuario activo");

    const numeroPosicion = Number(posicion);

    if (numeroPosicion < 0 || numeroPosicion >= TEAM_SIZE) {
      throw new Error("Posición del equipo inválida");
    }

    const usuarioActualizado = persistUserByEmail(
      user.email,
      (usuarioViejo) => {
        const rosterViejo = Array.isArray(usuarioViejo.roster)
          ? usuarioViejo.roster
          : [];

        let teamViejo;
        if (Array.isArray(usuarioViejo.team)) {
          teamViejo = [...usuarioViejo.team];
        } else {
          teamViejo = Array(TEAM_SIZE).fill(null);
        }

        const pokemonElegido = rosterViejo.find((p) => p.id === idPokemon);

        if (!pokemonElegido) {
          throw new Error("Ese Pokémon no está en tu colección");
        }

        teamViejo[numeroPosicion] = pokemonElegido;

        return {
          ...usuarioViejo,
          team: teamViejo,
        };
      }
    );

    if (usuarioActualizado) {
      setUser({
        ...user,
        team: usuarioActualizado.team,
      });
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      addPoints,
      spendPoints,
      addToRoster,
      replaceInTeam,
      TEAM_SIZE,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
