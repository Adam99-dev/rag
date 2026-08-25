import { theme } from "../theme";
import { Icon } from "./Icons";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatArea = ({
  selected,
  isMobile,
  setMobileView,
  chat,
  typing,
  loading,
  openSources,
  toggleSources,
  msg,
  setMsg,
  sendMsg,
}) => {
  return (
    <main
      className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden m-3 ml-3"
      style={{ ...theme.panel, borderRadius: "20px" }}
    >
      {!selected ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-xs">
            <Icon.AI className="w-32 h-32 mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1.5">
              Welcome to DocuMind AI
            </h3>
            <p className="text-sm text-gray-500">
              Upload a document and select it to start asking questions.
            </p>
          </div>
        </div>
      ) : (
        <>
          <ChatHeader
            selected={selected}
            isMobile={isMobile}
            onBack={() => setMobileView("docs")}
          />
          <MessageList
            messages={chat[selected.id] || []}
            selectedName={selected.name}
            typing={typing || loading}
            openSources={openSources}
            toggleSources={toggleSources}
          />
          <ChatInput
            msg={msg}
            setMsg={setMsg}
            sendMsg={sendMsg}
            selectedName={selected.name}
          />
        </>
      )}
    </main>
  );
};

export default ChatArea;
