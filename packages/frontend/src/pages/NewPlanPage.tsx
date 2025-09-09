import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PreferenceForm } from "@/components/preferences/PreferenceForm";
import { Loader } from "@/components/common/Loader";
import { startItineraryChat } from "@/services/geminiService";
import { savePlan } from "@/api";
import type { Preferences, User } from "shared/types";

interface NewPlanPageProps {
  user: User | null;
  onLoginRequest: () => void;
}

export const NewPlanPage: React.FC<NewPlanPageProps> = ({ user, onLoginRequest }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleGenerateItinerary = async (prefs: Preferences) => {
    if (!user) {
      onLoginRequest();
      return;
    }
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // Progress simulation
      progressIntervalRef.current = window.setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 99) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return 99;
          }
          const increment = (100 - prev) / 20;
          return Math.min(prev + increment, 99);
        });
      }, 250);

      const { chat, initialItinerary } = await startItineraryChat(prefs);

      const history = await chat.getHistory();

      const savedPlan = await savePlan(user.email, initialItinerary);

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setLoadingProgress(100);

      setTimeout(() => {
        // Pass the fetched history to the new route
        navigate(`/chat/${savedPlan._id}`, { state: { history } });
      }, 500);

    } catch (err) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate itinerary. ${errorMessage}`);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  if (isLoading) {
    return <Loader progress={ loadingProgress } />;
  }

  if (error) {
    return (
      <div className= "text-center p-8 bg-slate-800 rounded-lg shadow-md border border-slate-700 w-full max-w-2xl" >
      <p className="text-red-400 text-lg" > { error } </p>
        < button
    onClick = {() => {
  setError(null);
  setIsLoading(false);
}}
className = "mt-6 bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-700"
  >
  Try Again
    </button>
    </div>
    );
  }

return (
  <>
  <div className= "w-full max-w-3xl text-center" >
  <h2 className="text-3xl md:text-5xl font-bold text-white mb-3" >
    Your Personal AI Weekend Architect
      </h2>
      < p className = "text-lg md:text-xl text-slate-400 mb-8" >
        Tell us your preferences, and we'll craft a bespoke weekend itinerary.
          </p>
          </div>
          < div className = "w-full max-w-4xl" >
            <PreferenceForm onSubmit={ handleGenerateItinerary } />
              </div>
              </>
  );
};
