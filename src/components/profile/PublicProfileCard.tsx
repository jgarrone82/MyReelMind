import Image from "next/image";

interface UserStats {
  total: number;
  completed: number;
  watching: number;
}

interface PublicProfileCardProps {
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  stats: UserStats;
  dict: {
    items: string;
    completed: string;
    watching: string;
  };
}

export function PublicProfileCard({ user, stats, dict }: PublicProfileCardProps) {
  const initials = getInitials(user.displayName);

  return (
    <div className="flex items-start gap-6">
      {/* Avatar */}
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={user.displayName ?? ""}
          width={80}
          height={80}
          className="h-20 w-20 rounded-[2px] border-2 border-[var(--vhs-ground-3)] object-cover shadow-[3px_3px_0_rgba(0,0,0,0.8)]"
        />
      ) : (
        <div className="vhs-display flex h-20 w-20 items-center justify-center rounded-[2px] border-2 border-[var(--vhs-ground-3)] bg-[var(--vhs-ground-3)] text-xl text-[var(--vhs-cream)] shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1">
        <h1 className="vhs-display m-0 text-[clamp(1.5rem,4vw,2rem)] text-[var(--vhs-cream)]">
          {user.displayName ?? "Anonymous"}
        </h1>

        {/* Stats */}
        <div className="mt-4 flex gap-6">
          <StatCounter value={stats.total} label={dict.items} />
          <StatCounter value={stats.completed} label={dict.completed} />
          <StatCounter value={stats.watching} label={dict.watching} />
        </div>
      </div>
    </div>
  );
}

function StatCounter({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="vhs-display text-2xl text-[var(--vhs-cream)]">{value}</p>
      <p className="vhs-kicker text-[0.72rem] text-[var(--vhs-cream-dim)]">
        {label}
      </p>
    </div>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}