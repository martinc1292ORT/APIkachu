"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const LS_USERS_KEY = "apikachu_users";     // [{email, passwordHash, name, team, roster, points}]
const LS_SESSION_KEY = "apikachu_session"; // {email}
const TEAM_SIZE = 6;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null); // {email, name, team, roster, points}

  // -----------------------------------------
  // Utils de storage
  // -----------------------------------------
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

  // Helper: asegurar que cada pokémon tenga .url (necesario para PokemonCard)
  const ensureUrl = (p) =>
    p?.url ? p : (p?.id ? { ...p, url: `https://pokeapi.co/api/v2/pokemon/${p.id}/` } : p);

  // -----------------------------------------
  // Cargar sesión / migración
  // - Aseguramos: roster, points y url en roster/team
  // -----------------------------------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SESSION_KEY);
      if (!raw) return;
      const { email } = JSON.parse(raw);
      const users = getUsers();
      const u = users.find((x) => x.email === email);
      if (!u) return;

      let changed = false;

      // Migración suave: asegurar roster y points
      if (!u.roster) {
        u.roster = Array.isArray(u.team) ? u.team : [];
        changed = true;
      }
      if (typeof u.points !== "number") {
        u.points = 0;
        changed = true;
      }

      // NUEVO: completar .url faltante en roster y team antiguos
      if (Array.isArray(u.roster)) {
        const fixed = u.roster.map(ensureUrl);
        if (JSON.stringify(fixed) !== JSON.stringify(u.roster)) {
          u.roster = fixed;
          changed = true;
        }
      }
      if (Array.isArray(u.team)) {
        const fixedT = u.team.map(ensureUrl);
        if (JSON.stringify(fixedT) !== JSON.stringify(u.team)) {
          u.team = fixedT;
          changed = true;
        }
      }

      // Guardar si migramos algo
      if (changed) {
        const idx = findUserIndex(users, email);
        if (idx >= 0) {
          users[idx] = u;
          saveUsers(users);
        }
      }

      setUser({
        email: u.email,
        name: u.name || "",
        team: u.team || [],
        roster: u.roster || [],
        points: u.points || 0,
      });
    } catch {
      // noop
    }
  }, []);

  // -----------------------------------------
  // Hash demo (NO seguro para producción)
  // -----------------------------------------
  async function hash(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // -----------------------------------------
  // Poke helpers
  // - Starter team ahora guarda también .url
  // -----------------------------------------
  async function getStarterTeam() {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await res.json();
    const pool = data.results; // [{name, url}]

    const picked = [];
    while (picked.length < TEAM_SIZE) {
      const idx = Math.floor(Math.random() * pool.length);
      const p = pool[idx];
      if (!picked.some((x) => x.name === p.name)) picked.push(p);
    }

    const detailed = await Promise.all(
      picked.map(async (p) => {
        const r = await fetch(p.url);
        const d = await r.json();
        return {
          id: d.id,
          name: d.name,
          sprite: d.sprites?.front_default || "",
          types: d.types?.map((t) => t.type.name) || [],
          stats: d.stats?.map((s) => ({ name: s.stat.name, base_stat: s.base_stat })) || [],
          url: `https://pokeapi.co/api/v2/pokemon/${d.id}/`, // ← clave para PokemonCard
        };
      })
    );
    return detailed;
  }

  // -----------------------------------------
  // Auth API
  // -----------------------------------------
  async function register({ email, password, name }) {
    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      throw new Error("Ya existe un usuario con ese email.");
    }
    const passwordHash = await hash(password);

    // team y roster iniciales (ambos con .url)
    const team = await getStarterTeam();
    const newUser = {
      email,
      name: name || "",
      passwordHash,
      team,
      roster: team, // al inicio, roster = team
      points: 0,
    };

    users.push(newUser);
    saveUsers(users);
    startSession(email);
    setUser({ email, name: name || "", team, roster: team, points: 0 });
    router.push("/"); // o "/perfil"
  }

  async function login({ email, password }) {
    const users = getUsers();
    const u = users.find((x) => x.email === email);
    if (!u) throw new Error("Usuario no encontrado.");
    const passwordHash = await hash(password);
    if (u.passwordHash !== passwordHash) throw new Error("Contraseña incorrecta.");

    // Migraciones mínimas al iniciar sesión
    if (!u.roster) u.roster = u.team || [];
    if (typeof u.points !== "number") u.points = 0;

    // Completar .url por compatibilidad con PokemonCard
    u.roster = Array.isArray(u.roster) ? u.roster.map(ensureUrl) : [];
    u.team   = Array.isArray(u.team)   ? u.team.map(ensureUrl)   : [];

    saveUsers(users);

    startSession(email);
    setUser({
      email: u.email,
      name: u.name || "",
      team: u.team || [],
      roster: u.roster || [],
      points: u.points || 0,
    });
    router.push("/"); // o "/perfil"
  }

  function logout() {
    endSession();
    setUser(null);
    if (pathname !== "/login") router.push("/login");
  }

  function updateProfile(partial) {
    if (!user) return;
    const updated = persistUserByEmail(user.email, (u) => ({ ...u, ...partial }));
    if (updated) {
      setUser((prev) => ({ ...prev, ...partial }));
    }
  }

  // -----------------------------------------
  // Economía / Equipo
  // -----------------------------------------
  function addPoints(delta) {
    if (!user) return;
    const updated = persistUserByEmail(user.email, (u) => ({
      ...u,
      points: (u.points || 0) + Number(delta),
    }));
    if (updated) {
      setUser((prev) => ({ ...prev, points: updated.points }));
    }
  }

  function spendPoints(amount) {
    if (!user) throw new Error("No hay usuario activo");
    const n = Number(amount);
    const updated = persistUserByEmail(user.email, (u) => {
      const nextPts = (u.points || 0) - n;
      if (nextPts < 0) throw new Error("No tenés puntos suficientes");
      return { ...u, points: nextPts };
    });
    if (updated) {
      setUser((prev) => ({ ...prev, points: updated.points }));
    }
  }

  // NUEVO: normalizamos lo que se guarda en roster y garantizamos .url
function addToRoster(poke) {
  if (!user) throw new Error("No hay usuario activo");

  const normalized = {
    id: poke.id,
    name: poke.name,
    sprite: poke.sprite ?? "",
    types: Array.isArray(poke.types) ? poke.types : [],
    url: poke.url ?? (poke.id ? `https://pokeapi.co/api/v2/pokemon/${poke.id}/` : undefined),
  };

  // Siempre pusheamos (permitir duplicados). Si luego querés colección única, lo cambiamos.
  const updated = persistUserByEmail(user.email, (u) => {
    const roster = Array.isArray(u.roster) ? u.roster : [];
    return { ...u, roster: [...roster, normalized] };
  });

  if (updated) {
    setUser((prev) => ({ ...prev, roster: [...(prev?.roster || []), normalized] }));
  }
}


  // Reemplaza en el team por ID (busca el objeto en roster y lo pone en el slot)
  function replaceInTeam(slotIndex, pokeId) {
    if (!user) throw new Error("No hay usuario activo");
    const idxSlot = Number(slotIndex);
    if (idxSlot < 0 || idxSlot >= TEAM_SIZE) throw new Error("Slot inválido");

    const updated = persistUserByEmail(user.email, (u) => {
      const roster = Array.isArray(u.roster) ? u.roster : [];
      const team = Array.isArray(u.team) ? [...u.team] : Array(TEAM_SIZE).fill(null);
      const poke = roster.find((r) => r.id === pokeId);
      if (!poke) throw new Error("Pokémon no está en tu colección");
      team[idxSlot] = poke; // guardamos el objeto (con url) para que las Cards funcionen
      return { ...u, team };
    });

    if (updated) {
      setUser((prev) => ({ ...prev, team: updated.team }));
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      // auth
      login,
      register,
      logout,
      // perfil
      updateProfile,
      // economía / equipo
      addPoints,
      spendPoints,
      addToRoster,
      replaceInTeam,
      // extras por si querés reusar
      TEAM_SIZE,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
