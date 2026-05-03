interface StatsCardProps {
  label: string;
  value: number | string;
  size?: "default" | "large";
}

export function StatsCard({ label, value, size = "default" }: StatsCardProps) {
  const valueSizeClass = size === "large" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm min-h-[44px]">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className={`${valueSizeClass} font-bold text-gray-900`}>
        {value}
      </span>
    </div>
  );
}