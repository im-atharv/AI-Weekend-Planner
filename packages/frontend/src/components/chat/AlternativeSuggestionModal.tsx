import React, { useEffect, useState } from "react";

interface AlternativeSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preference: string) => void;
  activityTitle: string;
}

export const AlternativeSuggestionModal: React.FC<
  AlternativeSuggestionModalProps
> = ({ isOpen, onClose, onSubmit, activityTitle }) => {
  const [preference, setPreference] = useState("");

  // Lock background scroll when the modal is open
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Close on Escape for better UX
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preference.trim()) {
      onSubmit(preference.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-700 animate-fade-in-fast max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white">
            Find an Alternative
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Replacing: <span className="font-semibold">{activityTitle}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-4">
            <label
              htmlFor="preference"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              What would you prefer instead? (e.g., "a quieter place", "something outdoors")
            </label>
            <input
              id="preference"
              type="text"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder="Keep it brief..."
              className="w-full bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              autoFocus
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!preference.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suggest Alternative
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
