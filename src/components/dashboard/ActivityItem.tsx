import Link from "next/link";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";
import type { Dictionary } from "@/i18n/types";

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

interface ActivityItemProps {
  activity: UserMediaWithMedia;
  dict: Dictionary["media"];
  lang: string;
}

export function ActivityItem({ activity, dict, lang }: ActivityItemProps) {
  const mediaTitle = activity.mediaItem?.title ?? dict.status.want_to_watch;
  const mediaId = activity.mediaItem?.id;
  const mediaHref = mediaId ? `/${lang}/media/${mediaId}` : null;

  return (
    <div className="flex items-center gap-3 py-3 min-h-[44px]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {mediaHref ? (
            <Link href={mediaHref} className="hover:underline">
              {mediaTitle}
            </Link>
          ) : (
            mediaTitle
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {dict.status[activity.status]}
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
