import React, { useState, useRef, useEffect } from "react";
import type {
  Itinerary,
  ChatMessage,
  Activity,
  GroundingMetadataSource,
  User,
} from "shared/types";
import { ActivityCard } from "@/components/itinerary/ActivityCard";
import {
  BackIcon,
  SendIcon,
  CarIcon,
  SaveIcon,
  InfoIcon,
  RupeeIcon,
  CheckCircleIcon,
} from "@/assets/icons";

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onReset: () => void;
  onSavePlan: () => void;
  isLoading: boolean;
  isSaving: boolean;
  isPlanSaved: boolean;
  user: User | null;
  error: string | null;
  onSuggestAlternative: (dayIndex: number, activityIndex: number) => void;
}

const TravelInfoComponent: React.FC<{ info: Activity["travelInfo"] }> = ({ info }) => {
  if (!info) return null;
  return (
    <div className="relative h-16">
      <div className="absolute left-[8px] h-full border-l-2 border-dotted border-slate-600"></div>
      <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 flex items-center gap-3 pl-8">
        <div className="bg-slate-700 p-2 rounded-full border border-slate-600">
          <CarIcon className="w-5 h-5 text-sky-400" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-slate-300">{info.mode}</p>
          <p className="text-slate-400">{info.duration}</p>
        </div>
      </div>
    </div>
  );
};

const SourceInfo: React.FC<{ sources?: GroundingMetadataSource[] }> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
        <InfoIcon className="w-4 h-4" />
        <span>Information Sources</span>
      </h5>
      <ul className="list-disc pl-5 space-y-1">
        {sources.map((source, index) => (
          <li key={index} className="text-xs text-slate-400">
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 hover:underline truncate block"
            >
              {source.title || source.uri}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ItineraryMessage: React.FC<{
  itinerary: Itinerary;
  onSuggestAlternative: (dayIndex: number, activityIndex: number) => void;
}> = ({ itinerary, onSuggestAlternative }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {itinerary.title}
        </h2>
        {itinerary.totalEstimatedCost && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 text-green-300 font-bold border border-green-500/20 text-lg px-4 py-2 rounded-full">
            <RupeeIcon className="w-6 h-6" />
            <span>{itinerary.totalEstimatedCost}</span>
          </div>
        )}
      </div>
      <div className="relative border-l-2 border-slate-700">
        {itinerary.itinerary.map((dayPlan, dayIndex) => (
          <React.Fragment key={dayIndex}>
            <div className="relative pl-8 pb-8 pt-4">
              <div className="absolute -left-[11px] top-4 h-5 w-5 rounded-full bg-slate-900 border-2 border-sky-500" />
              <h3 className="text-2xl font-bold text-white">{dayPlan.day}</h3>
              <p className="text-sky-400 font-semibold">{dayPlan.theme}</p>
            </div>
            <div className="pl-8">
              {dayPlan.activities.map((activity, activityIndex) => (
                <React.Fragment key={activityIndex}>
                  <TravelInfoComponent info={activity.travelInfo} />
                  <ActivityCard
                    activity={activity}
                    onSuggestAlternative={() =>
                      onSuggestAlternative(dayIndex, activityIndex)
                    }
                  />
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
      <SourceInfo sources={itinerary.sources} />
    </div>
  );
};

const UserMessage = React.memo<{ text: string }>(({ text }) => (
  <div className="flex justify-end">
    <div className="bg-sky-600 text-white p-3 rounded-lg max-w-lg shadow-md">
      {text}
    </div>
  </div>
));

const ChatInput: React.FC<{
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="sticky bottom-4 z-10 mt-8">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isLoading ? "AI Architect is thinking..." : "Ask for changes or suggestions..."
          }
          disabled={isLoading}
          className="w-full pl-4 pr-12 py-3 text-base bg-slate-700 text-slate-200 border border-slate-600 rounded-full shadow-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          aria-label="Chat with AI"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-white bg-sky-600 rounded-full hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onReset,
  onSavePlan,
  isLoading,
  isSaving,
  isPlanSaved,
  user,
  error,
  onSuggestAlternative,
}) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };
  const prevLenRef = useRef(0);
  const prevLoadingRef = useRef(false);

  useEffect(() => {
    const len = messages.length;
    const last = len ? messages[len - 1] : null;
    const isInitialModelOnly =
      len > 0 &&
      messages.every((m) => m.role === "model" && typeof m.content !== "string");
    const listGrew = len > prevLenRef.current;
    const lastIsUser = last && last.role === "user" && typeof last.content === "string";
    const loadingJustStarted = !prevLoadingRef.current && isLoading;

    const shouldScroll =
      !isInitialModelOnly && ((listGrew && lastIsUser) || loadingJustStarted);

    prevLenRef.current = len;
    prevLoadingRef.current = isLoading;

    if (shouldScroll) {
      scrollToBottom("auto");
    }
  }, [messages, isLoading]);

  const hasItinerary = messages.some(
    (msg) => msg.role === "model" && typeof msg.content !== "string"
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sky-400 hover:underline font-semibold"
        >
          <BackIcon />
          <span>Start a New Plan</span>
        </button>
      </div>

      <div className="space-y-6">
        {messages.map((msg, index) => {
          if (msg.role === "model") {
            return typeof msg.content === "string" ? null : (
              <ItineraryMessage
                key={index}
                itinerary={msg.content}
                onSuggestAlternative={onSuggestAlternative}
              />
            );
          }
          return typeof msg.content === "string" ? (
            <UserMessage key={index} text={msg.content} />
          ) : null;
        })}

        {isLoading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-sky-500 rounded-full" />
                <div className="w-2 h-2 bg-sky-500 rounded-full" />
                <div className="w-2 h-2 bg-sky-500 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg max-w-lg shadow-md">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {hasItinerary && !isLoading && (
        <div className="mt-8 text-center border-t border-slate-700 pt-6">
          {isPlanSaved ? (
            <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
              <CheckCircleIcon />
              <span>Plan Saved</span>
            </div>
          ) : (
            <button
              onClick={onSavePlan}
              disabled={isSaving}
              className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon />
              <span>
                {isSaving
                  ? "Saving..."
                  : user
                  ? "Save This Plan"
                  : "Login to Save Plan"}
              </span>
            </button>
          )}
        </div>
      )}

      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};