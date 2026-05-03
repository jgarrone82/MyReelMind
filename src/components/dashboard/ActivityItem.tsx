import Link from "next/link";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "hace un momento";
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  return `hace ${diffDays}d`;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    want_to_watch: "Quiero ver",
    watching: "Viendo",
    completed: "Completado",
    paused: "Pausado",
    dropped: "Abandonado",
  };
  return labels[status] ?? status;
}

interface ActivityItemProps {
  activity: UserMediaWithMedia;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const mediaTitle = activity.mediaItem?.title ?? "Unknown";
  const mediaId = activity.mediaItem?.id;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {mediaId ? (
            <Link href={`/${mediaId}`} className="hover:underline">
              {mediaTitle}
            </Link>
          ) : (
            mediaTitle
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {getStatusLabel(activity.status)}
          </span>
          {activity.progress > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">
                {activity.progress}
              </span>
            </>
          )}
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(new Date(activity.updatedAt))}
          </span>
        </div>
      </div>
    </div>
  );
}