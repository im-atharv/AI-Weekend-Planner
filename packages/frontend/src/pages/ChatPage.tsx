import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChatView } from "@/components/chat/ChatView";
import { continueItineraryChat, getAlternativeActivity, initializeChatFromPlan } from "@/services/geminiService";
import { getPlanById, savePlan, updatePlan } from "@/api";
import type { Chat } from "@google/genai";
import type { ChatMessage, User, SavedPlan, Itinerary, DayPlan } from "shared/types";
import { SparklesIcon } from "@/assets/icons";
import { AlternativeSuggestionModal } from "@/components/chat/AlternativeSuggestionModal";

interface ChatPageProps {
  user: User | null;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  onLoginRequest: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  user,
  showToast,
  onLoginRequest,
}) => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPlan, setCurrentPlan] = useState<SavedPlan | Itinerary | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);
  const chatRef = useRef<Chat | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [activityToReplace, setActivityToReplace] = useState<{
    dayIndex: number;
    activityIndex: number;
    activityTitle: string;
    day: string;
  } | null>(null);
  const [scrollToActivity, setScrollToActivity] = useState<{ day: number; activity: number } | null>(null);
  const [isReplacing, setIsReplacing] = useState<{ dayIndex: number; activityIndex: number } | null>(null);
  const [isAlternativeUpdate, setIsAlternativeUpdate] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadPlan = async () => {
      setIsPageLoading(true);
      try {
        let plan: SavedPlan | Itinerary;
        if (planId) {
          plan = await getPlanById(planId);
          setIsPlanSaved(true);
        } else if (location.state?.plan) {
          plan = location.state.plan;
          setIsPlanSaved(false);
        } else {
          navigate("/newplan");
          return;
        }
        setCurrentPlan(plan);
        chatRef.current = initializeChatFromPlan(plan, location.state?.history);
      } catch (err) {
        console.error("Failed to load plan:", err);
        showToast("Could not load the requested plan.", "error");
        navigate("/plans");
      } finally {
        setIsPageLoading(false);
      }
    };

    if (planId || location.state?.plan) {
      loadPlan();
    } else {
      navigate("/newplan");
    }
  }, [planId, location.state, navigate, showToast]);

  useEffect(() => {
    if (currentPlan && !isAlternativeUpdate) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if(isAlternativeUpdate) {
        setIsAlternativeUpdate(false);
    }
  }, [currentPlan, isAlternativeUpdate]);

  useEffect(() => {
    if (scrollToActivity && currentPlan) {
      const elementId = `activity-${scrollToActivity.day}-${scrollToActivity.activity}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setScrollToActivity(null);
    }
  }, [currentPlan, scrollToActivity]);


  const handleSendMessage = async (message: string) => {
    if (!chatRef.current || !currentPlan) return;

    setUserMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);
    setError(null);

    try {
      const { updatedItinerary } = await continueItineraryChat(
        chatRef.current,
        message,
        currentPlan.preferences
      );

      setCurrentPlan(updatedItinerary);
      setIsPlanSaved(false);
      setUserMessages([]);

    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : "An error occurred.";
      if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("overloaded")) {
        errorMessage = "Our AI architect is currently busy. Please try your request again in a moment.";
      }
      setError(errorMessage);
      setUserMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSuggestionModal = (dayIndex: number, activityIndex: number) => {
    if (!currentPlan) return;
    const activity = currentPlan.itinerary[dayIndex].activities[activityIndex];
    const day = currentPlan.itinerary[dayIndex].day;
    setActivityToReplace({
      dayIndex,
      activityIndex,
      activityTitle: activity.title,
      day,
    });
    setIsSuggestionModalOpen(true);
  };

  const handleSuggestAlternative = async (preference: string) => {
    if (!activityToReplace || !currentPlan) return;

    setScrollToActivity({ day: activityToReplace.dayIndex, activity: activityToReplace.activityIndex });
    setIsReplacing({ dayIndex: activityToReplace.dayIndex, activityIndex: activityToReplace.activityIndex });
    setIsSuggestionModalOpen(false);

    try {
      setIsAlternativeUpdate(true);
      const dayPlan = currentPlan.itinerary[activityToReplace.dayIndex];
      const result = await getAlternativeActivity(
        currentPlan.preferences,
        dayPlan,
        activityToReplace.activityIndex,
        preference,
        currentPlan.totalEstimatedCost || "N/A"
      );
      
      setCurrentPlan(prevPlan => {
          if(!prevPlan) return null;
          const newPlan = JSON.parse(JSON.stringify(prevPlan));

          newPlan.totalEstimatedCost = result.updatedTotalCost;
          newPlan.itinerary[activityToReplace.dayIndex].activities[activityToReplace.activityIndex] = result.replacementActivity;
        
          const nextActivityIndex = activityToReplace.activityIndex + 1;
          if (result.nextActivityTravelInfo && newPlan.itinerary[activityToReplace.dayIndex].activities[nextActivityIndex]) {
            newPlan.itinerary[activityToReplace.dayIndex].activities[nextActivityIndex].travelInfo = result.nextActivityTravelInfo;
          }
          return newPlan
      });


      setIsPlanSaved(false);
      showToast("Activity has been replaced!", "success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not find a replacement.";
      showToast(errorMessage, "error");
      setIsAlternativeUpdate(false); 
    } finally {
      setIsReplacing(null);
      setActivityToReplace(null);
    }
  };

  const handleSavePlan = async () => {
    if (!user) {
      onLoginRequest();
      return;
    }
    if (!currentPlan || isSaving || isPlanSaved) return;

    setIsSaving(true);
    try {
      let savedPlanResponse: SavedPlan;
      if (planId) {
        savedPlanResponse = await updatePlan(planId, currentPlan);
        showToast("Plan updated successfully!", "success");
      } else {
        savedPlanResponse = await savePlan(user.email, currentPlan);
        showToast("Plan saved successfully!", "success");
        navigate(`/chat/${savedPlanResponse._id}`, { replace: true });
      }
      setCurrentPlan(savedPlanResponse);
      setIsPlanSaved(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save plan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const chatMessages = useMemo<ChatMessage[]>(() => {
    if (!currentPlan) return [];
    return [{ role: "model", content: currentPlan }, ...userMessages];
  }, [currentPlan, userMessages]);

  if (isPageLoading) {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-center p-8 flex flex-col items-center justify-center animate-fade-in w-full max-w-2xl">
        <SparklesIcon className="w-12 h-12 text-sky-500 animate-pulse mb-6" />
        <h3 className="text-2xl font-bold text-white mb-2">
          Loading Your Itinerary
        </h3>
        <p className="text-slate-400">
          Just a moment while we retrieve the details...
        </p>
      </div>
    </div>
  );
}

  if (!currentPlan) {
    return (
      <div className="text-center text-red-400">
        Could not load plan. Please try again.
      </div>
    );
  }

  return (
    <>
      <ChatView
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onReset={() => navigate("/newplan")}
        onSavePlan={handleSavePlan}
        isLoading={isLoading}
        isSaving={isSaving}
        isPlanSaved={isPlanSaved}
        user={user}
        error={error}
        onSuggestAlternative={handleOpenSuggestionModal}
        isReplacing={isReplacing}
      />
      {activityToReplace && (
        <AlternativeSuggestionModal
          isOpen={isSuggestionModalOpen}
          onClose={() => setIsSuggestionModalOpen(false)}
          onSubmit={handleSuggestAlternative}
          activityTitle={activityToReplace.activityTitle}
        />
      )}
    </>
  );
};
