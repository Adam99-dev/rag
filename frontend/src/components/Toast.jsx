import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

const typeStyles = {
  success: {
    accent: "#10b981",
    bg: "linear-gradient(145deg, #ecfdf5, #d1fae5)",
    border: "1px solid rgba(16,185,129,0.25)",
    icon: Icon.Success,
  },
  error: {
    accent: "#ef4444",
    bg: "linear-gradient(145deg, #fef2f2, #fee2e2)",
    border: "1px solid rgba(239,68,68,0.25)",
    icon: Icon.Error,
  },
  info: {
    accent: "#3b82f6",
    bg: "linear-gradient(145deg, #eff6ff, #dbeafe)",
    border: "1px solid rgba(59,130,246,0.25)",
    icon: Icon.Info,
  },
  warning: {
    accent: "#f59e0b",
    bg: "linear-gradient(145deg, #fffbeb, #fef3c7)",
    border: "1px solid rgba(245,158,11,0.25)",
    icon: Icon.Warning,
  },
};

const Toast = ({
  id,
  message,
  type = "info",
  duration = 3500,
  onClose,
  action,
  pauseOnHover = true,
  closeOnClick = true,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(duration);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const startTimer = () => {
    if (duration <= 0) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(handleClose, remainingTimeRef.current);
  };

  const pauseTimer = () => {
    if (!pauseOnHover || isPaused) return;

    setIsPaused(true);
    clearTimeout(timerRef.current);

    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const resumeTimer = () => {
    if (!pauseOnHover || !isPaused) return;

    setIsPaused(false);
    startTimer();
  };

  useEffect(() => {
    if (duration > 0) {
      startTimer();
    }

    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const style = typeStyles[type] || typeStyles.info;
  const IconComponent = style.icon;

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3.5 min-w-[320px] max-w-[420px] pointer-events-auto cursor-pointer select-none
        ${isExiting ? "toast-exit" : "toast-enter"}`}
      style={{
        background: style.bg,
        borderRadius: "16px",
        boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
        border: style.border,
        transform: isPaused ? "scale(0.98)" : "scale(1)",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onClick={closeOnClick ? handleClose : undefined}
      role="alert"
      aria-live="polite"
    >
      <div
        className="relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
        style={{
          background: `${style.accent}18`,
        }}
      >
        <IconComponent className="w-5 h-5" style={{ color: style.accent }} />
      </div>

      <div className="relative flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-snug pt-2 break-words">
          {message}
        </p>
      </div>

      {action ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            action.onClick?.();
            handleClose();
          }}
          className="relative flex-shrink-0 mt-0.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
          style={{
            background: style.accent,
          }}
        >
          {action.label}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-all duration-200 mt-0.5"
          aria-label="Close notification"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;