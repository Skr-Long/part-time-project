import { convertCurrency } from '../../utils/currency';

interface Props {
  copper: number;
  className?: string;
}

export function CurrencyDisplay({ copper, className = '' }: Props) {
  const { formatted } = convertCurrency(copper);
  let color = '#b45309';
  if (copper >= 1000) color = '#c9a227';
  else if (copper >= 10) color = '#6b7280';
  return <span className={`font-bold ${className}`} style={{ color }}>{formatted}</span>;
}
