export interface CurrencyDisplay {
  gold: number;
  silver: number;
  copper: number;
  formatted: string;
}

export function convertCurrency(copper: number): CurrencyDisplay {
  const gold = Math.floor(copper / 1000);
  const silver = Math.floor((copper % 1000) / 10);
  const copperLeft = copper % 10;
  const parts: string[] = [];
  if (gold > 0) parts.push(`${gold}金`);
  if (silver > 0) parts.push(`${silver}银`);
  if (copperLeft > 0 || parts.length === 0) parts.push(`${copperLeft}铜`);
  return {
    gold,
    silver,
    copper: copperLeft,
    formatted: parts.join(' '),
  };
}

export function getCurrencyColor(copper: number): string {
  if (copper >= 1000) return 'text-[var(--color-gold)]';
  if (copper >= 10) return 'text-gray-500';
  return 'text-amber-700';
}
