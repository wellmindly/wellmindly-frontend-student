interface DimensionBarProps {
  label: string;
  status: string;
  statusColor: string;
  barColor: string;
  width: string;
}

export function DimensionBar({
  label,
  status,
  statusColor,
  barColor,
  width,
}: DimensionBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="font-semibold text-ink-700">{label}</span>
        <span className={`font-bold ${statusColor}`}>{status}</span>
      </div>
      <div className="w-full bg-ink-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}
