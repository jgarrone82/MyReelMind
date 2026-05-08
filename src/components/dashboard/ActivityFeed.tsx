import Link from "next/link";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";
import type { Dictionary } from "@/i18n/types";
import { ActivityItem } from "./ActivityItem";

interface ActivityFeedProps {
  activities: UserMediaWithMedia[];
  dict: Dictionary["dashboard"];
  mediaDict: Dictionary["media"];
  lang: string;
}

export function ActivityFeed({ activities, dict, mediaDict, lang }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">{dict.noActivity}</p>
        <Link
          href={`/${lang}/search`}
          className="mt-2 inline-block text-sm text-blue-600 hover:underline min-h-[44px]"
        >
          {dict.ctaSearch}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {dict.recentActivity}
        </h2>
      </div>
      <div className="divide-y divide-gray-100 px-4">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} dict={mediaDict} lang={lang} />
        ))}
      </div>
    </div>
  );
}
