import { useEffect } from "react";
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

const Toast = ({ id, message, type = "info", duration = 3500, onClose }) => {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const style = typeStyles[type] || typeStyles.info;
  const IconComponent = style.icon;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 min-w-[280px] max-w-[380px] pointer-events-auto"
      style={{
        background: style.bg,
        borderRadius: "16px",
        boxShadow:
          "0 10px 40px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
        border: style.border,
        animation: "toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
        style={{ background: `${style.accent}18` }}
      >
        <IconComponent
          className="w-4.5 h-4.5"
          style={{ color: style.accent }}
        />
      </div>

      <p className="flex-1 text-sm font-medium text-gray-800 leading-snug pt-1.5">
        {message}
      </p>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-black/5 transition mt-0.5"
        aria-label="Close"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
