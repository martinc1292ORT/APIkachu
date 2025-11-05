const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  register: (name) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name }) }),

  me: () => request("/user", { method: "GET" }),

  // 👇 ahora acepta objeto con cost y size
  buyPack: ({ cost = 50, size = 3 } = {}) =>
    request("/pack", { method: "POST", body: JSON.stringify({ cost, size }) }),

  setTeam: (ids) =>
    request("/user/team", { method: "PUT", body: JSON.stringify({ ids }) }),

  battle: (difficulty = "easy") =>
    request("/battle", { method: "POST", body: JSON.stringify({ difficulty }) }),

  evolve: (ownedId) =>
    request("/evolve", { method: "POST", body: JSON.stringify({ ownedId }) }),
};

export { BASE_URL };
