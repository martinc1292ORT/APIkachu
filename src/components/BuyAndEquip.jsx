"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { getPokemonPrice, purchasePokemon } from "@/lib/store";

export default function BuyAndEquip() {
  const { user, spendPoints, addToRoster, replaceInTeam } = useAuth();
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState(null);
  const [msg, setMsg] = useState("");

  async function onCheckPrice() {
    setMsg("");
    try {
      const p = await getPokemonPrice(query.trim().toLowerCase());
      setPrice(p);
    } catch (e) {
      setPrice(null);
      setMsg(e.message || "No se pudo calcular el precio");
    }
  }

  async function onBuy() {
    setMsg("");
    try {
      const res = await purchasePokemon(query.trim().toLowerCase(), spendPoints, addToRoster);
      setMsg(`Compraste a ${res.bought.name} por ${res.cost} pts`);
    } catch (e) {
      setMsg(e.message || "No se pudo comprar");
    }
  }

  function onEquip(slot) {
    try {
      const lastBought = user?.roster?.slice(-1)[0];
      if (!lastBought) throw new Error("No tenés un pokémon recién comprado");
      replaceInTeam(slot, lastBought.id);
      setMsg(`Equipado ${lastBought.name} en slot ${slot + 1}`);
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>Puntos: <strong>{user?.points ?? 0}</strong></div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="pikachu o 25"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={onCheckPrice}>Ver precio</button>
        <button onClick={onBuy} disabled={!price}>Comprar</button>
      </div>

      {price !== null && <div>Precio: <strong>{price} pts</strong></div>}
      {msg && <div>{msg}</div>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[0,1,2,3,4,5].map((i) => (
          <button key={i} onClick={() => onEquip(i)}>Equipar en {i+1}</button>
        ))}
      </div>
    </div>
  );
}
