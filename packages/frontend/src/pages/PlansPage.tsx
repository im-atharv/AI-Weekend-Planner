import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SavedPlansView } from "@/components/itinerary/SavedPlansView";
import { deletePlan, getSavedPlans } from "@/api";
import type { User, SavedPlan } from "shared/types";
import { Loader } from "@/components/common/Loader";

interface PlansPageProps {
  user: User | null;
  onLoginRequest: () => void;
}

export const PlansPage: React.FC<PlansPageProps> = ({ user, onLoginRequest }) => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadPlans = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const data = await getSavedPlans(email);
      setSavedPlans(data);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadPlans(user.email);
    } else {
      setIsLoading(false);
    }
  }, [user, loadPlans]);

  const handleDeletePlan = async (planId: string) => {
    const originalPlans = [...savedPlans];
    setSavedPlans((prev) => prev.filter((p) => p._id !== planId));
    try {
      await deletePlan(planId);
    } catch (err) {
      console.error("Failed to delete plan:", err);
      setSavedPlans(originalPlans);
    }
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    navigate(`/chat/${plan._id}`);
  };
  
  if (isLoading) {
    return <Loader progress={50} />;
  }

  if (!user) {
    return (
        <div className="text-center p-8 bg-slate-800 rounded-lg shadow-md border border-slate-700 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Access Your Plans</h2>
            <p className="text-slate-400 mb-6">Please log in to see your saved weekend plans.</p>
            <button onClick={onLoginRequest} className="bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-700">
                Login
            </button>
      </div>
    );
  }

  return (
    <SavedPlansView
      plans={savedPlans}
      onSelectPlan={handleLoadPlan}
      onDeletePlan={handleDeletePlan}
    />
  );
};