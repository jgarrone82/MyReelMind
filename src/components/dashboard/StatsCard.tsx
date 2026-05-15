interface StatsCardProps {
  label: string;
  value: number | string;
  size?: "default" | "large";
}

export function StatsCard({ label, value, size = "default" }: StatsCardProps) {
  const valueSizeClass = size === "large" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex flex-col rounded-lg border border-primary bg-primary p-6 shadow-sm min-h-[44px]">
      <span className="text-sm font-medium text-secondary">{label}</span>
      <span className={`${valueSizeClass} font-bold text-primary`}>
        {value}
      </span>
    </div>
  );
}