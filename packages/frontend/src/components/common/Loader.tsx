import React, { useState, useEffect } from "react";
import { SparklesIcon } from "@/assets/icons";

const messages = [
  "Consulting with local experts...",
  "Finding the most exclusive events...",
  "Aligning the stars for your perfect weekend...",
  "Crafting your personalized experience...",
  "Sourcing hidden gems and local favorites...",
  "Architecting your escape...",
];

interface LoaderProps {
  progress: number;
}

export const Loader: React.FC<LoaderProps> = ({ progress }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-center p-8 flex flex-col items-center justify-center animate-fade-in w-full max-w-2xl">
      <SparklesIcon className="w-12 h-12 text-sky-500 animate-pulse mb-6" />
      <h3 className="text-2xl font-bold text-white mb-2">
        Your AI Architect is at Work
      </h3>
      <p className="text-slate-400 text-lg transition-opacity duration-500 mb-8">
        {messages[messageIndex]}
      </p>

      <div className="w-full bg-slate-700 rounded-full h-4 border border-slate-600 overflow-hidden">
        <div
          className="bg-sky-500 h-full rounded-full transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-white font-bold text-xl mt-4">
        {Math.round(progress)}%
      </p>
    </div>
  );
};