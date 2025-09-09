import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChatView } from "@/components/chat/ChatView";
import { continueItineraryChat, initializeChatFromPlan } from "@/services/geminiService";
import { getPlanById, savePlan, updatePlan } from "@/api";
import type { Chat } from "@google/genai";
import type { ChatMessage, User, SavedPlan, Itinerary } from "shared/types";
import { Loader } from "@/components/common/Loader";

interface ChatPageProps {
  user: User | null;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  onLoginRequest: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ user, showToast, onLoginRequest }) => {
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

  // Load plan either from DB or from navigation state
  useEffect(() => {
    const loadPlan = async () => {
      setIsPageLoading(true);
      try {
        let plan: SavedPlan | Itinerary;
        if (planId) {
          // Permanent URL → fetch from DB
          plan = await getPlanById(planId);
          setIsPlanSaved(true);
        } else if (location.state?.plan) {
          // Temporary URL → use navigation state
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

    loadPlan();
  }, [planId, location.state, navigate, showToast]);

  // Handle sending a new user message
  const handleSendMessage = async (message: string) => {
    if (!chatRef.current || !currentPlan) return;

    setUserMessages(prev => [...prev, { role: "user", content: message }]);
    setIsLoading(true);
    setError(null);

    try {
      const { updatedItinerary } = await continueItineraryChat(
        chatRef.current,
        message,
        "preferences" in currentPlan ? currentPlan.preferences : undefined
      );

      const newPlanState = planId
        ? { ...updatedItinerary, _id: (currentPlan as SavedPlan)._id }
        : { ...currentPlan, ...updatedItinerary };

      setCurrentPlan(newPlanState);
      setIsPlanSaved(false);
      setUserMessages([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setError(`Failed to update itinerary: ${errorMessage}`);
      setUserMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving plan (new or update)
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
        // Update existing plan
        savedPlanResponse = await updatePlan(planId, currentPlan);
        showToast("Plan updated successfully!", "success");
      } else {
        // Create new plan
        savedPlanResponse = await savePlan(user.email, currentPlan);
        showToast("Plan saved successfully!", "success");
        // Switch to permanent URL
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

  // Memoize chat messages
  const chatMessages = useMemo<ChatMessage[]>(() => {
    if (!currentPlan) return [];
    return [{ role: "model", content: currentPlan }, ...userMessages];
  }, [currentPlan, userMessages]);

  if (isPageLoading) {
    return <Loader progress={50} />;
  }

  if (!currentPlan) {
    return (
      <div className="text-center text-red-400">
        Could not load plan. Please try again.
      </div>
    );
  }

  return (
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
    />
  );
};
