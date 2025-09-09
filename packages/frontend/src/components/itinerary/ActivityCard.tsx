import React from "react";
import type { Activity } from "shared/types";
import {
  ClockIcon,
  LocationIcon,
  TagIcon,
  TicketIcon,
  SparklesIcon,
  RupeeIcon,
} from "@/assets/icons";

interface ActivityCardProps {
  activity: Activity;
}

const categoryStyles: { [key: string]: { icon: React.ReactElement, classes: string } } = {
    'Dining': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-green-500/10 text-green-400 border border-green-500/20' },
    'Entertainment': { icon: <TicketIcon className="w-4 h-4" />, classes: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
    'Relaxation': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-sky-500/10 text-sky-400 border border-sky-500/20' },
    'Activity': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    'Nightlife': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-pink-500/10 text-pink-400 border border-pink-500/20' },
    'Shopping': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
    'Culture': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
    'History & Heritage': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' },
    'Nature & Parks': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-lime-500/10 text-lime-400 border border-lime-500/20' },
    'Special Event': { icon: <SparklesIcon className="w-4 h-4" />, classes: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
    'Outdoor Activities': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' },
    'Travel': { icon: <TagIcon className="w-4 h-4" />, classes: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
};


export const ActivityCard: React.FC<ActivityCardProps> = React.memo(
  ({ activity }) => {
    const style =
      categoryStyles[activity.category] ||
      ({
        icon: <TagIcon className="w-4 h-4" />,
        classes: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
      } as { icon: React.ReactElement; classes: string });
    const isSpecial = activity.isSpecialEvent;

    const locationText =
      typeof activity.location === "string"
        ? activity.location
        : activity.location.address ||
          activity.location.name ||
          "Location details unavailable";

    return (
      <div className="relative group">
        <div
          className={`absolute -left-[33px] top-2 h-4 w-4 rounded-full border-2 border-slate-800 transition-colors ${
            isSpecial
              ? "bg-rose-500 group-hover:bg-rose-400"
              : "bg-slate-600 group-hover:bg-sky-500"
          }`}
        ></div>
        <div
          className={`bg-slate-800 rounded-lg p-5 shadow-md border transition-all duration-300 ${
            isSpecial
              ? "border-rose-500/40 hover:border-rose-500/60"
              : "border-slate-700 hover:border-sky-500/50 hover:shadow-sky-500/5"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <ClockIcon />
                <span className="font-semibold text-slate-300">
                  {activity.time}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white">{activity.title}</h4>
            </div>
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${style.classes} flex-shrink-0`}
            >
              {style.icon}
              {activity.category}
            </div>
          </div>

          <p className="text-slate-300 my-3">{activity.description}</p>

          <div className="border-t border-slate-700 pt-3 mt-4 flex justify-between items-center flex-wrap gap-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <LocationIcon />
              <span>{locationText}</span>
            </div>
            {activity.estimatedCost && (
              <div className="flex items-center gap-1 text-sm text-green-400 font-semibold">
                <RupeeIcon className="w-4 h-4" />
                <span>{activity.estimatedCost}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);