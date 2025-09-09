import React, { useEffect, FC } from "react";
import {
  InfoIcon,
  CloseIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@/assets/icons";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

type IconComponentProps = { className?: string };

interface ToastConfig {
  bg: string;
  border: string;
  text: string;
  Icon: FC<IconComponentProps>;
}

const toastConfig: Record<"success" | "error" | "info", ToastConfig> = {
  success: {
    bg: "bg-green-500/90",
    border: "border-green-400",
    text: "text-white",
    Icon: CheckCircleIcon,
  },
  error: {
    bg: "bg-rose-600/90",
    border: "border-rose-500",
    text: "text-white",
    Icon: ExclamationCircleIcon,
  },
  info: {
    bg: "bg-sky-600/90",
    border: "border-sky-500",
    text: "text-white",
    Icon: InfoIcon,
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const config = toastConfig[type];
  const IconComponent = config.Icon;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-4 p-4 rounded-lg shadow-2xl border ${config.bg} ${config.border} ${config.text} animate-fade-in-fast`}
      role="alert"
      aria-live="assertive"
    >
      <IconComponent className="w-6 h-6 flex-shrink-0" />
      <p className="text-sm font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto -mr-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
};