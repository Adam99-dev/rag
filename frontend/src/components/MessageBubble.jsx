import ReactMarkdown from "react-markdown";
import { Icon } from "./Icons";

const markdownStyles = `
  .ai-markdown h1, .ai-markdown h2, .ai-markdown h3 {
    font-weight: 600;
    margin: 12px 0 6px;
    color: #1e293b;
  }
  .ai-markdown h1 { font-size: 1.2em; }
  .ai-markdown h2 { font-size: 1.1em; }
  .ai-markdown h3 { font-size: 1em; }
  .ai-markdown strong {
    font-weight: 600;
    color: #0f172a;
  }
  .ai-markdown ul, .ai-markdown ol {
    margin: 6px 0;
    padding-left: 18px;
  }
  .ai-markdown li {
    margin: 3px 0;
  }
  .ai-markdown p {
    margin: 6px 0;
  }
  .ai-markdown code {
    background: #f1f5f9;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 0.85em;
  }
`;

const MessageBubble = ({ message, openSources, toggleSources }) => {
  const isUser = message.role === "user";

  return (
    <>
      <style>{markdownStyles}</style>
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 ${
            isUser
              ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
              : "bg-white/90 text-gray-800 rounded-2xl rounded-bl-md"
          }`}
          style={{
            boxShadow: isUser
              ? "0 4px 16px rgba(37,99,235,0.22)"
              : "0 4px 18px rgba(0,0,0,0.07)",
          }}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-sm leading-relaxed ai-markdown">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {message.isTyping && (
            <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse align-middle" />
          )}

          {message.createdAt && (
            <div
              className={`mt-2 flex items-center gap-1 text-[10px] ${
                isUser ? "text-blue-200" : "text-gray-400"
              }`}
            >
              <Icon.Clock className="w-3 h-3" />
              <span>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {message.citations?.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-gray-200/60">
              <button
                type="button"
                onClick={() => toggleSources(message.id)}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span>Sources</span>
                <Icon.ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    openSources[message.id] ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSources[message.id] && (
                <div className="mt-1.5">
                  {message.citations.map((c, i) => (
                    <div
                      key={i}
                      className="text-xs text-gray-500 flex items-start gap-1.5 mb-0.5"
                    >
                      <Icon.Database className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
                      <span>{c.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageBubble;
