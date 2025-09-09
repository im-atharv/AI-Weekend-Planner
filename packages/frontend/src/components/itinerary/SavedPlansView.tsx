import React from "react";
import type { SavedPlan } from "shared/types";
import { CalendarIcon, TrashIcon } from "@/assets/icons";

interface SavedPlansViewProps {
  plans: SavedPlan[];
  onSelectPlan: (plan: SavedPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  plans,
  onSelectPlan,
  onDeletePlan,
}) => {
  if (plans.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-md border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2">
          No Saved Plans Yet
        </h2>
        <p className="text-slate-400">
          When you create a weekend plan you love, save it here to access it
          later.
        </p>
      </div>
    );
  }

  const getPlanTitle = (plan: SavedPlan) => {
    if (plan.title) {
      return plan.title;
    }
    if (plan.itinerary && plan.itinerary.length > 0) {
      return `Plan for ${plan.itinerary[0].day}`;
    }
    return "Saved Itinerary";
  };

  const getPlanSummary = (plan: SavedPlan) => {
    const interests = plan.preferences.interests.join(", ");
    const vibe = plan.preferences.vibe;
    return `A ${vibe} weekend focused on: ${interests}.`;
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        My Saved Weekend Plans
      </h2>
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center transition-all hover:border-sky-500/50"
          >
            <div>
              <h3 className="text-lg font-semibold text-white">
                {getPlanTitle(plan)}
              </h3>
              <p className="text-sm text-slate-400">{getPlanSummary(plan)}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {new Date(
                    plan.preferences.dates.start + "T00:00:00"
                  ).toDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSelectPlan(plan)}
                className="px-3 py-1.5 text-sm font-semibold bg-sky-600 text-white rounded-md hover:bg-sky-700"
              >
                View
              </button>
              <button
                onClick={() => onDeletePlan(plan._id)}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-md"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};