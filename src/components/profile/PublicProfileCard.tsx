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
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">
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
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
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