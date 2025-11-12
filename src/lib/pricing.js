export const PRICING = {
  MIN_COST: 10,
  MAX_COST: 120,
  LEGENDARY_THRESHOLD: 530, // ~tier alto (total base stats)
  LEGENDARY_MULT: 1.25,
  DUAL_TYPE_BONUS: 1.05,    // +5% si tiene dos tipos
};

export function baseStatsTotal(detail) {
  // detail.stats = [{ base_stat, stat: { name }}, ...]
  return (detail?.stats || []).reduce((acc, s) => acc + (s.base_stat || 0), 0);
}

export function computePokemonCost(detail) {
  const total = baseStatsTotal(detail); // típico rango ~ 250..700
  const minT = 300, maxT = 700; // normalizá a tu gusto
  const clamped = Math.max(minT, Math.min(maxT, total));
  const norm = (clamped - minT) / (maxT - minT); // 0..1

  // costo base lineal
  let cost = Math.round(
    PRICING.MIN_COST + norm * (PRICING.MAX_COST - PRICING.MIN_COST)
  );

  // bonus por dual type leve
  const dualType = (detail?.types?.length || 0) > 1;
  if (dualType) cost = Math.round(cost * PRICING.DUAL_TYPE_BONUS);

  // multiplicador “legendario” por umbral de total alto
  if (total >= PRICING.LEGENDARY_THRESHOLD) {
    cost = Math.round(cost * PRICING.LEGENDARY_MULT);
  }

  return cost;
}
