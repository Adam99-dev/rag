import { useRef, useEffect } from "react";
import { theme } from "../theme";
import { Icon } from "./Icons";

const ChatInput = ({
  msg,
  setMsg,
  sendMsg,
  disabled = false,
  selectedName,
}) => {
  const textareaRef = useRef(null);
  const MAX_HEIGHT = 160; // px — stops growing beyond this and scrolls

  // Auto-resize the textarea whenever msg changes
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Reset height so scrollHeight is measured correctly
    el.style.height = "auto";

    const nextHeight = Math.min(el.scrollHeight, MAX_HEIGHT);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [msg]);

  const handleKeyDown = (e) => {
    // Enter (without Shift) sends the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && msg.trim()) {
        sendMsg();
        // Reset height after sending
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
    // Shift+Enter falls through to default → inserts a new line
  };

  return (
    <div className="flex-shrink-0 p-3 border-t border-gray-200/50">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={`Ask about ${selectedName}...`}
          className="flex-1 px-4 py-2.5 text-sm resize-none leading-5 focus:outline-none focus:ring-2 focus:ring-blue-400/25 placeholder:text-gray-400 disabled:opacity-60"
          style={{
            ...theme.input,
            maxHeight: `${MAX_HEIGHT}px`,
            overflowY: "hidden",
          }}
        />
        <button
          onClick={sendMsg}
          disabled={!msg.trim() || disabled}
          className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-white rounded-xl transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          style={theme.primary}
        >
          <Icon.Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
