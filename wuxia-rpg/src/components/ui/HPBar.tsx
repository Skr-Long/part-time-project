interface Props {
  current: number;
  max: number;
  label?: string;
}

export function HPBar({ current, max, label = '气血' }: Props) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = percent > 50 ? '#4a7c59' : percent > 25 ? '#eab308' : '#dc2626';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span style={{ color: '#4a4a4a' }}>{label}</span>
        <span className="font-bold" style={{ color: '#1a1a1a' }}>{current}/{max}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden border" style={{ backgroundColor: '#d1d5db', borderColor: '#4a4a4a' }}>
        <div className="h-full transition-all duration-300" style={{ width: `${percent}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}
