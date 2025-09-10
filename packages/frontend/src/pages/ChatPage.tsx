import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChatView } from "@/components/chat/ChatView";
import { continueItineraryChat, initializeChatFromPlan } from "@/services/geminiService";
import { getPlanById, savePlan, updatePlan } from "@/api";
import type { Chat } from "@google/genai";
import type { ChatMessage, User, SavedPlan, Itinerary, DayPlan } from "shared/types";
import { Loader } from "@/components/common/Loader";
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

  const [currentPlan, setCurrentPlan] = useState<SavedPlan | Itinerary | null>(
    null
  );
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

  useEffect(() => {
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

    if (!user && !location.state?.plan) {
      navigate("/newplan");
    } else {
      loadPlan();
    }
  }, [planId, location.state, navigate, showToast, user]);

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

      // Create a stable copy of the current state
      const newPlanState = JSON.parse(
        JSON.stringify(currentPlan)
      ) as Itinerary;

      // Safely merge top-level properties from the AI's response
      newPlanState.title = updatedItinerary.title || newPlanState.title;
      newPlanState.totalEstimatedCost =
        updatedItinerary.totalEstimatedCost || newPlanState.totalEstimatedCost;
      newPlanState.sources = updatedItinerary.sources || newPlanState.sources;

      // Safely merge the itinerary day by day to preserve day/theme keys
      if (
        updatedItinerary.itinerary &&
        Array.isArray(updatedItinerary.itinerary)
      ) {
        newPlanState.itinerary = newPlanState.itinerary.map(
          (oldDayPlan: DayPlan, index: number) => {
            const newDayPlan = updatedItinerary.itinerary[index];
            // If the new plan data for this day exists, merge it over the old one
            return newDayPlan ? { ...oldDayPlan, ...newDayPlan } : oldDayPlan;
          }
        );
      }

      setCurrentPlan(newPlanState);
      setIsPlanSaved(false);
      setUserMessages([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred.";
      setError(`Failed to update itinerary: ${errorMessage}`);
      setUserMessages((prev) => prev.slice(0, -1)); // Restore user message on failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSuggestionModal = (
    dayIndex: number,
    activityIndex: number
  ) => {
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

  const handleSuggestAlternative = (preference: string) => {
    if (!activityToReplace) return;

    const { activityTitle, day } = activityToReplace;
    const prompt = `Please replace the activity "${activityTitle}" on ${day} with an alternative that is more like "${preference}". Keep all other activities the same, but update the travel info and total cost as needed.`;

    handleSendMessage(prompt);
    setIsSuggestionModalOpen(false);
    setActivityToReplace(null);
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
      showToast(
        err instanceof Error ? err.message : "Failed to save plan.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const chatMessages = useMemo<ChatMessage[]>(() => {
    if (!currentPlan) return [];
    return [{ role: "model", content: currentPlan }, ...userMessages];
  }, [currentPlan, userMessages]);

  if (isPageLoading) {
    return <Loader progress={ 50 } />;
  }

  if (!currentPlan) {
    return (
      <div className= "text-center text-red-400" >
      Could not load plan.Please try again.
      </div>
    );
  }

return (
  <>
  <ChatView
        messages= { chatMessages }
onSendMessage = { handleSendMessage }
onReset = {() => navigate("/newplan")}
onSavePlan = { handleSavePlan }
isLoading = { isLoading }
isSaving = { isSaving }
isPlanSaved = { isPlanSaved }
user = { user }
error = { error }
onSuggestAlternative = { handleOpenSuggestionModal }
  />
  { activityToReplace && (
    <AlternativeSuggestionModal
          isOpen={ isSuggestionModalOpen }
onClose = {() => setIsSuggestionModalOpen(false)}
onSubmit = { handleSuggestAlternative }
activityTitle = { activityToReplace.activityTitle }
  />
      )}
</>
  );
};