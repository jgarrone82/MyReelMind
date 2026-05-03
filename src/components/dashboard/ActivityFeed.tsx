import Link from "next/link";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";
import { ActivityItem } from "./ActivityItem";

interface ActivityFeedProps {
  activities: UserMediaWithMedia[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No tenés actividad aún</p>
        <Link
          href="/search"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          Buscá algo para ver
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Actividad reciente
        </h2>
      </div>
      <div className="divide-y divide-gray-100 px-4">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}