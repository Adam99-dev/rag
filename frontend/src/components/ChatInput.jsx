import { theme } from "../theme";
import { Icon } from "./Icons";

const ChatInput = ({ msg, setMsg, sendMsg, disabled = false, selectedName }) => {
  return (
    <div className="flex-shrink-0 p-3 border-t border-gray-200/50">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMsg()}
          disabled={disabled}
          placeholder={`Ask about ${selectedName}...`}
          className="flex-1 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/25 placeholder:text-gray-400 disabled:opacity-60"
          style={theme.input}
        />
        <button
          onClick={sendMsg}
          disabled={!msg.trim() || disabled}
          className="w-11 h-11 flex items-center justify-center text-white rounded-xl transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          style={theme.primary}
        >
          <Icon.Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
