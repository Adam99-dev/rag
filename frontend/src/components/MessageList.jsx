import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const MessageList = ({
  messages,
  selectedName,
  loading,
  typing,
  openSources,
  toggleSources,
}) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5">
      {loading ? (
        <div className="space-y-3.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
              <div
                className="h-10 rounded-2xl animate-pulse bg-gray-100"
                style={{ width: `${55 - i * 8}%` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1 opacity-70">
                  Ask a question about “{selectedName}”
                </p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              openSources={openSources}
              toggleSources={toggleSources}
            />
          ))}
        </>
      )}

      {typing && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;