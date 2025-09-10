import React from "react";
import { useNavigate } from "react-router-dom";
import type { SavedPlan } from "shared/types";
import { CalendarIcon, TrashIcon, SparklesIcon } from "@/assets/icons";

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
  const navigate = useNavigate();

  if (plans.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-md border border-slate-700 w-full max-w-2xl">
        <SparklesIcon className="w-12 h-12 text-sky-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Ready for Your Next Adventure?
        </h2>
        <p className="text-slate-400 mb-6">
          Your saved plans will appear here. Let's create your first AI-architected weekend!
        </p>
        <button
          onClick={() => navigate('/newplan')}
          className="bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-700 transition-colors"
        >
          Create a New Plan
        </button>
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">
          My Saved Weekend Plans
        </h2>
        <button
          onClick={() => navigate('/newplan')}
          className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors"
        >
          <SparklesIcon className="w-5 h-5" />
          <span>New Plan</span>
        </button>
      </div>
      <div className="space-y-4">
        {plans.map((plan) => (
          <div
            key={plan._id}
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
                aria-label={`Delete plan: ${getPlanTitle(plan)}`}
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